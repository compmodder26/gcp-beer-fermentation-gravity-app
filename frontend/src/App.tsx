import React from 'react';
import './App.css';
import BatchListing from './BatchListing';
import AddBatch from './AddBatch';
import { DeleteBatchDialog } from './DeleteBatch';
import { EditDialog } from './EditBatch';
import { subscribe, unsubscribe } from "./events";

function App() {
  const [beerListingChanged, setBeerListingChanged] = React.useState(false);
  
  React.useEffect(() => {
    subscribe("beerListChangedEvent", () => setBeerListingChanged(true));
    
    return () => {
        unsubscribe("beerListChangedEvent", () => setBeerListingChanged(false));
    }
  }, []);

  return (
    <div className="App">
        <h1>Beer Fermentation Gravity Tracker</h1>
        <BatchListing 
            didBeerListingChange={beerListingChanged === true} 
        />
        <AddBatch />
        <DeleteBatchDialog />
        <EditDialog />
    </div>
  );
}

export default App;
