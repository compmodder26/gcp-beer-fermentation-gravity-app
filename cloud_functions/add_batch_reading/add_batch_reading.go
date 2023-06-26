package add_batch_reading

import (
    "context"
    "encoding/json"
	"fmt"
	"net/http"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"cloud.google.com/go/bigquery"
)

type NewReadingRequest struct {
    Batch_id int `json:"batch_id"`
    Reading float32 `json:"reading"`
}

func init() {
    functions.HTTP("AddBatchReading", addBatchReading)
}

func addBatchReading(w http.ResponseWriter, r *http.Request) {
    // this should be a POST request that has a JSON payload, we need to unmarshal the request body
    decoder := json.NewDecoder(r.Body)
    
    var batchRequest NewReadingRequest
    
    decodeErr := decoder.Decode(&batchRequest)
    
    if decodeErr != nil {
        fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to decode request payload.  Error: " + decodeErr.Error() + "\"}")
        return
    }
    
    ctx := context.Background()
    
    bigQueryClient, bigQueryClientErr := bigquery.NewClient(ctx, "beer-gravity-tracker")
    
    if bigQueryClientErr != nil {
        fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to connect to datastore.  Error: " + bigQueryClientErr.Error() + "\"}")
        return
    }
    
    defer bigQueryClient.Close()
    
    q := bigQueryClient.Query("INSERT INTO beer-gravity-tracker.data.readings (batch_id, reading, tstamp) VALUES(@batch_id, @reading, CURRENT_TIMESTAMP())")
    q.Parameters = []bigquery.QueryParameter{
            {Name: "batch_id", Value: batchRequest.Batch_id},
            {Name: "reading", Value: batchRequest.Reading},
    }
    
    if _, insertErr := q.Read(ctx); insertErr != nil {
        fmt.Fprint(w, "{\"success\":false, \"error\":\"" + insertErr.Error() + "\"}")
    } else {
        fmt.Fprint(w, "{\"success\":true}")
    }
}
