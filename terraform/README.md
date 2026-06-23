# Terraform Infrastructure for Next.js on AWS

This directory contains Terraform configuration for deploying the Next.js application to AWS using Elastic Beanstalk, staying within Free Tier limits.

## Quick Start

```bash
# 1. Configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your settings

# 2. Set database password (optional, will be auto-generated if not set)
export TF_VAR_db_password="your-secure-password"

# 3. Initialize Terraform
terraform init

# 4. Review plan
terraform plan

# 5. Apply infrastructure
terraform apply

# 6. View outputs
terraform output
```

## Files

- **main.tf** - Main Terraform configuration and provider setup
- **variables.tf** - Input variables and their defaults
- **outputs.tf** - Output values after deployment
- **vpc.tf** - VPC, subnets, and networking resources
- **rds.tf** - RDS PostgreSQL database configuration
- **s3.tf** - S3 buckets for storage and deployments
- **elastic-beanstalk.tf** - Elastic Beanstalk application and environment
- **ssm.tf** - SSM Parameter Store for environment variables
- **route53-acm.tf** - Route 53 DNS and ACM certificates (optional)
- **random.tf** - Random resource provider configuration
- **terraform.tfvars.example** - Example variables file

## Resources Created

### Networking
- **VPC** with CIDR 10.0.0.0/16
- **2 Public Subnets** (10.0.1.0/24, 10.0.2.0/24) for application
- **2 Private Subnets** (10.0.11.0/24, 10.0.12.0/24) for database
- **Internet Gateway** for public internet access
- **Security Groups** for application and database

### Compute
- **Elastic Beanstalk Application** for Next.js
- **Elastic Beanstalk Environment** with Node.js 20 platform
- **Auto Scaling Group** with t3.micro instances (min: 1, max: 1)
- **Application Load Balancer**

### Database
- **RDS PostgreSQL 15.5** instance
- **Instance Type**: db.t3.micro (free tier)
- **Storage**: 20GB gp2 (free tier)
- **Backup**: 7-day retention
- **Multi-AZ**: Disabled (for free tier)

### Storage
- **S3 Bucket** for application assets
- **S3 Bucket** for Elastic Beanstalk application versions
- Server-side encryption enabled
- Versioning enabled

### Security & Configuration
- **IAM Roles** for Elastic Beanstalk service and EC2 instances
- **SSM Parameters** for environment variables (DATABASE_URL, etc.)
- **CloudWatch Logs** for application monitoring

### DNS & SSL (Optional)
- **Route 53 Hosted Zone** for custom domain
- **ACM Certificate** for HTTPS
- **DNS Validation** records

## Free Tier Considerations

This configuration is designed to stay within AWS Free Tier limits:

| Resource | Free Tier | Configuration |
|----------|-----------|---------------|
| EC2 | 750 hrs/month t2.micro or t3.micro | t3.micro x1 |
| RDS | 750 hrs/month db.t3.micro, 20GB storage | db.t3.micro, 20GB |
| S3 | 5GB storage, 20K GET, 2K PUT | Standard usage |
| Data Transfer | 100GB/month outbound | Standard usage |
| ALB | 750 hrs/month (first year) | Single ALB |

**Note**:
- Route 53 hosted zones cost ~$0.50/month (not free tier)
- Free tier is available for 12 months after AWS account creation
- Some services (like NAT Gateway) are intentionally excluded to stay free

## Variables

### Required Variables
- `project_name` - Name for resources (lowercase, no spaces)
- `aws_region` - AWS region (default: us-east-1)

### Optional Variables
- `domain_name` - Custom domain (leave empty to skip Route53/ACM)
- `db_password` - Database password (auto-generated if not provided)
- `environment` - Environment name (default: production)
- `node_env` - Node.js environment (default: production)

## Outputs

After deployment, get important information:

```bash
# Application URL
terraform output application_url

# Database endpoint
terraform output database_endpoint

# Database password (from SSM)
aws ssm get-parameter \
  --name $(terraform output -raw database_password_ssm) \
  --with-decryption \
  --query Parameter.Value \
  --output text

# All outputs
terraform output
```

## State Management

By default, Terraform state is stored locally. For production use, configure remote state:

1. Create an S3 bucket for state:
   ```bash
   aws s3 mb s3://myproject-terraform-state
   ```

2. Create a DynamoDB table for locking:
   ```bash
   aws dynamodb create-table \
     --table-name terraform-state-lock \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST
   ```

3. Uncomment backend configuration in `main.tf`:
   ```hcl
   backend "s3" {
     bucket         = "myproject-terraform-state"
     key            = "terraform.tfstate"
     region         = "us-east-1"
     encrypt        = true
     dynamodb_table = "terraform-state-lock"
   }
   ```

4. Initialize backend:
   ```bash
   terraform init -migrate-state
   ```

## Updating Infrastructure

```bash
# Review changes
terraform plan

# Apply changes
terraform apply

# Target specific resource
terraform apply -target=aws_elastic_beanstalk_environment.app
```

## Destroying Infrastructure

```bash
# Preview destruction
terraform plan -destroy

# Destroy all resources
terraform destroy

# Destroy specific resource
terraform destroy -target=aws_elastic_beanstalk_environment.app
```

**Warning**: This will permanently delete all data including the database!

## Troubleshooting

### Terraform Init Fails
```bash
# Clear cache and reinitialize
rm -rf .terraform .terraform.lock.hcl
terraform init
```

### State Lock Issues
```bash
# Force unlock (use with caution)
terraform force-unlock <lock-id>
```

### Resource Already Exists
```bash
# Import existing resource
terraform import aws_s3_bucket.app_assets bucket-name
```

### Plan Shows Unexpected Changes
```bash
# Refresh state
terraform refresh

# Show current state
terraform show
```

## Best Practices

1. **Always run `terraform plan`** before `apply`
2. **Store state remotely** for production
3. **Use workspaces** for multiple environments
4. **Enable deletion protection** for production databases
5. **Tag all resources** for cost tracking
6. **Use variables** instead of hardcoding values
7. **Keep sensitive data** in environment variables or secrets manager

## Additional Commands

```bash
# Format Terraform files
terraform fmt -recursive

# Validate configuration
terraform validate

# Show current state
terraform show

# List resources
terraform state list

# Show specific resource
terraform state show aws_db_instance.postgresql

# Create workspace
terraform workspace new staging

# List workspaces
terraform workspace list

# Switch workspace
terraform workspace select production
```

## Security Notes

- Database password is auto-generated and stored in SSM Parameter Store
- All S3 buckets have encryption enabled
- Security groups follow principle of least privilege
- IAM roles use managed policies where possible
- RDS is in private subnets with no public access
- CloudWatch logs are retained for 7 days

## Support

For issues:
1. Check AWS service quotas and limits
2. Review CloudWatch logs
3. Check Terraform documentation
4. Verify AWS credentials and permissions

## Related Documentation

- [AWS Deployment Guide](../AWS_DEPLOYMENT.md)
- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/)
