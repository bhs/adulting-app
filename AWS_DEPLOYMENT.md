# AWS Deployment Guide

This guide explains how to deploy the Next.js application to AWS using Terraform and Elastic Beanstalk, staying within AWS Free Tier limits.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Infrastructure Setup](#infrastructure-setup)
- [Application Deployment](#application-deployment)
- [Environment Variables](#environment-variables)
- [Custom Domain Setup](#custom-domain-setup)
- [Monitoring and Logs](#monitoring-and-logs)
- [Cost Management](#cost-management)
- [Troubleshooting](#troubleshooting)
- [Cleanup](#cleanup)

## Overview

The infrastructure includes:

- **VPC**: Custom VPC with public and private subnets across 2 availability zones
- **RDS PostgreSQL**: db.t3.micro instance with 20GB storage (free tier)
- **Elastic Beanstalk**: Node.js environment with t3.micro EC2 instances (free tier)
- **S3**: Buckets for application assets and deployment artifacts
- **SSM Parameter Store**: Secure storage for environment variables and secrets
- **Route 53 & ACM**: (Optional) Custom domain with HTTPS certificate
- **CloudWatch**: Application logs and monitoring

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          Internet                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   Application Load     │
            │      Balancer          │
            └───────────┬───────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────┐              ┌───────────────┐
│  Public       │              │  Public       │
│  Subnet 1     │              │  Subnet 2     │
│               │              │               │
│  ┌─────────┐  │              │  ┌─────────┐  │
│  │   EC2   │  │              │  │   EC2   │  │
│  │ t3.micro│  │              │  │ t3.micro│  │
│  │(EB App) │  │              │  │(EB App) │  │
│  └─────────┘  │              │  └─────────┘  │
└───────┬───────┘              └───────┬───────┘
        │                               │
        └───────────────┬───────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   Private Subnets     │
            │                       │
            │  ┌─────────────────┐  │
            │  │   RDS Postgres  │  │
            │  │   db.t3.micro   │  │
            │  └─────────────────┘  │
            └───────────────────────┘
```

## Prerequisites

1. **AWS Account** with Free Tier eligibility
2. **AWS CLI** installed and configured
   ```bash
   # Install AWS CLI
   # macOS
   brew install awscli

   # Linux
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install

   # Configure credentials
   aws configure
   ```

3. **Terraform** >= 1.0
   ```bash
   # macOS
   brew install terraform

   # Linux
   wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
   unzip terraform_1.6.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

4. **Node.js** 20.x and npm

## Infrastructure Setup

### Step 1: Configure Variables

1. Copy the example variables file:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edit `terraform.tfvars` with your settings:
   ```hcl
   aws_region   = "us-east-1"  # Free tier eligible
   project_name = "myapp"      # Must be lowercase, no spaces
   environment  = "production"

   # Optional: Custom domain (leave empty to skip)
   domain_name  = ""           # e.g., "example.com"

   # Database configuration
   db_name      = "nextjsdb"
   db_username  = "dbadmin"
   # db_password will be auto-generated if not set
   ```

3. (Optional) Set database password via environment variable:
   ```bash
   export TF_VAR_db_password="your-secure-password-here"
   ```

### Step 2: Run Setup Script

The easiest way to set up infrastructure:

```bash
./scripts/setup-aws.sh
```

This script will:
- Verify prerequisites
- Initialize Terraform
- Create an execution plan
- Prompt for confirmation
- Apply the infrastructure
- Display outputs including application URL

### Step 3: Manual Setup (Alternative)

If you prefer manual control:

```bash
cd terraform

# Initialize Terraform
terraform init

# Review the execution plan
terraform plan

# Apply the infrastructure
terraform apply

# View outputs
terraform output
```

### Step 4: Note Important Outputs

After successful deployment, save these outputs:

```bash
# Application URL
terraform output application_url

# Database endpoint
terraform output database_endpoint

# SSM parameter path
terraform output ssm_parameter_path

# S3 buckets
terraform output s3_bucket_assets
terraform output s3_bucket_eb_versions

# Route 53 nameservers (if domain configured)
terraform output route53_nameservers
```

## Application Deployment

### Deploy Using Script

```bash
./scripts/deploy.sh
```

The script will:
1. Package the application
2. Upload to S3
3. Create a new application version
4. Deploy to Elastic Beanstalk

### Monitor Deployment

```bash
# Check deployment status
aws elasticbeanstalk describe-environments \
  --environment-names nextjs-app-env \
  --region us-east-1

# Or use EB CLI (if installed)
eb status
```

### Manual Deployment

1. Create application package:
   ```bash
   zip -r app.zip . \
     -x "*.git*" \
     -x "*node_modules*" \
     -x "*.next*" \
     -x "*terraform/*" \
     -x "*.env*"
   ```

2. Upload to S3:
   ```bash
   aws s3 cp app.zip s3://your-eb-versions-bucket/app.zip
   ```

3. Create application version:
   ```bash
   aws elasticbeanstalk create-application-version \
     --application-name nextjs-app \
     --version-label v1 \
     --source-bundle S3Bucket=your-eb-versions-bucket,S3Key=app.zip
   ```

4. Deploy:
   ```bash
   aws elasticbeanstalk update-environment \
     --application-name nextjs-app \
     --environment-name nextjs-app-env \
     --version-label v1
   ```

## Environment Variables

Environment variables are stored securely in AWS SSM Parameter Store and automatically loaded during deployment.

### View Parameters

```bash
# List all parameters
aws ssm get-parameters-by-path \
  --path "/nextjs-app/" \
  --with-decryption \
  --region us-east-1

# Get specific parameter
aws ssm get-parameter \
  --name "/nextjs-app/DATABASE_URL" \
  --with-decryption \
  --query Parameter.Value \
  --output text
```

### Add New Parameters

```bash
aws ssm put-parameter \
  --name "/nextjs-app/NEW_VARIABLE" \
  --value "value" \
  --type "String" \
  --region us-east-1

# For secrets, use SecureString
aws ssm put-parameter \
  --name "/nextjs-app/API_KEY" \
  --value "secret-value" \
  --type "SecureString" \
  --region us-east-1
```

### Update Existing Parameters

```bash
aws ssm put-parameter \
  --name "/nextjs-app/DATABASE_URL" \
  --value "new-value" \
  --type "SecureString" \
  --overwrite \
  --region us-east-1
```

After updating parameters, redeploy the application for changes to take effect.

## Custom Domain Setup

If you configured a domain name in `terraform.tfvars`:

### Step 1: Update Nameservers

Get the Route 53 nameservers:

```bash
cd terraform
terraform output route53_nameservers
```

Update your domain registrar to use these nameservers.

### Step 2: Wait for DNS Propagation

DNS changes can take 24-48 hours to propagate worldwide. Check status:

```bash
dig NS yourdomain.com
```

### Step 3: Verify Certificate

```bash
aws acm describe-certificate \
  --certificate-arn $(terraform output -raw acm_certificate_arn) \
  --region us-east-1
```

The certificate should show status "ISSUED" after DNS validation completes.

### Step 4: Configure HTTPS

Once the certificate is issued, configure Elastic Beanstalk to use HTTPS:

1. Go to AWS Console → Elastic Beanstalk
2. Select your environment
3. Go to Configuration → Load Balancer
4. Add listener on port 443
5. Select your ACM certificate
6. Apply changes

## Monitoring and Logs

### CloudWatch Logs

View application logs:

```bash
# Using EB CLI
eb logs

# Using AWS CLI
aws logs tail /aws/elasticbeanstalk/nextjs-app-env/var/log/eb-engine.log \
  --follow \
  --region us-east-1
```

### Application Health

```bash
# Environment health
aws elasticbeanstalk describe-environment-health \
  --environment-name nextjs-app-env \
  --attribute-names All \
  --region us-east-1

# Instance health
aws elasticbeanstalk describe-instances-health \
  --environment-name nextjs-app-env \
  --region us-east-1
```

### RDS Monitoring

```bash
# Database metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=nextjs-app-db \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --region us-east-1
```

## Cost Management

### Free Tier Limits

This configuration stays within AWS Free Tier:

- **EC2**: 750 hours/month of t3.micro (or t2.micro)
- **RDS**: 750 hours/month of db.t3.micro, 20GB storage
- **S3**: 5GB storage, 20,000 GET requests, 2,000 PUT requests
- **Data Transfer**: 100GB outbound per month
- **CloudWatch**: 10 custom metrics, 5GB log ingestion

### Monitor Costs

```bash
# View current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -d "$(date +%Y-%m-01)" +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=SERVICE
```

### Set Up Billing Alerts

1. Go to AWS Console → Billing → Billing Preferences
2. Enable "Receive Billing Alerts"
3. Go to CloudWatch → Alarms → Create Alarm
4. Select metric: Billing → Total Estimated Charge
5. Set threshold (e.g., $10)
6. Configure SNS notification

## Troubleshooting

### Deployment Fails

1. Check environment logs:
   ```bash
   eb logs
   ```

2. Check recent events:
   ```bash
   aws elasticbeanstalk describe-events \
     --environment-name nextjs-app-env \
     --max-records 20 \
     --region us-east-1
   ```

3. Verify environment health:
   ```bash
   eb health
   ```

### Database Connection Issues

1. Verify security group rules:
   ```bash
   aws ec2 describe-security-groups \
     --filters Name=group-name,Values=nextjs-app-rds-sg \
     --region us-east-1
   ```

2. Test database connectivity from EC2:
   ```bash
   # SSH into EC2 instance
   eb ssh

   # Test connection
   nc -zv <rds-endpoint> 5432
   ```

3. Verify DATABASE_URL parameter:
   ```bash
   aws ssm get-parameter \
     --name "/nextjs-app/DATABASE_URL" \
     --with-decryption \
     --region us-east-1
   ```

### Application Not Starting

1. Check Node.js version:
   ```bash
   # In .ebextensions/03_node_setup.config
   # Ensure Node version matches package.json
   ```

2. Verify build process:
   ```bash
   npm install
   npm run build
   npm start
   ```

3. Check environment variables:
   ```bash
   eb printenv
   ```

## Cleanup

To avoid charges after free tier expires, destroy all resources:

```bash
cd terraform

# Preview what will be destroyed
terraform plan -destroy

# Destroy all resources
terraform destroy

# Confirm by typing: yes
```

**Note**: This will permanently delete:
- All EC2 instances
- RDS database (all data lost unless you have snapshots)
- S3 buckets (if empty)
- CloudWatch logs
- Route 53 hosted zone (if configured)

### Manual Cleanup

If Terraform destroy fails:

1. Delete Elastic Beanstalk environment:
   ```bash
   aws elasticbeanstalk terminate-environment \
     --environment-name nextjs-app-env \
     --region us-east-1
   ```

2. Delete application:
   ```bash
   aws elasticbeanstalk delete-application \
     --application-name nextjs-app \
     --region us-east-1
   ```

3. Empty and delete S3 buckets:
   ```bash
   aws s3 rm s3://bucket-name --recursive
   aws s3 rb s3://bucket-name
   ```

4. Delete RDS instance:
   ```bash
   aws rds delete-db-instance \
     --db-instance-identifier nextjs-app-db \
     --skip-final-snapshot \
     --region us-east-1
   ```

## Additional Resources

- [AWS Free Tier](https://aws.amazon.com/free/)
- [Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

## Support

For issues related to:
- **Infrastructure**: Check Terraform documentation and AWS service limits
- **Application**: Check Next.js and Node.js documentation
- **Database**: Check Prisma documentation and RDS logs
