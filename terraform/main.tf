locals {
  project = "beer-fermentation-tracker" # Google Cloud Platform Project ID
  service_account_email = "beer-fermentation-tracker@beer-fermentation-tracker.iam.gserviceaccount.com" # service account to use for authorizations
  location = "us-east1"
}

// BigQuery
    resource "google_bigquery_dataset" "dataset" {
      dataset_id                  = "beer_fermentation_tracker"
      friendly_name               = "Beer Fermentation Tracker"
      description                 = "Beer Fermentation Gravity Tracker Dataset"
      location                    = local.location

      labels = {
        env = "default"
      }
    }

    resource "google_bigquery_table" "batches" {
      dataset_id = google_bigquery_dataset.dataset.dataset_id
      table_id   = "batches"

      labels = {
        env = "default"
      }

      schema = <<EOF
    [
      {
        "name": "id",
        "type": "INTEGER",
        "mode": "REQUIRED",
        "description": "Unique ID for the batch"
      },
      {
        "name": "name",
        "type": "STRING",
        "mode": "REQUIRED",
        "description": "Batch Name"
      },
      {
        "name": "target_gravity",
        "type": "FLOAT",
        "mode": "REQUIRED",
        "description": "Target Gravity"
      },
      {
        "name": "original_gravity",
        "type": "FLOAT",
        "mode": "NULLABLE",
        "description": "Original Gravity"
      }
    ]
    EOF

    }

    resource "google_bigquery_table" "readings" {
      dataset_id = google_bigquery_dataset.dataset.dataset_id
      table_id   = "readings"

      labels = {
        env = "default"
      }

      schema = <<EOF
    [
      {
        "name": "batch_id",
        "type": "INTEGER",
        "mode": "REQUIRED",
        "description": "Unique ID for the batch this reading belongs to"
      },
      {
        "name": "reading",
        "type": "FLOAT",
        "mode": "REQUIRED",
        "description": "Gravity Reading"
      },
      {
        "name": "tstamp",
        "type": "TIMESTAMP",
        "mode": "NULLABLE",
        "description": "Time the reading was taken"
      }
    ]
    EOF

    }
// End BigQuery

// Cloud Functions Storage
resource "google_storage_bucket" "cloud_functions_bucket" {
  name     = "beer_fermentation_tracker_cloud_functions_bucket"
  location = local.location
}

// Cloud Run Policy
data "google_iam_policy" "cloud_function_run_policy" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

// Cloud Function Definitions
    // add_batch_reading
    data "archive_file" "add_batch_reading" {
      type        = "zip"
      source_dir  = "../cloud_functions/add_batch_reading"
      output_path = "../cloud_functions/add_batch_reading/archive/add_batch_reading_function-source.zip"
      excludes    = ["cmd", "archive"]
    }
    
    resource "google_storage_bucket_object" "add_batch_readings" {
      name   = "add_batch_readings/function-source.${data.archive_file.add_batch_reading.output_md5}.zip"
      bucket = google_storage_bucket.cloud_functions_bucket.name
      source = data.archive_file.add_batch_reading.output_path
    }

    resource "google_cloudfunctions2_function" "add_batch_reading" {
      name = "add_batch_reading"
      location = local.location
      description = "Adds a new beer batch"

      build_config {
        runtime = "go121"
        entry_point = "AddBatchReading"  # Set the entry point 
        source {
          storage_source {
            bucket = google_storage_bucket.cloud_functions_bucket.name
            object = google_storage_bucket_object.add_batch_readings.name
          }
        }
      }

      service_config {
        max_instance_count  = 100
        available_memory    = "128Mi"
        timeout_seconds     = 60
        service_account_email = local.service_account_email
        environment_variables = {
            GCP_PROJECT_ID = local.project,
            GCP_BIGQUERY_DATASET = google_bigquery_dataset.dataset.dataset_id
        }
      }
    }
    
    resource "google_cloud_run_service_iam_policy" "add_batch_readings" {
      location = local.location
      project = local.project
      service = google_cloudfunctions2_function.add_batch_reading.service_config[0].service
      policy_data = data.google_iam_policy.cloud_function_run_policy.policy_data
    }
    // end add_batch_readings

    // delete_batch
    data "archive_file" "delete_batch" {
      type        = "zip"
      source_dir  = "../cloud_functions/delete_batch"
      output_path = "../cloud_functions/delete_batch/archive/delete_batch_function-source.zip"
      excludes    = ["cmd", "archive"]
    }
    
    resource "google_storage_bucket_object" "delete_batch" {
      name   = "delete_batch/function-source.${data.archive_file.delete_batch.output_md5}.zip"
      bucket = google_storage_bucket.cloud_functions_bucket.name
      source = data.archive_file.delete_batch.output_path
    }

    resource "google_cloudfunctions2_function" "delete_batch" {
      name = "delete_batch"
      location = local.location
      description = "Deletes a beer batch"

      build_config {
        runtime = "go121"
        entry_point = "DeleteBatch"  # Set the entry point 
        source {
          storage_source {
            bucket = google_storage_bucket.cloud_functions_bucket.name
            object = google_storage_bucket_object.delete_batch.name
          }
        }
      }

      service_config {
        max_instance_count  = 100
        available_memory    = "128Mi"
        timeout_seconds     = 60
        service_account_email = local.service_account_email
        environment_variables = {
            GCP_PROJECT_ID = local.project,
            GCP_BIGQUERY_DATASET = google_bigquery_dataset.dataset.dataset_id
        }
      }
    }
    
    resource "google_cloud_run_service_iam_policy" "delete_batch" {
      location = local.location
      project = local.project
      service = google_cloudfunctions2_function.delete_batch.service_config[0].service
      policy_data = data.google_iam_policy.cloud_function_run_policy.policy_data
    }
    // end delete_batch

    // get_batch
    data "archive_file" "get_batch" {
      type        = "zip"
      source_dir  = "../cloud_functions/get_batch"
      output_path = "../cloud_functions/get_batch/archive/get_batch_function-source.zip"
      excludes    = ["cmd", "archive"]
    }
    
    resource "google_storage_bucket_object" "get_batch" {
      name   = "get_batch/function-source.${data.archive_file.get_batch.output_md5}.zip"
      bucket = google_storage_bucket.cloud_functions_bucket.name
      source = data.archive_file.get_batch.output_path
    }

    resource "google_cloudfunctions2_function" "get_batch" {
      name = "get_batch"
      location = local.location
      description = "Gets data for a batch"

      build_config {
        runtime = "go121"
        entry_point = "GetBatch"  # Set the entry point 
        source {
          storage_source {
            bucket = google_storage_bucket.cloud_functions_bucket.name
            object = google_storage_bucket_object.get_batch.name
          }
        }
      }

      service_config {
        max_instance_count  = 100
        available_memory    = "128Mi"
        timeout_seconds     = 60
        service_account_email = local.service_account_email
        environment_variables = {
            GCP_PROJECT_ID = local.project,
            GCP_BIGQUERY_DATASET = google_bigquery_dataset.dataset.dataset_id
        }
      }
    }
    
    resource "google_cloud_run_service_iam_policy" "get_batch" {
      location = local.location
      project = local.project
      service = google_cloudfunctions2_function.get_batch.service_config[0].service
      policy_data = data.google_iam_policy.cloud_function_run_policy.policy_data
    }
    // end get_batch

    // get_batch_readings
    data "archive_file" "get_batch_readings" {
      type        = "zip"
      source_dir  = "../cloud_functions/get_batch_readings"
      output_path = "../cloud_functions/get_batch_readings/archive/get_batch_readings_function-source.zip"
      excludes    = ["cmd", "archive"]
    }
    
    resource "google_storage_bucket_object" "get_batch_readings" {
      name   = "get_batch_readings/function-source.${data.archive_file.get_batch_readings.output_md5}.zip"
      bucket = google_storage_bucket.cloud_functions_bucket.name
      source = data.archive_file.get_batch_readings.output_path
    }

    resource "google_cloudfunctions2_function" "get_batch_readings" {
      name = "get_batch_readings"
      location = local.location
      description = "Gets readings for a batch"

      build_config {
        runtime = "go121"
        entry_point = "GetBatchReadings"  # Set the entry point 
        source {
          storage_source {
            bucket = google_storage_bucket.cloud_functions_bucket.name
            object = google_storage_bucket_object.get_batch_readings.name
          }
        }
      }

      service_config {
        max_instance_count  = 100
        available_memory    = "128Mi"
        timeout_seconds     = 60
        service_account_email = local.service_account_email
        environment_variables = {
            GCP_PROJECT_ID = local.project,
            GCP_BIGQUERY_DATASET = google_bigquery_dataset.dataset.dataset_id
        }
      }
    }
    
    resource "google_cloud_run_service_iam_policy" "get_batch_readings" {
      location = local.location
      project = local.project
      service = google_cloudfunctions2_function.get_batch_readings.service_config[0].service
      policy_data = data.google_iam_policy.cloud_function_run_policy.policy_data
    }
    // end get_batch_readings

    // list_batches
    data "archive_file" "list_batches" {
      type        = "zip"
      source_dir  = "../cloud_functions/list_batches"
      output_path = "../cloud_functions/list_batches/archive/list_batches_function-source.zip"
      excludes    = ["cmd", "archive"]
    }
    
    resource "google_storage_bucket_object" "list_batches" {
      name   = "list_batches/function-source.${data.archive_file.list_batches.output_md5}.zip"
      bucket = google_storage_bucket.cloud_functions_bucket.name
      source = data.archive_file.list_batches.output_path
    }

    resource "google_cloudfunctions2_function" "list_batches" {
      name = "list_batches"
      location = local.location
      description = "Lists all batches"

      build_config {
        runtime = "go121"
        entry_point = "ListBatches"  # Set the entry point 
        source {
          storage_source {
            bucket = google_storage_bucket.cloud_functions_bucket.name
            object = google_storage_bucket_object.list_batches.name
          }
        }
      }

      service_config {
        max_instance_count  = 100
        available_memory    = "128Mi"
        timeout_seconds     = 60
        service_account_email = local.service_account_email
        environment_variables = {
            GCP_PROJECT_ID = local.project,
            GCP_BIGQUERY_DATASET = google_bigquery_dataset.dataset.dataset_id
        }
      }
    }
    
    resource "google_cloud_run_service_iam_policy" "list_batches" {
      location = local.location
      project = local.project
      service = google_cloudfunctions2_function.list_batches.service_config[0].service
      policy_data = data.google_iam_policy.cloud_function_run_policy.policy_data
    }
    // end list_batches

    // new_batch
    data "archive_file" "new_batch" {
      type        = "zip"
      source_dir  = "../cloud_functions/new_batch"
      output_path = "../cloud_functions/new_batch/archive/new_batch_function-source.zip"
      excludes    = ["cmd", "archive"]
    }
    
    resource "google_storage_bucket_object" "new_batch" {
      name   = "new_batch/function-source.${data.archive_file.new_batch.output_md5}.zip"
      bucket = google_storage_bucket.cloud_functions_bucket.name
      source = data.archive_file.new_batch.output_path
    }

    resource "google_cloudfunctions2_function" "new_batch" {
      name = "new_batch"
      location = local.location
      description = "Adds a new batch"

      build_config {
        runtime = "go121"
        entry_point = "NewBatch"  # Set the entry point 
        source {
          storage_source {
            bucket = google_storage_bucket.cloud_functions_bucket.name
            object = google_storage_bucket_object.new_batch.name
          }
        }
      }

      service_config {
        max_instance_count  = 100
        available_memory    = "128Mi"
        timeout_seconds     = 60
        service_account_email = local.service_account_email
        environment_variables = {
            GCP_PROJECT_ID = local.project,
            GCP_BIGQUERY_DATASET = google_bigquery_dataset.dataset.dataset_id
        }
      }
    }
    
    resource "google_cloud_run_service_iam_policy" "new_batch" {
      location = local.location
      project = local.project
      service = google_cloudfunctions2_function.new_batch.service_config[0].service
      policy_data = data.google_iam_policy.cloud_function_run_policy.policy_data
    }
    // end new_batch

    // update_batch
    data "archive_file" "update_batch" {
      type        = "zip"
      source_dir  = "../cloud_functions/update_batch"
      output_path = "../cloud_functions/update_batch/archive/update_batch_function-source.zip"
      excludes    = ["cmd", "archive"]
    }
    
    resource "google_storage_bucket_object" "update_batch" {
      name   = "update_batch/function-source.${data.archive_file.update_batch.output_md5}.zip"
      bucket = google_storage_bucket.cloud_functions_bucket.name
      source = data.archive_file.update_batch.output_path
    }

    resource "google_cloudfunctions2_function" "update_batch" {
      name = "update_batch"
      location = local.location
      description = "Adds a new batch"

      build_config {
        runtime = "go121"
        entry_point = "UpdateBatch"  # Set the entry point 
        source {
          storage_source {
            bucket = google_storage_bucket.cloud_functions_bucket.name
            object = google_storage_bucket_object.update_batch.name
          }
        }
      }

      service_config {
        max_instance_count  = 100
        available_memory    = "128Mi"
        timeout_seconds     = 60
        service_account_email = local.service_account_email
        environment_variables = {
            GCP_PROJECT_ID = local.project,
            GCP_BIGQUERY_DATASET = google_bigquery_dataset.dataset.dataset_id
        }
      }
    }
    
    resource "google_cloud_run_service_iam_policy" "update_batch" {
      location = local.location
      project = local.project
      service = google_cloudfunctions2_function.update_batch.service_config[0].service
      policy_data = data.google_iam_policy.cloud_function_run_policy.policy_data
    }
    // end new_batch
// End Cloud Function Definitions

// App Engine
    resource "google_storage_bucket" "app" {
      name          = "${local.project}-${random_id.app.hex}"
      location      = local.location
      force_destroy = true
      versioning {
        enabled = true
      }
    }
    
    resource "google_storage_bucket" "app-backend" {
      name          = "${local.project}-backend-${random_id.app-backend.hex}"
      location      = local.location
      force_destroy = true
      versioning {
        enabled = true
      }
    }

    resource "random_id" "app" {
      byte_length = 8
    }

    resource "random_id" "app-backend" {
      byte_length = 8
    }

    data "archive_file" "function_dist" {
      type        = "zip"
      source_dir  = "../frontend"
      output_path = "../frontend/app.zip"
      excludes    = ["node_modules", "build", "app.yaml", ".gcloudignore", ".gitignore", ".env"]
    }

    data "archive_file" "function_dist-backend" {
      type        = "zip"
      source_dir  = "../backend"
      output_path = "../backend/app.zip"
      excludes    = ["node_modules", "src", "build", "app.yaml", ".gcloudignore", ".gitignore", ".env", "codegen.ts"]
    }

    resource "google_storage_bucket_object" "app" {
      name   = "app.${data.archive_file.function_dist.output_md5}.zip"
      source = data.archive_file.function_dist.output_path
      bucket = google_storage_bucket.app.name
    }

    resource "google_storage_bucket_object" "app-backend" {
      name   = "app-backend.${data.archive_file.function_dist-backend.output_md5}.zip"
      source = data.archive_file.function_dist-backend.output_path
      bucket = google_storage_bucket.app-backend.name
    }

    resource "google_app_engine_application" "beer_fermentation_tracker" {
      project     = local.project
      location_id = local.location
    }

    resource "google_app_engine_application_url_dispatch_rules" "beer_fermentation_tracker" {
      dispatch_rules {
        domain = "beer-fermentation-tracker.ue.r.appspot.com"
        path = "/*"
        service = google_app_engine_standard_app_version.latest_version.service
      }
    }

    resource "google_app_engine_application_url_dispatch_rules" "beer_fermentation_tracker-backend" {
      dispatch_rules {
        domain = "backend-dot-beer-fermentation-tracker.ue.r.appspot.com"
        path = "/*"
        service = google_app_engine_standard_app_version.backend.service
      }
    }
    
    resource "google_app_engine_standard_app_version" "latest_version" {
      version_id = var.deployment_version
      service    = "default"
      runtime    = "nodejs22"

      entrypoint {
        shell = "npm start"
      }

      deployment {
        zip {
          source_url = "https://storage.googleapis.com/${google_storage_bucket.app.name}/${google_storage_bucket_object.app.name}"
        }
      }
      
      env_variables = {
        REACT_APP_GRAPHQL_API_URL = "https://backend-dot-beer-fermentation-tracker.ue.r.appspot.com"
      }

      instance_class = "F4"

      automatic_scaling {
        max_concurrent_requests = 10
        min_idle_instances      = 1
        max_idle_instances      = 3
        min_pending_latency     = "1s"
        max_pending_latency     = "5s"
        standard_scheduler_settings {
          target_cpu_utilization        = 0.5
          target_throughput_utilization = 0.75
          min_instances                 = 0
          max_instances                 = 4
        }
      }
      noop_on_destroy = true
      delete_service_on_destroy = true
    }
    
    resource "google_app_engine_standard_app_version" "backend" {
      version_id = var.deployment_version
      service    = "backend"
      runtime    = "nodejs22"

      entrypoint {
        shell = "npm start"
      }

      deployment {
        zip {
          source_url = "https://storage.googleapis.com/${google_storage_bucket.app-backend.name}/${google_storage_bucket_object.app-backend.name}"
        }
      }
      
      env_variables = {
        CLOUD_FUNCTIONS_URL = "https://${local.location}-${local.project}.cloudfunctions.net"
        LISTEN_PORT = 80
      }

      instance_class = "F4"

      automatic_scaling {
        max_concurrent_requests = 10
        min_idle_instances      = 1
        max_idle_instances      = 3
        min_pending_latency     = "1s"
        max_pending_latency     = "5s"
        standard_scheduler_settings {
          target_cpu_utilization        = 0.5
          target_throughput_utilization = 0.75
          min_instances                 = 0
          max_instances                 = 4
        }
      }
      noop_on_destroy = true
      delete_service_on_destroy = true
    }
// End App Engine Definitions

// Identity Platform
/*  resource "google_project_service" "identitytoolkit" {
    project = local.project
    service = "identitytoolkit.googleapis.com"
  }

  resource "google_identity_platform_config" "default" {
    project = local.project
    autodelete_anonymous_users = true
    sign_in {
      allow_duplicate_emails = false

      email {
          enabled = true
          password_required = true
      }
    }
    blocking_functions {
      triggers {
        event_type = "beforeSignIn"
        function_uri = "https://us-east1-my-project.cloudfunctions.net/before-sign-in"
      }
      forward_inbound_credentials {
        refresh_token = true
        access_token = true
        id_token = true
      }
    }
    quota {
      sign_up_quota_config {
        quota = 1000
        start_time = ""
        quota_duration = "7200s"
      }
    }
    authorized_domains = [
      "localhost",
      "beer-fermentation-tracker.ue.r.appspot.com",
    ]
  }*/
// End Identity Platgorm Definitions
