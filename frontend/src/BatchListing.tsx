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


class BatchListing extends React.Component<any> {
  url = 'https://us-east1-beer-gravity-tracker.cloudfunctions.net/list_batches';
  
  state = {
    rows: []
  };
  
  constructor(props: any, context: any) {
      super(props,context);
  }

  fetchBatchListing() {
      axios({
        method: 'get',
        url: this.url,
        withCredentials: false,
      }).then((response) => {
        var newRows: any[] = [];
      
        response.data.forEach(function(batch: any) {
            var row: any = {"name": batch.name, "target_gravity": batch.target_gravity, "id": batch.id};
        
            newRows.push(row);
        });
        
        this.setState({
            rows: newRows
        });
      });
  }

  getInitialState() {
    return {
        rows: []
    };
  }

  componentDidMount() {
    this.fetchBatchListing();
  }
  
  componentDidUpdate(prevProps: any) {
    if (this.props.didBeerListingChange) {
        this.fetchBatchListing();
    }
  }

  render() {
      return (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Batch Name</TableCell>
                <TableCell align="right">Target Gravity</TableCell>
                <TableCell align="right">Options</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.rows.map((row: any) => (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{row.target_gravity}</TableCell>
                  <TableCell align="right">
                    <EditButton batchId={row.id} batchName={row.name} batchTargetGravity={row.target_gravity} />
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
}

export default BatchListing;
