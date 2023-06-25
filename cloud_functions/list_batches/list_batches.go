package list_batches

import (
    "context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"google.golang.org/api/iterator"
	"cloud.google.com/go/bigquery"
)

type Batch struct {
    Id int `json:"id"`
    Name string `json:"name"`
    Target_gravity float32 `json:"target_gravity"`
}

func init() {
    functions.HTTP("ListBatches", newBatch)
}

func newBatch(w http.ResponseWriter, r *http.Request) {
    ctx := context.Background()
    
    bigQueryClient, bigQueryClientErr := bigquery.NewClient(ctx, "beer-gravity-tracker")
    
    if bigQueryClientErr != nil {
        fmt.Fprintln(w, "{\"success\":false, \"error\":\"Unable to connect to datastore.  Cannot continue.  Error: " + bigQueryClientErr.Error() + "\"}")
        os.Exit(1)
    }
     
    query := bigQueryClient.Query(`SELECT id, name, target_gravity FROM beer-gravity-tracker.data.batches ORDER BY name ASC`)
    
    it, readErr := query.Read(ctx)
        
    if readErr != nil {
       fmt.Fprintln(w, "{\"success\":false, \"error\":\"Unable to read query.  Cannot continue. Error: " + readErr.Error() + "\"}")
       os.Exit(1)
    } 
    
    batches := make([]Batch, 0)
    
    for {
        var batch Batch
        
        itErr := it.Next(&batch)
        
        if itErr == iterator.Done {
            break
        }
        
        if itErr != nil {
            fmt.Fprintln(w, "{\"success\":false, \"error\":\"Unable to get query output.  Cannot continue.  Error: " + itErr.Error() + "\"}")
            os.Exit(1)
        }
        
        batches = append(batches, batch)
    }
    
    jsonBytes, jsonErr := json.Marshal(batches)
    
    if jsonErr != nil {
        fmt.Fprintln(w, "{\"success\":false, \"error\":\"Unable to convert output to json.  Cannot continue.  Error: " + jsonErr.Error() + "\"}")
    } else {
        fmt.Fprintln(w, string(jsonBytes))
    }
}
