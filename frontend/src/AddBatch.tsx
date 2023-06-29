import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import lists from './lists.png';
import spinner from './spinner.gif';
import axios from 'axios';
import { publish } from "./events";

export default function AddBatch( props: any ) {
  const [open, setOpen] = React.useState(false);
  const [batchName, setBatchName] = React.useState('');
  const [targetGravity, setTargetGravity] = React.useState('');
  const [originalGravity, setOriginalGravity] = React.useState('');
  const [ajaxRunning, setAjaxRunning] = React.useState(false);
  
  const url = 'https://us-east1-beer-gravity-tracker.cloudfunctions.net/new_batch';
  
  const handleClickOpen = () => {
    setBatchName('');
    setTargetGravity('');
    setOriginalGravity('');
  
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  const addBatch = () => {
    setAjaxRunning(true);
    axios({
        method: 'post',
        url: url,
        withCredentials: false,
        data: {
            name: batchName,
            target_gravity: parseFloat(targetGravity),
            original_gravity: parseFloat(originalGravity),
        },
        headers: {
            'Content-Type': 'application/json',
        },
      }).then((response) => {
        setAjaxRunning(false);
        setBatchName('');
        setTargetGravity('');
        publish('beerListChangedEvent', "");
        handleClose();
    });
  }

  return (
    <div>
      <div id="addBatch"><img src={lists} title="Add New Batch" onClick={handleClickOpen} /></div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Batch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the fields below to add a new batch of beer to track.
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Batch Name"
            value={batchName}
            type="text"
            fullWidth
            variant="standard"
            onChange={(newValue) => setBatchName(newValue.target.value)} 
          />
          <TextField
            autoFocus
            margin="dense"
            id="target_gravity"
            name="target_gravity"
            label="Target Gravity"
            value={targetGravity}
            type="number"
            fullWidth
            variant="standard"
            onChange={(newValue) => setTargetGravity(newValue.target.value)} 
          />
          <TextField
            autoFocus
            margin="dense"
            id="original_gravity"
            name="original_gravity"
            label="Original Gravity"
            value={originalGravity}
            type="number"
            fullWidth
            variant="standard"
            onChange={(newValue) => setOriginalGravity(newValue.target.value)} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {ajaxRunning ? (
            <img src={spinner} width="30" height="30" title="Processing" alt="Processing"/>
          ) : (
            <Button onClick={addBatch}>Save</Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
