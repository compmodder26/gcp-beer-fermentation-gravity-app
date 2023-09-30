package get_batch_readings

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"os"

	"cloud.google.com/go/bigquery"
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"google.golang.org/api/iterator"
)

type BatchReadingRequest struct {
	Batch_id int `json:"batch_id"`
}

type BatchReading struct {
	Batch_id int       `json:"batch_id"`
	Reading  float32   `json:"reading"`
	Tstamp   time.Time `json:"tstamp"`
}

type BatchReadingOutput struct {
	Batch_id int     `json:"batch_id"`
	Reading  float32 `json:"reading"`
	Tstamp   string  `json:"tstamp"`
}

func init() {
	functions.HTTP("GetBatchReadings", getBatchReadings)
}

func getBatchReadings(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type")
	
	project := os.Getenv("GCP_PROJECT_ID")
	dataset := os.Getenv("GCP_BIGQUERY_DATASET")

	// this should be a POST request that has a JSON payload, we need to unmarshal the request body
	decoder := json.NewDecoder(r.Body)

	var batchRequest BatchReadingRequest

	decodeErr := decoder.Decode(&batchRequest)

	if decodeErr != nil {
		fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to decode request payload.  Error: "+decodeErr.Error()+"\"}")
		return
	}

	ctx := context.Background()

	bigQueryClient, bigQueryClientErr := bigquery.NewClient(ctx, project)

	if bigQueryClientErr != nil {
		fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to connect to datastore.  Cannot continue.  Error: "+bigQueryClientErr.Error()+"\"}")
		return
	}

	defer bigQueryClient.Close()

	query := bigQueryClient.Query(`SELECT batch_id, reading, tstamp FROM `+project+`.`+dataset+`.readings WHERE batch_id = @batch_id ORDER BY tstamp ASC`)
	query.Parameters = []bigquery.QueryParameter{
		{Name: "batch_id", Value: batchRequest.Batch_id},
	}

	it, readErr := query.Read(ctx)

	if readErr != nil {
		fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to read query.  Cannot continue. Error: "+readErr.Error()+"\"}")
		return
	}

	batches := make([]BatchReadingOutput, 0)

	for {
		var batch BatchReading

		itErr := it.Next(&batch)

		if itErr == iterator.Done {
			break
		}

		if itErr != nil {
			fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to get query output.  Cannot continue.  Error: "+itErr.Error()+"\"}")
			return
		}

		batchOutput := BatchReadingOutput{
			Batch_id: batch.Batch_id,
			Reading:  batch.Reading,
			Tstamp:   batch.Tstamp.Format("2006/01/02 15:04:05"),
		}

		batches = append(batches, batchOutput)
	}

	jsonBytes, jsonErr := json.Marshal(batches)

	if jsonErr != nil {
		fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to convert output to json.  Cannot continue.  Error: "+jsonErr.Error()+"\"}")
	} else {
		fmt.Fprint(w, string(jsonBytes))
	}

	return
}
