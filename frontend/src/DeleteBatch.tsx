import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import deleteLogo from './agt_stop.png';
import spinner from './spinner.gif';
import axios from 'axios';
import { publish, subscribe, unsubscribe } from "./events";

export function DeleteButton( props: any) {
    const handleDeleteButtonClick = () => {
        publish('deleteBatchButtonClicked', { batchID: props.batchId, batchName: props.batchName });
    }

    return (
        <div id="deleteBatch" className="optionButton"><img src={deleteLogo} title="Delete Batch" onClick={handleDeleteButtonClick} /></div>
    )
}

export function DeleteBatchDialog( props: any ) {
  const url = process.env.REACT_APP_CLOUD_FUNCTIONS_URL + '/delete_batch';

  const [open, setOpen] = React.useState(false);
  const [batchId, setBatchID] = React.useState(0);
  const [batchName, setBatchName] = React.useState('');
  const [errorText, setErrorText] = React.useState('');
  const [ajaxRunning, setAjaxRunning] = React.useState(false);
  
  React.useEffect(() => {
    subscribe("deleteBatchButtonClicked", function(event: any) {
        setBatchID(event.detail.batchID);
        setBatchName(event.detail.batchName);
        handleClickOpen();
    });
    
    return () => {
        unsubscribe("deleteBatchButtonClicked", () => null);
    }
  }, []);
  
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setErrorText("");
    setOpen(false);
  };
  
  const deleteBatch = () => {
    setAjaxRunning(true);
  
    axios({
        method: 'post',
        url: url,
        withCredentials: false,
        data: {
            id: batchId,
        },
        headers: {
            'Content-Type': 'application/json',
        },
      }).then((response) => {
        if (response.data.success) {
            publish('beerListChangedEvent', "");
            handleClose();
        } else {
            setErrorText(response.data.error);
        }
        
        setAjaxRunning(false);
    });
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Batch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you wish to delete the batch "{batchName}".
          </DialogContentText>
          <DialogContentText>
            <span className="errorText">{errorText}.</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {ajaxRunning ? (
            <img src={spinner} width="30" height="30" title="Processing" alt="Processing"/>
          ) : (
            <Button onClick={deleteBatch}>Delete</Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
