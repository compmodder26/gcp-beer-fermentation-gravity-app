import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import editButton from './edit.png';
import { BatchReadingsChart, AddBatchReadingDialog } from './BatchReadings';
import axios from 'axios';
import { publish, subscribe, unsubscribe } from "./events";

export function EditButton( props: any) {
    const handleEditButtonClick = () => {
        publish('editBatchButtonClicked', { batchID: props.batchId, batchName: props.batchName, batchTargetGravity: props.batchTargetGravity, batchOriginalGravity: props.batchOriginalGravity });
    }

    return (
        <div id="deleteBatch" className="optionButton"><img src={editButton} title="Edit Batch" onClick={handleEditButtonClick} /></div>
    )
}

export function EditDialog( props: any ) {
  const getReadingUrl = 'https://us-east1-beer-gravity-tracker.cloudfunctions.net/get_batch_readings';
  const updateBatchUrl = 'https://us-east1-beer-gravity-tracker.cloudfunctions.net/update_batch';

  const [open, setOpen] = React.useState(false);
  const [batchId, setBatchID] = React.useState(0);
  const [batchName, setBatchName] = React.useState('');
  const [batchTargetGravity, setBatchTargetGravity] = React.useState(0.0);
  const [batchOriginalGravity, setBatchOriginalGravity] = React.useState(0.0);
  const [errorText, setErrorText] = React.useState('');
  
  React.useEffect(() => {
    subscribe("editBatchButtonClicked", function(event: any) {
        setBatchID(event.detail.batchID);
        setBatchName(event.detail.batchName);
        setBatchTargetGravity(event.detail.batchTargetGravity);
        setBatchOriginalGravity(event.detail.batchOriginalGravity);
        handleClickOpen();
    });
    
    return () => {
        unsubscribe("editBatchButtonClicked", () => null);
    }
  }, []);
  
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setErrorText("");
    setOpen(false);
  };
  
  const showBatchReadingDialog = () => {
    publish("addReadingButtonClicked", "");
  };
  
  const editBatch = () => {
    axios({
        method: 'post',
        url: updateBatchUrl,
        withCredentials: false,
        data: {
            id: batchId,
            name: batchName,
            target_gravity: batchTargetGravity,
            original_gravity: batchOriginalGravity,
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
    });
  }
  
  function BootstrapDialogTitle(props: any) {
      const { children, onClose, ...other } = props;

      return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
          {children}
          {onClose ? (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
        </DialogTitle>
      );
    }

  return (
    <div>
      <Dialog open={open} onClose={handleClose} maxWidth={"xl"} fullWidth={true}>
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
          Edit Batch
        </BootstrapDialogTitle>
        <DialogContent>
          <DialogContentText>
            <span className="errorText">{errorText}</span>
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
            value={batchTargetGravity}
            type="number"
            fullWidth
            variant="standard"
            onChange={(newValue) => setBatchTargetGravity(parseFloat(newValue.target.value))} 
          />
          <TextField
            autoFocus
            margin="dense"
            id="original_gravity"
            name="original_gravity"
            label="Original Gravity"
            value={batchOriginalGravity}
            type="number"
            fullWidth
            variant="standard"
            onChange={(newValue) => setBatchOriginalGravity(parseFloat(newValue.target.value))} 
          />
          <DialogActions>
              <Button onClick={editBatch}>Save</Button>
            </DialogActions>
            <DialogContentText>
              Current Gravity Readings <span id="gravityTargetReached">Target Gravity Reached!!</span>
            </DialogContentText>
            <DialogContentText>
              <BatchReadingsChart batchId={batchId} batchTargetGravity={batchTargetGravity} batchOriginalGravity={batchOriginalGravity} />
            </DialogContentText>
            <DialogActions>
              <Button onClick={showBatchReadingDialog}>Add Reading</Button>
            </DialogActions>
        </DialogContent>
      </Dialog>
      <AddBatchReadingDialog batchId={batchId} />
    </div>
  );
}
