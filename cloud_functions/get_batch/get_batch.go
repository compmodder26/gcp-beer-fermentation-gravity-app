package get_batch

import (
    "context"
	"encoding/json"
	"fmt"
	"net/http"

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
    w.Header().Add("Access-Control-Allow-Origin", "*")
    w.Header().Add("Access-Control-Allow-Headers", "Content-Type")

    // this should be a POST request that has a JSON payload, we need to unmarshal the request body
    decoder := json.NewDecoder(r.Body)
    
    var batchRequest BatchRequest
    
    decodeErr := decoder.Decode(&batchRequest)
    
    if decodeErr != nil {
        fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to decode request payload.  Error: " + decodeErr.Error() + "\"}")
        return
    }

    ctx := context.Background()
    
    bigQueryClient, bigQueryClientErr := bigquery.NewClient(ctx, "beer-gravity-tracker")
    
    if bigQueryClientErr != nil {
        fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to connect to datastore.  Cannot continue.  Error: " + bigQueryClientErr.Error() + "\"}")
        return
    }
     
    query := bigQueryClient.Query(`SELECT id, name, target_gravity FROM beer-gravity-tracker.data.batches WHERE id = @id`)
    query.Parameters = []bigquery.QueryParameter{
            {Name: "id", Value: batchRequest.Id},
    }
    
    it, readErr := query.Read(ctx)
        
    if readErr != nil {
       fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to read query.  Cannot continue. Error: " + readErr.Error() + "\"}")
       return
    } 
   
    var batch Batch
    
    itErr := it.Next(&batch)
    
    if itErr != nil && itErr != iterator.Done {
        fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to get query output.  Cannot continue.  Error: " + itErr.Error() + "\"}")
        return
    }
    
    jsonBytes, jsonErr := json.Marshal(batch)
    
    if jsonErr != nil {
        fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to convert output to json.  Cannot continue.  Error: " + jsonErr.Error() + "\"}")
    } else {
        fmt.Fprint(w, string(jsonBytes))
    }
}
