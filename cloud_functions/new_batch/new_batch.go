package new_batch

import (
    "context"
	"fmt"
	"net/http"
	"os"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"google.golang.org/api/iterator"
	"cloud.google.com/go/bigquery"
)

type BatchCount struct {
    Total_batches int
}

func init() {
    functions.HTTP("NewBatch", newBatch)
}

func newBatch(w http.ResponseWriter, r *http.Request) {
    ctx := context.Background()
    
    bigQueryClient, bigQueryClientErr := bigquery.NewClient(ctx, "beer-gravity-tracker")
    
    if bigQueryClientErr != nil {
        fmt.Fprintln(w, "Unable to connect to datastore.  Cannot continue")
        os.Exit(1)
    }
     
    query := bigQueryClient.Query(`SELECT count(*) as total_batches FROM beer-gravity-tracker.data.batches`)
    
    it, readErr := query.Read(ctx)
    
    if readErr != nil {
       fmt.Fprintln(w, "Unable to read query.  Cannot continue")
       os.Exit(1)
    } 
    
    var batchCount BatchCount
    
    itErr := it.Next(&batchCount)
    
    if itErr != nil && itErr != iterator.Done {
        fmt.Fprintln(w, "Unable to get query output.  Cannot continue")
        os.Exit(1)
    }
    
    fmt.Fprintln(w, "Total batches available: ", batchCount.Total_batches)
}
