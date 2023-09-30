################################################################################
# Terraform & Providers
################################################################################

terraform {
  required_version = ">= 1.2.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.84.0"
    }
  }
  
  backend "gcs" {
    bucket  = "beer_fermentation_tracker_terraform_state"
    prefix  = "terraform"
  }
}

provider "google" {
  project     = "beer-fermentation-tracker"
  region      = "us-east1"
}
