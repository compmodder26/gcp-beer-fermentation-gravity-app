package new_batch

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"cloud.google.com/go/bigquery"
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"google.golang.org/api/iterator"
)

type NewBatchRequest struct {
	Name             string  `json:"name"`
	Target_gravity   float32 `json:"target_gravity"`
	Original_gravity float32 `json:"original_gravity"`
}

type LatestBatchId struct {
	Id int
}

func init() {
	functions.HTTP("NewBatch", newBatch)
}

func newBatch(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type")
	
	project := os.Getenv("GCP_PROJECT_ID")
	dataset := os.Getenv("GCP_BIGQUERY_DATASET")

	// this should be a POST request that has a JSON payload, we need to unmarshal the request body
	decoder := json.NewDecoder(r.Body)

	var batchRequest NewBatchRequest

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

	query := bigQueryClient.Query(`SELECT id FROM `+project+`.`+dataset+`.batches ORDER BY id DESC LIMIT 1`)

	it, readErr := query.Read(ctx)

	if readErr != nil {
		fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to read query.  Error: "+readErr.Error()+"\"}")
		return
	}

	var lastBatchId LatestBatchId

	itErr := it.Next(&lastBatchId)

	if itErr != nil && itErr != iterator.Done {
		fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to get query output.  Error: "+itErr.Error()+"\"}")
		return
	}

	newBatchId := lastBatchId.Id + 1

	q := bigQueryClient.Query("INSERT INTO "+project+"."+dataset+".batches (id, name, target_gravity, original_gravity) VALUES(@batch_id, @name, @target_gravity, @original_gravity)")
	q.Parameters = []bigquery.QueryParameter{
		{Name: "batch_id", Value: newBatchId},
		{Name: "name", Value: batchRequest.Name},
		{Name: "target_gravity", Value: batchRequest.Target_gravity},
		{Name: "original_gravity", Value: batchRequest.Original_gravity},
	}

	if _, insertErr := q.Read(ctx); insertErr != nil {
		fmt.Fprint(w, "{\"success\":false, \"error\":\""+insertErr.Error()+"\"}")
	} else {
		fmt.Fprint(w, "{\"success\":true}")
	}
}
