# Variables for AWS infrastructure configuration

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1" # Free tier eligible region
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "nextjs-app"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Domain name for the application (leave empty to skip Route53/ACM setup)"
  type        = string
  default     = ""
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "nextjsdb"
}

variable "db_username" {
  description = "PostgreSQL database username"
  type        = string
  default     = "dbadmin"
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
  default     = "" # Must be provided via environment variable or tfvars
}

variable "node_env" {
  description = "Node environment"
  type        = string
  default     = "production"
}

variable "app_port" {
  description = "Application port"
  type        = number
  default     = 3000
}
