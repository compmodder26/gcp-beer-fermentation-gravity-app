import * as React from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { subscribe, unsubscribe, publish } from "./events";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function AddBatchReadingDialog ( props: any ) {
  const url = 'https://us-east1-beer-gravity-tracker.cloudfunctions.net/add_batch_reading';

  const [open, setOpen] = React.useState(false);
  const [reading, setReading] = React.useState('');
  const [errorText, setErrorText] = React.useState('');
  
  React.useEffect(() => {
      subscribe("addReadingButtonClicked", handleClickOpen);
    
      return () => {
          unsubscribe("addReadingButtonClicked", handleClose);
      }
  }, []);
  
  const handleClickOpen = () => {
    setReading('');
    setOpen(true);
  };

  const handleClose = () => {
    setErrorText("");
    setOpen(false);
  };
  
  const saveReading = () => {
    axios({
        method: 'post',
        url: url,
        withCredentials: false,
        data: {
            batch_id: props.batchId,
            reading: parseFloat(reading),
        },
        headers: {
            'Content-Type': 'application/json',
        },
      }).then((response) => {
        if (response.data.success) {
            publish('batchReadingAdded', "");
            handleClose();
        } else {
            setErrorText(response.data.error);
        }
    });
  }

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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={saveReading}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export function BatchReadingsChart ( props: any ) {
    const url = 'https://us-east1-beer-gravity-tracker.cloudfunctions.net/get_batch_readings';
    const [batchReadings, setBatchReadings] = React.useState([]);
    
    React.useEffect(() => {
      subscribe("batchReadingAdded", getBatchReadings);
      
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
        }
        
        setBatchReadings(response.data);
      });
    };
    
    return (
        <LineChart width={1000} height={400} data={batchReadings}>
          <Line type="monotone" dataKey="reading" stroke="#ff0000" />
          <Line type="monotone" dataKey="abv_pct" stroke="#000000" />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="tstamp" includeHidden={true} />
          <YAxis />
          <Tooltip />
          <Legend />
      </LineChart>
    );
}
