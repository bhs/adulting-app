#!/bin/bash

# Analytics Setup Verification Script
# This script checks if all required environment variables and dependencies are configured

echo "🔍 Verifying Analytics Setup..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}✗${NC} .env file not found"
    echo "  Run: cp .env.example .env"
    exit 1
else
    echo -e "${GREEN}✓${NC} .env file exists"
fi

# Source .env file
set -a
source .env
set +a

echo ""
echo "📊 Checking Sentry Configuration..."

# Check Sentry DSN
if [ -z "$NEXT_PUBLIC_SENTRY_DSN" ]; then
    echo -e "${RED}✗${NC} NEXT_PUBLIC_SENTRY_DSN not set"
    echo "  Get your DSN from: https://sentry.io/settings/projects/"
else
    echo -e "${GREEN}✓${NC} NEXT_PUBLIC_SENTRY_DSN is configured"
fi

# Check Sentry Org (optional)
if [ -z "$SENTRY_ORG" ]; then
    echo -e "${YELLOW}⚠${NC} SENTRY_ORG not set (optional, needed for source maps)"
else
    echo -e "${GREEN}✓${NC} SENTRY_ORG is configured"
fi

# Check Sentry Project (optional)
if [ -z "$SENTRY_PROJECT" ]; then
    echo -e "${YELLOW}⚠${NC} SENTRY_PROJECT not set (optional, needed for source maps)"
else
    echo -e "${GREEN}✓${NC} SENTRY_PROJECT is configured"
fi

echo ""
echo "📈 Checking Plausible Configuration..."

# Check Plausible Domain
if [ -z "$NEXT_PUBLIC_PLAUSIBLE_DOMAIN" ]; then
    echo -e "${RED}✗${NC} NEXT_PUBLIC_PLAUSIBLE_DOMAIN not set"
    echo "  Add your domain (e.g., yourdomain.com)"
else
    echo -e "${GREEN}✓${NC} NEXT_PUBLIC_PLAUSIBLE_DOMAIN is configured: $NEXT_PUBLIC_PLAUSIBLE_DOMAIN"
fi

# Check Plausible API Host
if [ -z "$NEXT_PUBLIC_PLAUSIBLE_API_HOST" ]; then
    echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_PLAUSIBLE_API_HOST not set (will use default)"
else
    echo -e "${GREEN}✓${NC} NEXT_PUBLIC_PLAUSIBLE_API_HOST is configured: $NEXT_PUBLIC_PLAUSIBLE_API_HOST"
fi

echo ""
echo "📦 Checking Dependencies..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}✗${NC} node_modules not found"
    echo "  Run: npm install"
    exit 1
fi

# Check for Sentry package
if [ -d "node_modules/@sentry/nextjs" ]; then
    echo -e "${GREEN}✓${NC} @sentry/nextjs is installed"
else
    echo -e "${RED}✗${NC} @sentry/nextjs not found"
    echo "  Run: npm install"
    exit 1
fi

# Check for Plausible package
if [ -d "node_modules/plausible-tracker" ]; then
    echo -e "${GREEN}✓${NC} plausible-tracker is installed"
else
    echo -e "${RED}✗${NC} plausible-tracker not found"
    echo "  Run: npm install"
    exit 1
fi

echo ""
echo "📝 Checking Configuration Files..."

# Check Sentry config files
for file in sentry.client.config.ts sentry.server.config.ts sentry.edge.config.ts; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file not found"
    fi
done

# Check analytics files
for file in lib/analytics.ts components/PlausibleScript.tsx app/error.tsx; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file not found"
    fi
done

echo ""
echo "🎯 Summary:"

if [ -z "$NEXT_PUBLIC_SENTRY_DSN" ] || [ -z "$NEXT_PUBLIC_PLAUSIBLE_DOMAIN" ]; then
    echo -e "${YELLOW}⚠ Configuration incomplete${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Sign up for Sentry: https://sentry.io/signup"
    echo "2. Sign up for Plausible: https://plausible.io/register"
    echo "3. Update .env with your credentials"
    echo "4. Run: npm run dev"
    echo "5. Test: Open browser console and run analyticsTest.runAll()"
    echo ""
    echo "See ANALYTICS_QUICKSTART.md for detailed instructions"
    exit 1
else
    echo -e "${GREEN}✓ All critical configuration complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm run dev"
    echo "2. Open: http://localhost:3000"
    echo "3. Test: Open browser console and run analyticsTest.runAll()"
    echo "4. Check dashboards:"
    echo "   - Sentry: https://sentry.io/organizations/[org]/issues/"
    echo "   - Plausible: https://plausible.io/$NEXT_PUBLIC_PLAUSIBLE_DOMAIN"
    echo ""
    echo "See ANALYTICS.md for complete documentation"
fi
