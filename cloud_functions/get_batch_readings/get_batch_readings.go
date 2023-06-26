package get_batch_readings

import (
    "context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"google.golang.org/api/iterator"
	"cloud.google.com/go/bigquery"
)

type BatchReadingRequest struct {
    Batch_id int `json:"batch_id"`
}

type BatchReading struct {
    Batch_id int `json:"batch_id"`
    Reading float32 `json:"reading"`
    Tstamp time.Time `json:"tstamp"`
}

func init() {
    functions.HTTP("GetBatchReadings", getBatchReadings)
}

func getBatchReadings(w http.ResponseWriter, r *http.Request) {
    // this should be a POST request that has a JSON payload, we need to unmarshal the request body
    decoder := json.NewDecoder(r.Body)
    
    var batchRequest BatchReadingRequest
    
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
    
    defer bigQueryClient.Close()
     
    query := bigQueryClient.Query(`SELECT batch_id, reading, tstamp FROM beer-gravity-tracker.data.readings WHERE batch_id = @batch_id ORDER BY tstamp ASC`)
    query.Parameters = []bigquery.QueryParameter{
            {Name: "batch_id", Value: batchRequest.Batch_id},
    }
    
    it, readErr := query.Read(ctx)
        
    if readErr != nil {
       fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to read query.  Cannot continue. Error: " + readErr.Error() + "\"}")
       return
    }
    
    batches := make([]BatchReading, 0)
    
    for {
        var batch BatchReading
        
        itErr := it.Next(&batch)
        
        if itErr == iterator.Done {
            break
        }
        
        if itErr != nil {
            fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to get query output.  Cannot continue.  Error: " + itErr.Error() + "\"}")
            return
        }
        
        batches = append(batches, batch)
    }
    
    jsonBytes, jsonErr := json.Marshal(batches)
    
    if jsonErr != nil {
        fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to convert output to json.  Cannot continue.  Error: " + jsonErr.Error() + "\"}")
    } else {
        fmt.Fprint(w, string(jsonBytes))
    }
    
    return
}
