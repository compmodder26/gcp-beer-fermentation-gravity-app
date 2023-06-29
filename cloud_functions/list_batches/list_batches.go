package list_batches

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"cloud.google.com/go/bigquery"
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"google.golang.org/api/iterator"
)

type Batch struct {
	Id               int     `json:"id"`
	Name             string  `json:"name"`
	Target_gravity   float32 `json:"target_gravity"`
	Original_gravity float32 `json:"original_gravity"`
}

func init() {
	functions.HTTP("ListBatches", listBatches)
}

func listBatches(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type")

	ctx := context.Background()

	bigQueryClient, bigQueryClientErr := bigquery.NewClient(ctx, "beer-gravity-tracker")

	if bigQueryClientErr != nil {
		fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to connect to datastore.  Cannot continue.  Error: "+bigQueryClientErr.Error()+"\"}")
		return
	}

	query := bigQueryClient.Query(`SELECT id, name, target_gravity, original_gravity FROM beer-gravity-tracker.data.batches ORDER BY name ASC`)

	it, readErr := query.Read(ctx)

	if readErr != nil {
		fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to read query.  Cannot continue. Error: "+readErr.Error()+"\"}")
		return
	}

	batches := make([]Batch, 0)

	for {
		var batch Batch

		itErr := it.Next(&batch)

		if itErr == iterator.Done {
			break
		}

		if itErr != nil {
			fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to get query output.  Cannot continue.  Error: "+itErr.Error()+"\"}")
			return
		}

		batches = append(batches, batch)
	}

	jsonBytes, jsonErr := json.Marshal(batches)

	if jsonErr != nil {
		fmt.Fprint(w, "{\"success\":false, \"error\":\"Unable to convert output to json.  Cannot continue.  Error: "+jsonErr.Error()+"\"}")
	} else {
		fmt.Fprint(w, string(jsonBytes))
	}
}
