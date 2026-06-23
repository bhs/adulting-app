# RDS PostgreSQL Database (Free Tier)

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# Random password for database if not provided
resource "random_password" "db_password" {
  count   = var.db_password == "" ? 1 : 0
  length  = 16
  special = true
}

# RDS PostgreSQL Instance (Free Tier: db.t3.micro, 20GB storage)
resource "aws_db_instance" "postgresql" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "15.5" # Free tier eligible version

  # Free tier instance class
  instance_class = "db.t3.micro"

  # Free tier storage (up to 20GB)
  allocated_storage     = 20
  max_allocated_storage = 20 # Disable auto-scaling to stay in free tier
  storage_type          = "gp2"
  storage_encrypted     = true

  # Database configuration
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password != "" ? var.db_password : random_password.db_password[0].result

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # Backup configuration (7 days free tier)
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  # High availability - disabled for free tier
  multi_az = false

  # Skip final snapshot for easier cleanup (change for production)
  skip_final_snapshot = true
  # final_snapshot_identifier = "${var.project_name}-final-snapshot"

  # Parameter group
  parameter_group_name = aws_db_parameter_group.postgresql.name

  # Enable deletion protection for production
  deletion_protection = false

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  # Enhanced monitoring - disabled for free tier
  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = {
    Name = "${var.project_name}-postgresql"
  }
}

# DB Parameter Group
resource "aws_db_parameter_group" "postgresql" {
  name   = "${var.project_name}-postgres-params"
  family = "postgres15"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  tags = {
    Name = "${var.project_name}-postgres-params"
  }
}
