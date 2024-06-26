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
import spinner from './spinner.gif';
import { BatchReadingsChart, AddBatchReadingDialog } from './BatchReadings';
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import { publish, subscribe, unsubscribe } from "./events";

const url = process.env.REACT_APP_GRAPHQL_API_URL;

const gqlClient = new ApolloClient({
  uri: url,
  cache: new InMemoryCache(),
});

const UPDATE_BATCH = gql`
  mutation UpdateBatch($input: BatchInput!) {
    updateBatch(input: $input) {
      code
      success
      error
    }
  }
`;

export function EditButton( props: any) {
    const handleEditButtonClick = () => {
        publish('editBatchButtonClicked', { batchID: props.batchId, batchName: props.batchName, batchTargetGravity: props.batchTargetGravity, batchOriginalGravity: props.batchOriginalGravity });
    }

    return (
        <div id="deleteBatch" className="optionButton"><img src={editButton} title="Edit Batch" onClick={handleEditButtonClick} /></div>
    )
}

export function EditDialog( props: any ) {
  const getReadingUrl = process.env.REACT_APP_CLOUD_FUNCTIONS_URL + '/get_batch_readings';
  const updateBatchUrl = process.env.REACT_APP_CLOUD_FUNCTIONS_URL + '/update_batch';
  
  const [open, setOpen] = React.useState(false);
  const [batchId, setBatchID] = React.useState(0);
  const [batchName, setBatchName] = React.useState('');
  const [batchTargetGravity, setBatchTargetGravity] = React.useState('');
  const [batchOriginalGravity, setBatchOriginalGravity] = React.useState('');
  const [errorText, setErrorText] = React.useState('');
  const [currentGravity, setCurrentGravity] = React.useState('');
  const [currentABV, setCurrentABV] = React.useState('');
  const [fermentationPct, setCurrentFermentationPct] = React.useState('');
  const [attenuationPct, setAttenuationPct] = React.useState('');
  const [ajaxRunning, setAjaxRunning] = React.useState(false);
  const [nameHasError, setNameHasError] = React.useState(false);
  const [targetGravityHasError, setTargetGravityHasError] = React.useState(false);
  const [originalGravityHasError, setOriginalGravityHasError] = React.useState(false);
  const [nameHelpText, setNameHelpText] = React.useState("");
  const [tgHelpText, setTGHelpText] = React.useState("");
  const [ogHelpText, setOGHelpText] = React.useState("");
  
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
    setCurrentGravity('');
    setCurrentABV('');
    setCurrentFermentationPct('');
    setAttenuationPct('');
    resetErrors();
  
    setOpen(true);
  };

  const handleClose = () => {
    setErrorText("");
    setOpen(false);
  };
  
  const showBatchReadingDialog = () => {
    publish("addReadingButtonClicked", "");
  };
  
  const resetErrors = () => {
    setNameHasError(false);
    setTargetGravityHasError(false);
    setOriginalGravityHasError(false);
    setNameHelpText("");
    setTGHelpText("");
    setOGHelpText("");
  }
  
  const editBatch = () => {
    var allGood: boolean = true;
    resetErrors();
    
    var targetFloatVal: number = parseFloat(batchTargetGravity);
    var originalFloatVal: number = parseFloat(batchOriginalGravity);
    
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
          mutation: UPDATE_BATCH,
          variables: {
            "input": {
              "id": batchId,
              "name": batchName,
              "target_gravity": targetFloatVal,
              "original_gravity": originalFloatVal,
            },
          }
        }).then((response) => {
            if (response.data.updateBatch.success) {
                publish('beerListChangedEvent', "");
                handleClose();
            } else {
                setErrorText(response.data.updateBatch.error);
            }
            
            setAjaxRunning(false);
        });
    }
  };
  
  const checkForReturnKey = (event: any) => {
    if (event.charCode === 13) {
        editBatch();
    }
  };
  
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
            value={batchTargetGravity}
            type="number"
            fullWidth
            variant="standard"
            onChange={(newValue) => setBatchTargetGravity(newValue.target.value)} 
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
            value={batchOriginalGravity}
            type="number"
            fullWidth
            variant="standard"
            onChange={(newValue) => setBatchOriginalGravity(newValue.target.value)}
            helperText={ogHelpText} 
            onKeyPress={checkForReturnKey}
          />
          <DialogActions>
              {ajaxRunning ? (
                <img src={spinner} width="30" height="30" title="Processing" alt="Processing"/>
              ) : (
                <Button onClick={editBatch}>Save</Button>
              )}
            </DialogActions>
            <DialogContentText>
              Current Gravity Readings <span id="gravityTargetReached">Target Gravity Reached!!</span>
            </DialogContentText>
            <DialogContentText>
              <div id="batchReadingsChartContaner">
                  <BatchReadingsChart 
                    batchId={batchId} 
                    batchTargetGravity={batchTargetGravity} 
                    batchOriginalGravity={batchOriginalGravity} 
                    setCurrentGravity={setCurrentGravity}
                    setCurrentABV={setCurrentABV}
                    setCurrentFermentationPct={setCurrentFermentationPct}
                    setAttenuationPct={setAttenuationPct}
                  />
              </div>
              <div id="batchReadingsSummaryContainer">
                <h3 className="summaryHeading">Summary</h3>
                <p><strong>Current Gravity:</strong> {currentGravity}</p>
                <p><strong>Current ABV%:</strong> {currentABV}</p>
                <p><strong>Fermentation Completion%:</strong> {fermentationPct}</p>
                <p><strong>Apparent Attenuation%:</strong> {attenuationPct}</p>
              </div>
              <div className="optionsEnd"></div>
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
