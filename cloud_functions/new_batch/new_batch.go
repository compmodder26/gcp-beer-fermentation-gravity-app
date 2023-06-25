package new_batch

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

type NewBatchRequest struct {
    Name string `json:"name"`
    Target_gravity float32 `json:"target_gravity"`
}

type Item struct {
    Id int
    Name string
    Target_gravity float32
}

type LatestBatchId struct {
    Id int
}

func init() {
    functions.HTTP("NewBatch", newBatch)
}

func newBatch(w http.ResponseWriter, r *http.Request) {
    // this should be a POST request that has a JSON payload, we need to unmarshal the request body
    decoder := json.NewDecoder(r.Body)
    
    var batchRequest NewBatchRequest
    
    decodeErr := decoder.Decode(&batchRequest)
    
    if decodeErr != nil {
        fmt.Fprintln(w, "{\"success\":false, \"error\":\"Unable to decode request payload.  Error: " + decodeErr.Error() + "\"}")
        os.Exit(1)
    }
    
    ctx := context.Background()
    
    bigQueryClient, bigQueryClientErr := bigquery.NewClient(ctx, "beer-gravity-tracker")
    
    if bigQueryClientErr != nil {
        fmt.Fprintln(w, "{\"success\":false, \"error\":\"Unable to connect to datastore.  Error: " + bigQueryClientErr.Error() + "\"}")
        os.Exit(1)
    }
    
    defer bigQueryClient.Close()
     
    query := bigQueryClient.Query(`SELECT id FROM beer-gravity-tracker.data.batches ORDER BY id DESC LIMIT 1`)
    
    it, readErr := query.Read(ctx)
    
    if readErr != nil {
       fmt.Fprintln(w, "{\"success\":false, \"error\":\"Unable to read query.  Error: " + readErr.Error() + "\"}")
       os.Exit(1)
    } 
    
    var lastBatchId LatestBatchId
    
    itErr := it.Next(&lastBatchId)
    
    if itErr != nil && itErr != iterator.Done {
        fmt.Fprintln(w, "{\"success\":false, \"error\":\"Unable to get query output.  Error: " + itErr.Error() + "\"}")
        os.Exit(1)
    }
    
    newBatchId := lastBatchId.Id + 1
    
    inserter := bigQueryClient.Dataset("data").Table("batches").Inserter()
    items := []*Item{
        {Id: newBatchId, Name: batchRequest.Name, Target_gravity: batchRequest.Target_gravity},
    }
    
    if insertErr := inserter.Put(ctx, items); insertErr != nil {
        fmt.Fprintln(w, "{\"success\":false, \"error\":\"" + insertErr.Error() + "\"}")
    } else {
        fmt.Fprintln(w, "{\"success\":true}")
    }
}
