import * as React from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { DeleteButton } from './DeleteBatch';
import { EditButton } from './EditBatch';
import { subscribe, unsubscribe } from './events';


export default function BatchListing ( props: any ) {
  const url = 'https://us-east1-beer-gravity-tracker.cloudfunctions.net/list_batches';
  
  const initRowState: any[] = [];
  
  const [rows, setRows] = React.useState(initRowState);

  const fetchBatchListing = () => {
      axios({
        method: 'get',
        url: url,
        withCredentials: false,
      }).then((response) => {
        var newRows: any[] = [];
      
        response.data.forEach(function(batch: any) {
            var row: any = {"name": batch.name, "target_gravity": batch.target_gravity, "original_gravity": batch.original_gravity, "id": batch.id};
        
            newRows.push(row);
        });
        
        setRows(newRows);
      });
  }
  
  React.useEffect(() => {
    subscribe("beerListChangedEvent", fetchBatchListing);
    
    fetchBatchListing();
    
    return () => {
        unsubscribe("beerListChangedEvent", () => null);
    }
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Batch Name</TableCell>
            <TableCell align="right">Original Gravity</TableCell>
            <TableCell align="right">Target Gravity</TableCell>
            <TableCell align="right">Options</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row: any) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.original_gravity}</TableCell>
              <TableCell align="right">{row.target_gravity}</TableCell>
              <TableCell align="right">
                <EditButton batchId={row.id} batchName={row.name} batchTargetGravity={row.target_gravity} batchOriginalGravity={row.original_gravity} />
                <DeleteButton batchId={row.id} batchName={row.name} />
                <div className="optionsEnd"> </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
