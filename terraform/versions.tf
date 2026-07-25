terraform {
  required_version = ">= 1.5.0"

  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.4"
    }
  }

  # Remote state so any team member can run deploys from a fresh machine and the
  # state is never trapped on a single laptop. Two common free options:
  #
  #   1. Terraform Cloud (free tier) — uncomment and set your org/workspace:
  #
  #        cloud {
  #          organization = "adulting-app"
  #          workspaces { name = "production-launch" }
  #        }
  #
  #   2. A GCS bucket — uncomment and point at a bucket you control:
  #
  #        backend "gcs" {
  #          bucket = "adulting-app-tfstate"
  #          prefix = "render/production-launch"
  #        }
  #
  # Leave both commented to use local state for a first `terraform apply`, then
  # switch to a remote backend and run `terraform init -migrate-state`.
}
