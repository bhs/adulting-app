#!/bin/bash
# Initial AWS setup script for Terraform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}AWS Infrastructure Setup${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: Terraform is not installed${NC}"
    echo "Please install Terraform: https://www.terraform.io/downloads.html"
    exit 1
fi

echo -e "${GREEN}✓ Terraform is installed${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI is installed${NC}"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    echo "Please configure AWS credentials:"
    echo "  aws configure"
    exit 1
fi

echo -e "${GREEN}✓ AWS credentials configured${NC}"

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_USER=$(aws sts get-caller-identity --query Arn --output text)

echo ""
echo -e "${YELLOW}AWS Account Information:${NC}"
echo "  Account ID: $AWS_ACCOUNT_ID"
echo "  User/Role: $AWS_USER"
echo ""

# Navigate to terraform directory
cd terraform

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo -e "${YELLOW}Creating terraform.tfvars from example...${NC}"
    cp terraform.tfvars.example terraform.tfvars
    echo -e "${GREEN}✓ terraform.tfvars created${NC}"
    echo ""
    echo -e "${YELLOW}Please edit terraform.tfvars with your configuration:${NC}"
    echo "  - Set project_name (lowercase, no spaces)"
    echo "  - Set aws_region (e.g., us-east-1)"
    echo "  - Optionally set domain_name for custom domain"
    echo "  - Set db_password or it will be auto-generated"
    echo ""
    read -p "Press Enter to continue after editing terraform.tfvars..."
fi

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Terraform Initialization${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Initialize Terraform
echo -e "${GREEN}Running terraform init...${NC}"
terraform init

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Terraform initialization failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Terraform initialized successfully${NC}"
echo ""

# Validate configuration
echo -e "${GREEN}Validating Terraform configuration...${NC}"
terraform validate

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Terraform validation failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Configuration is valid${NC}"
echo ""

# Plan infrastructure
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Infrastructure Plan${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

echo -e "${GREEN}Running terraform plan...${NC}"
terraform plan -out=tfplan

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Terraform plan failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Plan created successfully${NC}"
echo ""
echo -e "${YELLOW}Review the plan above. This will create:${NC}"
echo "  - VPC with public and private subnets"
echo "  - RDS PostgreSQL database (db.t3.micro, free tier)"
echo "  - S3 buckets for assets and deployments"
echo "  - Elastic Beanstalk application and environment"
echo "  - IAM roles and security groups"
echo "  - SSM Parameter Store entries"
echo "  - (Optional) Route 53 hosted zone and ACM certificate"
echo ""
echo -e "${YELLOW}Estimated costs:${NC}"
echo "  - Most resources are free tier eligible"
echo "  - Elastic Beanstalk: t3.micro EC2 (750 hours/month free)"
echo "  - RDS: db.t3.micro (750 hours/month free, 20GB storage)"
echo "  - Data transfer: First 100GB/month free"
echo "  - Route 53: ~\$0.50/month per hosted zone (if domain configured)"
echo ""

read -p "Do you want to apply this plan? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

# Apply infrastructure
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Applying Infrastructure${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

echo -e "${GREEN}Running terraform apply...${NC}"
terraform apply tfplan

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Terraform apply failed${NC}"
    exit 1
fi

# Clean up plan file
rm -f tfplan

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Infrastructure Created Successfully!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Display outputs
echo -e "${YELLOW}Important Information:${NC}"
echo ""
terraform output

echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Note the application URL from the output above"
echo "  2. If you configured a domain, update your DNS nameservers"
echo "  3. Deploy your application:"
echo "     cd .."
echo "     ./scripts/deploy.sh"
echo ""
echo -e "${YELLOW}Database Password:${NC}"
echo "  Retrieve from SSM Parameter Store:"
echo "  aws ssm get-parameter --name \$(terraform output -raw database_password_ssm) --with-decryption --query Parameter.Value --output text"
echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
