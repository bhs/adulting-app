# S3 Bucket for object storage and application assets

# S3 Bucket for application assets
resource "aws_s3_bucket" "app_assets" {
  bucket = "${var.project_name}-assets-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "${var.project_name}-assets"
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "app_assets" {
  bucket = aws_s3_bucket.app_assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "app_assets" {
  bucket = aws_s3_bucket.app_assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "app_assets" {
  bucket = aws_s3_bucket.app_assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket for Elastic Beanstalk application versions
resource "aws_s3_bucket" "eb_versions" {
  bucket = "${var.project_name}-eb-versions-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "${var.project_name}-eb-versions"
  }
}

# S3 Bucket Versioning for EB
resource "aws_s3_bucket_versioning" "eb_versions" {
  bucket = aws_s3_bucket.eb_versions.id

  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Encryption for EB
resource "aws_s3_bucket_server_side_encryption_configuration" "eb_versions" {
  bucket = aws_s3_bucket.eb_versions.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket Public Access Block for EB
resource "aws_s3_bucket_public_access_block" "eb_versions" {
  bucket = aws_s3_bucket.eb_versions.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket Lifecycle for EB versions (cleanup old versions)
resource "aws_s3_bucket_lifecycle_configuration" "eb_versions" {
  bucket = aws_s3_bucket.eb_versions.id

  rule {
    id     = "cleanup-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}
