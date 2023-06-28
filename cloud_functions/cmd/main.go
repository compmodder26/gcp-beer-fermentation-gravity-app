package main

import (
	"log"
	"os"

	// Blank-import the function packages so the init() runs
	"github.com/GoogleCloudPlatform/functions-framework-go/funcframework"
	_ "github.com/compmodder26/gcp-beer-fermentation-gravity-app/cloud_functions/add_batch_reading"
	_ "github.com/compmodder26/gcp-beer-fermentation-gravity-app/cloud_functions/delete_batch"
	_ "github.com/compmodder26/gcp-beer-fermentation-gravity-app/cloud_functions/get_batch"
	_ "github.com/compmodder26/gcp-beer-fermentation-gravity-app/cloud_functions/get_batch_readings"
	_ "github.com/compmodder26/gcp-beer-fermentation-gravity-app/cloud_functions/list_batches"
	_ "github.com/compmodder26/gcp-beer-fermentation-gravity-app/cloud_functions/new_batch"
	_ "github.com/compmodder26/gcp-beer-fermentation-gravity-app/cloud_functions/update_batch"
)

func main() {
	// Use PORT environment variable, or default to 8080.
	port := "8080"
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}
	if err := funcframework.Start(port); err != nil {
		log.Fatalf("funcframework.Start: %v\n", err)
	}
}
