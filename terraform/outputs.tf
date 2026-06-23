# Terraform Outputs

output "application_url" {
  description = "URL of the deployed application"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "http://${aws_elastic_beanstalk_environment.app.cname}"
}

output "elastic_beanstalk_cname" {
  description = "Elastic Beanstalk environment CNAME"
  value       = aws_elastic_beanstalk_environment.app.cname
}

output "database_endpoint" {
  description = "RDS PostgreSQL database endpoint"
  value       = aws_db_instance.postgresql.endpoint
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.postgresql.db_name
}

output "s3_bucket_assets" {
  description = "S3 bucket for application assets"
  value       = aws_s3_bucket.app_assets.id
}

output "s3_bucket_eb_versions" {
  description = "S3 bucket for Elastic Beanstalk application versions"
  value       = aws_s3_bucket.eb_versions.id
}

output "ssm_parameter_path" {
  description = "SSM Parameter Store path for application secrets"
  value       = "/${var.project_name}/"
}

output "route53_nameservers" {
  description = "Route 53 nameservers (configure these at your domain registrar)"
  value       = var.domain_name != "" ? aws_route53_zone.main[0].name_servers : []
}

output "acm_certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].arn : null
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "database_password_ssm" {
  description = "SSM parameter name containing database password"
  value       = aws_ssm_parameter.db_password.name
  sensitive   = true
}
