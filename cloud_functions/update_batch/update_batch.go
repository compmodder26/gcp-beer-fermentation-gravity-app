package update_batch

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"cloud.google.com/go/bigquery"
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
)

type UpdateBatchRequest struct {
	Id               int     `json:"id"`
	Name             string  `json:"name"`
	Target_gravity   float32 `json:"target_gravity"`
	Original_gravity float32 `json:"original_gravity"`
}

func init() {
	functions.HTTP("UpdateBatch", updateBatch)
}

func updateBatch(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type")
	
	project := os.Getenv("GCP_PROJECT_ID")
	dataset := os.Getenv("GCP_BIGQUERY_DATASET")

	// this should be a POST request that has a JSON payload, we need to unmarshal the request body
	decoder := json.NewDecoder(r.Body)

	var batchRequest UpdateBatchRequest

	decodeErr := decoder.Decode(&batchRequest)

	if decodeErr != nil {
		fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to decode request payload.  Error: "+decodeErr.Error()+"\"}")
		return
	}

	ctx := context.Background()

	bigQueryClient, bigQueryClientErr := bigquery.NewClient(ctx, project)

	if bigQueryClientErr != nil {
		fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to connect to datastore.  Error: "+bigQueryClientErr.Error()+"\"}")
		return
	}

	defer bigQueryClient.Close()

	q := bigQueryClient.Query("UPDATE "+project+"."+dataset+".batches SET name = @name, target_gravity = @target_gravity, original_gravity = @original_gravity WHERE id = @id")
	q.Parameters = []bigquery.QueryParameter{
		{Name: "name", Value: batchRequest.Name},
		{Name: "target_gravity", Value: batchRequest.Target_gravity},
		{Name: "original_gravity", Value: batchRequest.Original_gravity},
		{Name: "id", Value: batchRequest.Id},
	}

	if _, insertErr := q.Read(ctx); insertErr != nil {
		fmt.Fprint(w, "{\"success\":false, \"error\":\""+insertErr.Error()+"\"}")
	} else {
		fmt.Fprint(w, "{\"success\":true}")
	}
}
