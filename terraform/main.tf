# Main Terraform configuration for Next.js application on AWS
# This configuration provisions infrastructure within AWS Free Tier limits

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration for storing Terraform state
  # Uncomment after creating the S3 bucket manually for the first time
  # backend "s3" {
  #   bucket         = "nextjs-terraform-state-${var.project_name}"
  #   key            = "terraform.tfstate"
  #   region         = var.aws_region
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}
