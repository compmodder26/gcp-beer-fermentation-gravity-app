import React from 'react';
import './App.css';
import BatchListing from './BatchListing';
import AddBatch from './AddBatch';
import { DeleteBatchDialog } from './DeleteBatch';
import { EditDialog } from './EditBatch';
import { subscribe, unsubscribe } from "./events";

function App() {
  return (
    <div className="App">
        <h1>Beer Fermentation Gravity Tracker</h1>
        <BatchListing />
        <AddBatch />
        <DeleteBatchDialog />
        <EditDialog />
    </div>
  );
}

export default App;
