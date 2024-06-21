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
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import { publish, subscribe, unsubscribe } from "./events";

const url = process.env.REACT_APP_GRAPHQL_API_URL;

const gqlClient = new ApolloClient({
  uri: url,
  cache: new InMemoryCache(),
});

const DELETE_BATCH = gql`
  mutation DeleteBatch($deleteBatchId: Int!) {
    deleteBatch(id: $deleteBatchId) {
      code
      success
      error
    }
  }
`;

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
    
    console.log(batchId);
  
    gqlClient
    .mutate({
      mutation: DELETE_BATCH,
      variables: {
        "deleteBatchId": batchId,
      }
    }).then((response) => {
      if (response.data.deleteBatch.success) {
          publish('beerListChangedEvent', "");
          handleClose();
      } else {
          setErrorText(response.data.deleteBatch.error);
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
