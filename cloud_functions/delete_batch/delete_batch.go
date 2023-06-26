package delete_batch

import (
    "context"
    "encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"cloud.google.com/go/bigquery"
)

type DeleteBatchRequest struct {
    Id int `json:"id"`
}

func init() {
    functions.HTTP("DeleteBatch", deleteBatch)
}

func deleteBatch(w http.ResponseWriter, r *http.Request) {
    // this should be a POST request that has a JSON payload, we need to unmarshal the request body
    decoder := json.NewDecoder(r.Body)
    
    var batchRequest DeleteBatchRequest
    
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
    
    delReadingQuery := bigQueryClient.Query("DELETE FROM beer-gravity-tracker.data.readings WHERE batch_id = @id")
    delReadingQuery.Parameters = []bigquery.QueryParameter{
            {Name: "id", Value: batchRequest.Id},
    }
    
    if _, delReadingErr := delReadingQuery.Read(ctx); delReadingErr != nil {
        fmt.Fprintln(w, "{\"success\":false, \"error\":\"" + delReadingErr.Error() + "\"}")
        os.Exit(1)
    } 
    
    delBatchQuery := bigQueryClient.Query("DELETE FROM beer-gravity-tracker.data.batches WHERE id = @id")
    delBatchQuery.Parameters = []bigquery.QueryParameter{
            {Name: "id", Value: batchRequest.Id},
    }
    
    if _, delBatchErr := delBatchQuery.Read(ctx); delBatchErr != nil {
        fmt.Fprintln(w, "{\"success\":false, \"error\":\"" + delBatchErr.Error() + "\"}")
    } else {
        fmt.Fprintln(w, "{\"success\":true}")
    }
}
