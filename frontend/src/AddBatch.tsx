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
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import { publish } from "./events";

const url = process.env.REACT_APP_GRAPHQL_API_URL;

const gqlClient = new ApolloClient({
  uri: url,
  cache: new InMemoryCache(),
});

const ADD_BATCH = gql`
  mutation NewBatch($input: BatchInput!) {
    newBatch(input: $input) {
      code
      error
      success
    }
  }
`;

export default function AddBatch( props: any ) {
  const [open, setOpen] = React.useState(false);
  const [batchName, setBatchName] = React.useState('');
  const [targetGravity, setTargetGravity] = React.useState('');
  const [originalGravity, setOriginalGravity] = React.useState('');
  const [ajaxRunning, setAjaxRunning] = React.useState(false);
  const [nameHasError, setNameHasError] = React.useState(false);
  const [targetGravityHasError, setTargetGravityHasError] = React.useState(false);
  const [originalGravityHasError, setOriginalGravityHasError] = React.useState(false);
  const [nameHelpText, setNameHelpText] = React.useState("");
  const [tgHelpText, setTGHelpText] = React.useState("");
  const [ogHelpText, setOGHelpText] = React.useState("");
  
  const handleClickOpen = () => {
    setBatchName('');
    setTargetGravity('');
    setOriginalGravity('');
    resetErrors();
  
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  const resetErrors = () => {
    setNameHasError(false);
    setTargetGravityHasError(false);
    setOriginalGravityHasError(false);
    setNameHelpText("");
    setTGHelpText("");
    setOGHelpText("");
  }
  
  const addBatch = () => {
    var allGood: boolean = true;
    resetErrors();
    
    var targetFloatVal: number = parseFloat(targetGravity);
    var originalFloatVal: number = parseFloat(originalGravity);
    
    if (batchName == "") {
        setNameHasError(true);
        setNameHelpText("Cannot be empty");
        allGood = false;
    }
    
    if (!(targetFloatVal >= 1.000 && targetFloatVal <= 1.1000)) {
        setTargetGravityHasError(true);
        setTGHelpText("Must be between 1.000 and 1.100");
        allGood = false;
    }
    
    if (!(originalFloatVal >= 1.000 && originalFloatVal <= 1.1000)) {
        setOriginalGravityHasError(true);
        setOGHelpText("Must be between 1.000 and 1.100");
        allGood = false;
    }
  
    if (allGood) {
        setAjaxRunning(true);
        
        gqlClient
        .mutate({
          mutation: ADD_BATCH,
          variables: {
            "input": {
              "name": batchName,
              "target_gravity": targetFloatVal,
              "original_gravity": originalFloatVal,
            },
          }
        }).then((response) => {
            setAjaxRunning(false);
            setBatchName('');
            setTargetGravity('');
            publish('beerListChangedEvent', "");
            handleClose();
        });
    }
  };
  
  const checkForReturnKey = (event: any) => {
    if (event.charCode === 13) {
        addBatch();
    }
  };

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
            error={nameHasError}
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
            helperText={nameHelpText}
            onKeyPress={checkForReturnKey}
          />
          <TextField
            error={targetGravityHasError}
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
            helperText={tgHelpText}
            onKeyPress={checkForReturnKey}
          />
          <TextField
            error={originalGravityHasError}
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
            helperText={ogHelpText}
            onKeyPress={checkForReturnKey}
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
