import * as React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import spinner from './spinner.gif';
import { subscribe, unsubscribe, publish } from "./events";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

type BatchReading = {
  reading: number;
  tstamp: string;
  abv_pct: number;
}

const GET_BATCH_READINGS = gql`
  query GetBatch($batchId: Int!) {
    batch(id: $batchId) {
      readings {
        reading
        tstamp
      }   
    } 
  }
`;

const ADD_BATCH_READING = gql`
  mutation AddBatchReading($input: BatchReadingInput!) {
    addBatchReading(input: $input) {
      code
      error
      success
    }
  }
`;

const url = process.env.REACT_APP_GRAPHQL_API_URL;

const gqlClient = new ApolloClient({
  uri: url,
  cache: new InMemoryCache(),
});

export function AddBatchReadingDialog ( props: any ) {
  const url = process.env.REACT_APP_CLOUD_FUNCTIONS_URL + '/add_batch_reading';

  const [open, setOpen] = React.useState(false);
  const [reading, setReading] = React.useState('');
  const [errorText, setErrorText] = React.useState('');
  const [ajaxRunning, setAjaxRunning] = React.useState(false);
  const [readingHasError, setReadingHasError] = React.useState(false);
  const [readingHelpText, setReadingHelpText] = React.useState("");
  
  React.useEffect(() => {
      subscribe("addReadingButtonClicked", handleClickOpen);
    
      return () => {
          unsubscribe("addReadingButtonClicked", handleClose);
      }
  }, []);
  
  const handleClickOpen = () => {
    setReading('');
    resetErrors();
    setOpen(true);
  };

  const handleClose = () => {
    setErrorText("");
    setOpen(false);
  };
  
  const resetErrors = () => {
    setReadingHasError(false);
    setReadingHelpText('');
  }
  
  const saveReading = () => {
    var allGood: boolean = true;
    resetErrors();
    
    var readingFloatVal: number = parseFloat(reading);
    
    if (!(readingFloatVal >= 1.000 && readingFloatVal <= 1.1000)) {
        setReadingHasError(true);
        setReadingHelpText("Must be between 1.000 and 1.100");
        allGood = false;
    }
  
    if (allGood) {
        setAjaxRunning(true);
        
        gqlClient
        .mutate({
          mutation: ADD_BATCH_READING,
          variables: {
            "input": {
              "batch_id": props.batchId,
              "reading": readingFloatVal
            },
          },
          awaitRefetchQueries: true,
          refetchQueries: [
            { 
              query: GET_BATCH_READINGS, 
              variables: { "batchId": props.batchId }
            } 
          ],
        }).then((response) => {
            if (response.data.addBatchReading.success) {
                publish('batchReadingAdded', { batchId: props.batchId });
                handleClose();
            } else {
                setErrorText(response.data.addBatchReading.error);
            }
            
            setAjaxRunning(false);
        });
    }
  };
  
  const checkForReturnKey = (event: any) => {
    if (event.charCode === 13) {
        saveReading();
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Reading</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a specific gravity reading.
          </DialogContentText>
          <DialogContentText>
            <span className="errorText">{errorText}</span>
          </DialogContentText>
          <TextField
            error={readingHasError}
            autoFocus
            margin="dense"
            id="reading"
            name="reading"
            label="Specific Gravity Reading"
            value={reading}
            type="text"
            fullWidth
            variant="standard"
            onChange={(newValue) => setReading(newValue.target.value)} 
            helperText={readingHelpText}
            onKeyPress={checkForReturnKey}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {ajaxRunning ? (
            <img src={spinner} width="30" height="30" title="Processing" alt="Processing"/>
          ) : (
            <Button onClick={saveReading}>Submit</Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export function BatchReadingsChart ( props: any ) {
    const initialBatchReadingState: BatchReading[] = [];

    const url = process.env.REACT_APP_CLOUD_FUNCTIONS_URL + '/get_batch_readings';
    const [batchReadings, setBatchReadings] = React.useState(initialBatchReadingState);
    
    React.useEffect(() => {
      subscribe("batchReadingAdded", function ( event: any) {
        // only need to refresh if the event batch id matches our batch id
        if (event.detail.batchId == props.batchId) {
            getBatchReadings();
        }
      });
      
      getBatchReadings();
    
      return () => {
          unsubscribe("batchReadingAdded", () => null);
      }
    }, []);
    
    const getBatchReadings = () => {
      gqlClient
      .query({
        query: GET_BATCH_READINGS,
        variables: {
          "batchId": props.batchId
        }
      }).then((response) => {
        let readings: BatchReading[] = [];
      
        if (response.data.batch.readings.length > 0) {
          var gravityReachedAlertElem = document.getElementById("gravityTargetReached");
          
          if (gravityReachedAlertElem != null) {
            gravityReachedAlertElem.style.display = 'none';
        
        
            var lastReading = response.data.batch.readings.at(-1);
            
            if (lastReading.reading <= props.batchTargetGravity) {
                gravityReachedAlertElem.style.display = 'inline';
            }
          }
          
          for (var i = 0; i < response.data.batch.readings.length; i++) {
            var abvCalc: any = ((props.batchOriginalGravity - response.data.batch.readings[i].reading) * 131.25).toFixed(2);
            
            readings.push({ reading: response.data.batch.readings[i].reading, tstamp: response.data.batch.readings[i].tstamp, abv_pct: abvCalc});
          }
          
          var fermentationPct: any = (((props.batchOriginalGravity - readings[readings.length - 1].reading) / (props.batchOriginalGravity - props.batchTargetGravity)) * 100).toFixed(2);
          
          props.setCurrentGravity(readings[response.data.batch.readings.length - 1].reading);
          props.setCurrentABV(readings[response.data.batch.readings.length - 1].abv_pct);
          props.setCurrentFermentationPct(fermentationPct >= 100 ? 100.00.toFixed(2) : fermentationPct);
          props.setAttenuationPct(
            (((props.batchOriginalGravity - readings[response.data.batch.readings.length - 1].reading) / (props.batchOriginalGravity - 1.0)) * 100).toFixed(2)
          );
        }
        
        setBatchReadings(readings);
      });
    };
    
    return (
        <LineChart width={1000} height={400} data={batchReadings}>
          <Line type="monotone" dataKey="reading" stroke="#ff0000" />
          <Line type="monotone" dataKey="abv_pct" stroke="#000000" yAxisId={1} />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="tstamp" includeHidden={true} />
          <YAxis yAxisId={0} domain={[1.000, props.batchOriginalGravity]} label={{ value: 'Specific Gravity', angle: -90, position: 'insideLeft' }} scale="auto" />
          <YAxis yAxisId={1} orientation="right" label={{ value: 'ABV %', angle: 90, position: 'insideRight' }} />
          <Tooltip />
          <Legend />
      </LineChart>
    );
}
