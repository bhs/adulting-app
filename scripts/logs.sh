#!/bin/bash
# View AWS Elastic Beanstalk logs

set -e

# Configuration
APP_NAME="${APP_NAME:-nextjs-app}"
ENV_NAME="${ENV_NAME:-nextjs-app-env}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}AWS Elastic Beanstalk Logs${NC}"
echo "Environment: $ENV_NAME"
echo ""

# Check if EB CLI is installed
if command -v eb &> /dev/null; then
    echo -e "${GREEN}Using EB CLI (recommended)${NC}"
    echo ""
    echo "Options:"
    echo "  1. View all logs"
    echo "  2. Tail logs (follow)"
    echo "  3. View specific log file"
    echo ""
    read -p "Select option (1-3): " -r

    case $REPLY in
        1)
            eb logs
            ;;
        2)
            echo -e "${YELLOW}Press Ctrl+C to stop tailing${NC}"
            eb logs --stream
            ;;
        3)
            echo ""
            echo "Common log files:"
            echo "  - /var/log/eb-engine.log (deployment logs)"
            echo "  - /var/log/web.stdout.log (application stdout)"
            echo "  - /var/log/web.stderr.log (application stderr)"
            echo "  - /var/log/nginx/access.log (nginx access)"
            echo "  - /var/log/nginx/error.log (nginx errors)"
            echo ""
            read -p "Enter log file path: " -r LOG_FILE
            eb logs --log-file "$LOG_FILE"
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac
else
    echo -e "${YELLOW}EB CLI not found, using AWS CLI${NC}"
    echo -e "${YELLOW}Install EB CLI for better experience: pip install awsebcli${NC}"
    echo ""

    # List available log groups
    echo -e "${GREEN}Available CloudWatch log groups:${NC}"
    aws logs describe-log-groups \
        --log-group-name-prefix "/aws/elasticbeanstalk/$ENV_NAME" \
        --query 'logGroups[*].logGroupName' \
        --output table \
        --region "$AWS_REGION"

    echo ""
    echo "Select log type:"
    echo "  1. Engine logs (deployment)"
    echo "  2. Application stdout"
    echo "  3. Application stderr"
    echo "  4. Nginx access logs"
    echo "  5. Nginx error logs"
    echo ""
    read -p "Select option (1-5): " -r

    case $REPLY in
        1)
            LOG_GROUP="/aws/elasticbeanstalk/$ENV_NAME/var/log/eb-engine.log"
            ;;
        2)
            LOG_GROUP="/aws/elasticbeanstalk/$ENV_NAME/var/log/web.stdout.log"
            ;;
        3)
            LOG_GROUP="/aws/elasticbeanstalk/$ENV_NAME/var/log/web.stderr.log"
            ;;
        4)
            LOG_GROUP="/aws/elasticbeanstalk/$ENV_NAME/var/log/nginx/access.log"
            ;;
        5)
            LOG_GROUP="/aws/elasticbeanstalk/$ENV_NAME/var/log/nginx/error.log"
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac

    echo ""
    echo "Tail or view?"
    echo "  1. View last 100 lines"
    echo "  2. Tail (follow) logs"
    echo ""
    read -p "Select option (1-2): " -r

    case $REPLY in
        1)
            echo -e "${GREEN}Fetching logs from: $LOG_GROUP${NC}"
            aws logs tail "$LOG_GROUP" \
                --since 1h \
                --region "$AWS_REGION"
            ;;
        2)
            echo -e "${GREEN}Tailing logs from: $LOG_GROUP${NC}"
            echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
            aws logs tail "$LOG_GROUP" \
                --follow \
                --region "$AWS_REGION"
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac
fi

echo ""
echo -e "${GREEN}Done${NC}"
