#!/bin/bash

# Database Migration Script for Cloud Run
# This script runs Prisma migrations against Cloud SQL

set -e

# Configuration variables
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
CLOUD_SQL_INSTANCE="${CLOUD_SQL_INSTANCE:-adulting-db}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Database Migration Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get DATABASE_URL from Secret Manager
echo -e "${YELLOW}Retrieving DATABASE_URL from Secret Manager...${NC}"
DATABASE_URL=$(gcloud secrets versions access latest \
    --secret="database-url" \
    --project="${PROJECT_ID}")

# Get Cloud SQL connection name
CONNECTION_NAME=$(gcloud sql instances describe "${CLOUD_SQL_INSTANCE}" \
    --format="value(connectionName)" \
    --project="${PROJECT_ID}")

echo -e "${GREEN}Connected to Cloud SQL instance: ${CONNECTION_NAME}${NC}"
echo ""

# Start Cloud SQL Proxy
echo -e "${YELLOW}Starting Cloud SQL Proxy...${NC}"
cloud_sql_proxy -instances="${CONNECTION_NAME}"=tcp:5432 &
PROXY_PID=$!

# Wait for proxy to be ready
sleep 3

# Run Prisma migrations
echo -e "${YELLOW}Running Prisma migrations...${NC}"
export DATABASE_URL="${DATABASE_URL}"
npx prisma migrate deploy

echo -e "${GREEN}Migrations completed successfully!${NC}"
echo ""

# Generate Prisma Client
echo -e "${YELLOW}Generating Prisma Client...${NC}"
npx prisma generate

echo -e "${GREEN}Prisma Client generated!${NC}"
echo ""

# Kill the proxy
kill $PROXY_PID

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Migration Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
