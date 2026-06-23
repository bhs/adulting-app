# AWS Systems Manager Parameter Store for environment variables

# Database URL parameter
resource "aws_ssm_parameter" "database_url" {
  name        = "/${var.project_name}/DATABASE_URL"
  description = "PostgreSQL database connection URL"
  type        = "SecureString"
  value = format(
    "postgresql://%s:%s@%s:%s/%s",
    var.db_username,
    var.db_password != "" ? var.db_password : random_password.db_password[0].result,
    aws_db_instance.postgresql.address,
    aws_db_instance.postgresql.port,
    var.db_name
  )

  tags = {
    Name = "${var.project_name}-database-url"
  }
}

# Node Environment parameter
resource "aws_ssm_parameter" "node_env" {
  name        = "/${var.project_name}/NODE_ENV"
  description = "Node environment"
  type        = "String"
  value       = var.node_env

  tags = {
    Name = "${var.project_name}-node-env"
  }
}

# S3 Bucket name parameter
resource "aws_ssm_parameter" "s3_bucket" {
  name        = "/${var.project_name}/S3_BUCKET_NAME"
  description = "S3 bucket for application assets"
  type        = "String"
  value       = aws_s3_bucket.app_assets.id

  tags = {
    Name = "${var.project_name}-s3-bucket"
  }
}

# AWS Region parameter
resource "aws_ssm_parameter" "aws_region" {
  name        = "/${var.project_name}/AWS_REGION"
  description = "AWS region"
  type        = "String"
  value       = var.aws_region

  tags = {
    Name = "${var.project_name}-aws-region"
  }
}

# Database host parameter (separate for convenience)
resource "aws_ssm_parameter" "db_host" {
  name        = "/${var.project_name}/DB_HOST"
  description = "PostgreSQL database host"
  type        = "String"
  value       = aws_db_instance.postgresql.address

  tags = {
    Name = "${var.project_name}-db-host"
  }
}

# Database port parameter
resource "aws_ssm_parameter" "db_port" {
  name        = "/${var.project_name}/DB_PORT"
  description = "PostgreSQL database port"
  type        = "String"
  value       = tostring(aws_db_instance.postgresql.port)

  tags = {
    Name = "${var.project_name}-db-port"
  }
}

# Database name parameter
resource "aws_ssm_parameter" "db_name" {
  name        = "/${var.project_name}/DB_NAME"
  description = "PostgreSQL database name"
  type        = "String"
  value       = var.db_name

  tags = {
    Name = "${var.project_name}-db-name"
  }
}

# Database username parameter
resource "aws_ssm_parameter" "db_username" {
  name        = "/${var.project_name}/DB_USERNAME"
  description = "PostgreSQL database username"
  type        = "SecureString"
  value       = var.db_username

  tags = {
    Name = "${var.project_name}-db-username"
  }
}

# Database password parameter
resource "aws_ssm_parameter" "db_password" {
  name        = "/${var.project_name}/DB_PASSWORD"
  description = "PostgreSQL database password"
  type        = "SecureString"
  value       = var.db_password != "" ? var.db_password : random_password.db_password[0].result

  tags = {
    Name = "${var.project_name}-db-password"
  }
}
