package get_batch

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

type BatchRequest struct {
    Id int `json:"id"`
}

type Batch struct {
    Id int `json:"id"`
    Name string `json:"name"`
    Target_gravity float32 `json:"target_gravity"`
}

func init() {
    functions.HTTP("GetBatch", getBatch)
}

func getBatch(w http.ResponseWriter, r *http.Request) {
    // this should be a POST request that has a JSON payload, we need to unmarshal the request body
    decoder := json.NewDecoder(r.Body)
    
    var batchRequest BatchRequest
    
    decodeErr := decoder.Decode(&batchRequest)
    
    if decodeErr != nil {
        fmt.Fprintln(w, "{\"success\":false, \"error\":\"Unable to decode request payload.  Error: " + decodeErr.Error() + "\"}")
        os.Exit(1)
    }

    ctx := context.Background()
    
    bigQueryClient, bigQueryClientErr := bigquery.NewClient(ctx, "beer-gravity-tracker")
    
    if bigQueryClientErr != nil {
        fmt.Fprintln(w, "{\"success\":false, \"error\":\"Unable to connect to datastore.  Cannot continue.  Error: " + bigQueryClientErr.Error() + "\"}")
        os.Exit(1)
    }
     
    query := bigQueryClient.Query(`SELECT id, name, target_gravity FROM beer-gravity-tracker.data.batches WHERE id = @id`)
    query.Parameters = []bigquery.QueryParameter{
            {Name: "id", Value: batchRequest.Id},
    }
    
    it, readErr := query.Read(ctx)
        
    if readErr != nil {
       fmt.Fprintln(w, "{\"success\":false, \"error\":\"Unable to read query.  Cannot continue. Error: " + readErr.Error() + "\"}")
       os.Exit(1)
    } 
   
    var batch Batch
    
    itErr := it.Next(&batch)
    
    if itErr != nil && itErr != iterator.Done {
        fmt.Fprintln(w, "{\"success\":false, \"error\":\"Unable to get query output.  Cannot continue.  Error: " + itErr.Error() + "\"}")
        os.Exit(1)
    }
    
    jsonBytes, jsonErr := json.Marshal(batch)
    
    if jsonErr != nil {
        fmt.Fprintln(w, "{\"success\":false, \"error\":\"Unable to convert output to json.  Cannot continue.  Error: " + jsonErr.Error() + "\"}")
    } else {
        fmt.Fprintln(w, string(jsonBytes))
    }
}
