#!/bin/bash
# Deployment script for AWS Elastic Beanstalk

set -e

# Configuration
APP_NAME="${APP_NAME:-nextjs-app}"
ENV_NAME="${ENV_NAME:-nextjs-app-env}"
VERSION_LABEL="v$(date +%Y%m%d-%H%M%S)"
S3_BUCKET="${S3_BUCKET:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment to AWS Elastic Beanstalk${NC}"
echo "Application: $APP_NAME"
echo "Environment: $ENV_NAME"
echo "Version: $VERSION_LABEL"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if EB CLI is installed (optional but recommended)
if ! command -v eb &> /dev/null; then
    echo -e "${YELLOW}Warning: EB CLI is not installed${NC}"
    echo "Using AWS CLI for deployment (EB CLI recommended for easier management)"
fi

# Get S3 bucket from Terraform output if not provided
if [ -z "$S3_BUCKET" ]; then
    echo "Fetching S3 bucket from Terraform outputs..."
    cd terraform
    S3_BUCKET=$(terraform output -raw s3_bucket_eb_versions 2>/dev/null || echo "")
    cd ..

    if [ -z "$S3_BUCKET" ]; then
        echo -e "${RED}Error: S3 bucket not found${NC}"
        echo "Please run 'terraform apply' first or set S3_BUCKET environment variable"
        exit 1
    fi
fi

echo "S3 Bucket: $S3_BUCKET"
echo ""

# Create application archive
echo -e "${GREEN}Creating application archive...${NC}"
ARCHIVE_NAME="${VERSION_LABEL}.zip"

# Files to exclude from deployment
zip -r "$ARCHIVE_NAME" . \
    -x "*.git*" \
    -x "*node_modules*" \
    -x "*.next*" \
    -x "*terraform/*" \
    -x "*.terraform/*" \
    -x "*scripts/*" \
    -x "*.DS_Store*" \
    -x "*prisma/dev.db*" \
    -x "*prisma/migrations/*" \
    -x "*.env*" \
    -x "*README.md*" \
    -x "*DEVELOPMENT.md*"

if [ ! -f "$ARCHIVE_NAME" ]; then
    echo -e "${RED}Error: Failed to create archive${NC}"
    exit 1
fi

echo -e "${GREEN}Archive created: $ARCHIVE_NAME${NC}"
ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
echo "Size: $ARCHIVE_SIZE"
echo ""

# Upload to S3
echo -e "${GREEN}Uploading to S3...${NC}"
aws s3 cp "$ARCHIVE_NAME" "s3://$S3_BUCKET/$ARCHIVE_NAME" --region "$AWS_REGION"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to upload to S3${NC}"
    rm "$ARCHIVE_NAME"
    exit 1
fi

echo -e "${GREEN}Upload successful${NC}"
echo ""

# Create application version
echo -e "${GREEN}Creating application version...${NC}"
aws elasticbeanstalk create-application-version \
    --application-name "$APP_NAME" \
    --version-label "$VERSION_LABEL" \
    --source-bundle S3Bucket="$S3_BUCKET",S3Key="$ARCHIVE_NAME" \
    --region "$AWS_REGION"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to create application version${NC}"
    rm "$ARCHIVE_NAME"
    exit 1
fi

echo -e "${GREEN}Application version created${NC}"
echo ""

# Update environment
echo -e "${GREEN}Deploying to environment...${NC}"
aws elasticbeanstalk update-environment \
    --application-name "$APP_NAME" \
    --environment-name "$ENV_NAME" \
    --version-label "$VERSION_LABEL" \
    --region "$AWS_REGION"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to update environment${NC}"
    rm "$ARCHIVE_NAME"
    exit 1
fi

# Clean up local archive
rm "$ARCHIVE_NAME"

echo ""
echo -e "${GREEN}Deployment initiated successfully!${NC}"
echo ""
echo "Monitor deployment status:"
echo "  aws elasticbeanstalk describe-environments --environment-names $ENV_NAME --region $AWS_REGION"
echo ""
echo "Or use EB CLI:"
echo "  eb status"
echo ""
echo "View logs:"
echo "  eb logs"
echo ""
