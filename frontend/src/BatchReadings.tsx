import * as React from 'react';
import axios from 'axios';
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
        
        axios({
            method: 'post',
            url: url,
            withCredentials: false,
            data: {
                batch_id: props.batchId,
                reading: readingFloatVal,
            },
            headers: {
                'Content-Type': 'application/json',
            },
          }).then((response) => {
            if (response.data.success) {
                publish('batchReadingAdded', { batchId: props.batchId });
                handleClose();
            } else {
                setErrorText(response.data.error);
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
    const url = process.env.REACT_APP_CLOUD_FUNCTIONS_URL + '/get_batch_readings';
    const [batchReadings, setBatchReadings] = React.useState([]);
    
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
        axios({
        method: 'post',
        url: url,
        withCredentials: false,
        data: {
            batch_id: props.batchId
        },
      }).then((response) => {
        if (response.data.length > 0) {
            var gravityReachedAlertElem = document.getElementById("gravityTargetReached");
            
            if (gravityReachedAlertElem != null) {
                gravityReachedAlertElem.style.display = 'none';
            
            
                var lastReading = response.data.at(-1);
                
                if (lastReading.reading <= props.batchTargetGravity) {
                    gravityReachedAlertElem.style.display = 'inline';
                }
            }
            
            for (var i = 0; i < response.data.length; i++) {
                var abvCalc: any = ((props.batchOriginalGravity - response.data[i].reading) * 131.25).toFixed(2);
                
                response.data[i].abv_pct = abvCalc;
            }
            
            var fermentationPct: any = (((props.batchOriginalGravity - response.data[response.data.length - 1].reading) / (props.batchOriginalGravity - props.batchTargetGravity)) * 100).toFixed(2);
            
            props.setCurrentGravity(response.data[response.data.length - 1].reading);
            props.setCurrentABV(response.data[response.data.length - 1].abv_pct);
            props.setCurrentFermentationPct(fermentationPct >= 100 ? 100.00.toFixed(2) : fermentationPct);
            props.setAttenuationPct(
                (((props.batchOriginalGravity - response.data[response.data.length - 1].reading) / (props.batchOriginalGravity - 1.0)) * 100).toFixed(2)
            );
        }
        
        setBatchReadings(response.data);
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
