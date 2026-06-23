#!/bin/bash

# GCP Cloud Run Deployment Script for Next.js App
# This script deploys the adulting-app to Google Cloud Run with Cloud SQL PostgreSQL

set -e  # Exit on error

# Configuration variables
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-adulting-app}"
CLOUD_SQL_INSTANCE="${CLOUD_SQL_INSTANCE:-adulting-db}"
DATABASE_NAME="${DATABASE_NAME:-adulting}"
DATABASE_USER="${DATABASE_USER:-appuser}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}GCP Cloud Run Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${YELLOW}Not logged in to gcloud. Running authentication...${NC}"
    gcloud auth login
fi

# Set project
echo -e "${YELLOW}Setting GCP project to: ${PROJECT_ID}${NC}"
gcloud config set project "${PROJECT_ID}"

# Enable required APIs
echo -e "${YELLOW}Enabling required GCP APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    sql-component.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    --project="${PROJECT_ID}"

echo -e "${GREEN}APIs enabled successfully!${NC}"
echo ""

# Build and submit container image
echo -e "${YELLOW}Building container image with Cloud Build...${NC}"
gcloud builds submit \
    --tag "gcr.io/${PROJECT_ID}/${SERVICE_NAME}" \
    --project="${PROJECT_ID}" \
    .

echo -e "${GREEN}Container image built successfully!${NC}"
echo ""

# Check if Cloud SQL instance exists, if not, create it
echo -e "${YELLOW}Checking Cloud SQL instance...${NC}"
if gcloud sql instances describe "${CLOUD_SQL_INSTANCE}" --project="${PROJECT_ID}" &> /dev/null; then
    echo -e "${GREEN}Cloud SQL instance '${CLOUD_SQL_INSTANCE}' already exists.${NC}"
else
    echo -e "${YELLOW}Creating Cloud SQL PostgreSQL instance '${CLOUD_SQL_INSTANCE}'...${NC}"
    echo -e "${YELLOW}This may take several minutes...${NC}"
    gcloud sql instances create "${CLOUD_SQL_INSTANCE}" \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region="${REGION}" \
        --project="${PROJECT_ID}"

    echo -e "${GREEN}Cloud SQL instance created successfully!${NC}"
fi
echo ""

# Create database if it doesn't exist
echo -e "${YELLOW}Checking if database '${DATABASE_NAME}' exists...${NC}"
if gcloud sql databases describe "${DATABASE_NAME}" \
    --instance="${CLOUD_SQL_INSTANCE}" \
    --project="${PROJECT_ID}" &> /dev/null 2>&1; then
    echo -e "${GREEN}Database '${DATABASE_NAME}' already exists.${NC}"
else
    echo -e "${YELLOW}Creating database '${DATABASE_NAME}'...${NC}"
    gcloud sql databases create "${DATABASE_NAME}" \
        --instance="${CLOUD_SQL_INSTANCE}" \
        --project="${PROJECT_ID}"
    echo -e "${GREEN}Database created successfully!${NC}"
fi
echo ""

# Create database user if it doesn't exist
echo -e "${YELLOW}Checking database user...${NC}"
if gcloud sql users describe "${DATABASE_USER}" \
    --instance="${CLOUD_SQL_INSTANCE}" \
    --project="${PROJECT_ID}" &> /dev/null 2>&1; then
    echo -e "${GREEN}Database user '${DATABASE_USER}' already exists.${NC}"
else
    echo -e "${YELLOW}Creating database user '${DATABASE_USER}'...${NC}"
    # Generate a random password
    DB_PASSWORD=$(openssl rand -base64 32)
    gcloud sql users create "${DATABASE_USER}" \
        --instance="${CLOUD_SQL_INSTANCE}" \
        --password="${DB_PASSWORD}" \
        --project="${PROJECT_ID}"

    echo -e "${GREEN}Database user created successfully!${NC}"

    # Store password in Secret Manager
    echo -e "${YELLOW}Storing database password in Secret Manager...${NC}"
    echo -n "${DB_PASSWORD}" | gcloud secrets create db-password \
        --data-file=- \
        --replication-policy="automatic" \
        --project="${PROJECT_ID}" 2>/dev/null || \
    echo -n "${DB_PASSWORD}" | gcloud secrets versions add db-password \
        --data-file=- \
        --project="${PROJECT_ID}"

    echo -e "${GREEN}Password stored in Secret Manager as 'db-password'${NC}"
fi
echo ""

# Get Cloud SQL connection name
CONNECTION_NAME=$(gcloud sql instances describe "${CLOUD_SQL_INSTANCE}" \
    --format="value(connectionName)" \
    --project="${PROJECT_ID}")

echo -e "${YELLOW}Cloud SQL connection name: ${CONNECTION_NAME}${NC}"
echo ""

# Construct DATABASE_URL
# Retrieve password from Secret Manager
DB_PASSWORD=$(gcloud secrets versions access latest \
    --secret="db-password" \
    --project="${PROJECT_ID}")

DATABASE_URL="postgresql://${DATABASE_USER}:${DB_PASSWORD}@localhost/${DATABASE_NAME}?host=/cloudsql/${CONNECTION_NAME}"

# Store DATABASE_URL in Secret Manager
echo -e "${YELLOW}Storing DATABASE_URL in Secret Manager...${NC}"
echo -n "${DATABASE_URL}" | gcloud secrets create database-url \
    --data-file=- \
    --replication-policy="automatic" \
    --project="${PROJECT_ID}" 2>/dev/null || \
echo -n "${DATABASE_URL}" | gcloud secrets versions add database-url \
    --data-file=- \
    --project="${PROJECT_ID}"

echo -e "${GREEN}DATABASE_URL stored in Secret Manager!${NC}"
echo ""

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy "${SERVICE_NAME}" \
    --image="gcr.io/${PROJECT_ID}/${SERVICE_NAME}" \
    --platform=managed \
    --region="${REGION}" \
    --allow-unauthenticated \
    --add-cloudsql-instances="${CONNECTION_NAME}" \
    --set-secrets="DATABASE_URL=database-url:latest" \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --project="${PROJECT_ID}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

# Get the service URL
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
    --platform=managed \
    --region="${REGION}" \
    --format="value(status.url)" \
    --project="${PROJECT_ID}")

echo ""
echo -e "${GREEN}Your application is now live at:${NC}"
echo -e "${GREEN}${SERVICE_URL}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run database migrations:"
echo "   gcloud run jobs execute ${SERVICE_NAME}-migrate --region=${REGION}"
echo ""
echo "2. (Optional) Map a custom domain:"
echo "   gcloud run domain-mappings create --service=${SERVICE_NAME} --domain=yourdomain.com --region=${REGION}"
echo ""
echo -e "${YELLOW}Cloud SQL Connection Details:${NC}"
echo "Instance: ${CLOUD_SQL_INSTANCE}"
echo "Database: ${DATABASE_NAME}"
echo "User: ${DATABASE_USER}"
echo "Connection Name: ${CONNECTION_NAME}"
echo ""
