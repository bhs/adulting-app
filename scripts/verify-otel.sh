#!/bin/bash

# OpenTelemetry Installation Verification Script
# This script checks if OpenTelemetry is properly configured

echo "🔍 OpenTelemetry Configuration Verification"
echo "=========================================="
echo ""

# Check if required files exist
echo "📁 Checking required files..."
FILES=(
    "instrumentation.ts"
    "lib/otel.ts"
    "lib/otel-browser.tsx"
    "OPENTELEMETRY_SETUP.md"
    "QUICKSTART_OTEL.md"
)

ALL_FILES_EXIST=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        ALL_FILES_EXIST=false
    fi
done
echo ""

# Check if OpenTelemetry packages are in package.json
echo "📦 Checking OpenTelemetry packages..."
if grep -q "@opentelemetry/sdk-node" package.json; then
    echo "  ✅ OpenTelemetry packages found in package.json"
else
    echo "  ❌ OpenTelemetry packages not found in package.json"
    ALL_FILES_EXIST=false
fi
echo ""

# Check if node_modules has OpenTelemetry installed
echo "📚 Checking installed dependencies..."
if [ -d "node_modules/@opentelemetry" ]; then
    PKG_COUNT=$(ls -1 node_modules/@opentelemetry | wc -l | tr -d ' ')
    echo "  ✅ OpenTelemetry packages installed ($PKG_COUNT packages)"
else
    echo "  ⚠️  OpenTelemetry packages not installed yet"
    echo "     Run: npm install"
fi
echo ""

# Check environment variables
echo "🔐 Checking environment variables..."
if [ -f ".env" ]; then
    if grep -q "OTEL_EXPORTER_OTLP_ENDPOINT" .env; then
        ENDPOINT=$(grep "OTEL_EXPORTER_OTLP_ENDPOINT" .env | cut -d'=' -f2 | tr -d '"')
        if [ -z "$ENDPOINT" ] || [ "$ENDPOINT" = "https://otlp-gateway-prod-us-central-0.grafana.net/otlp" ]; then
            echo "  ⚠️  OTEL_EXPORTER_OTLP_ENDPOINT not configured (using example value)"
        else
            echo "  ✅ OTEL_EXPORTER_OTLP_ENDPOINT configured"
        fi
    else
        echo "  ⚠️  OTEL_EXPORTER_OTLP_ENDPOINT not found in .env"
    fi

    if grep -q "OTEL_EXPORTER_OTLP_HEADERS" .env; then
        HEADERS=$(grep "OTEL_EXPORTER_OTLP_HEADERS" .env | cut -d'=' -f2 | tr -d '"')
        if [ -z "$HEADERS" ] || [[ "$HEADERS" == *"<base64-encoded"* ]]; then
            echo "  ⚠️  OTEL_EXPORTER_OTLP_HEADERS not configured (using example value)"
        else
            echo "  ✅ OTEL_EXPORTER_OTLP_HEADERS configured"
        fi
    else
        echo "  ⚠️  OTEL_EXPORTER_OTLP_HEADERS not found in .env"
    fi

    if grep -q "OTEL_SERVICE_NAME" .env; then
        echo "  ✅ OTEL_SERVICE_NAME configured"
    else
        echo "  ⚠️  OTEL_SERVICE_NAME not found in .env"
    fi
else
    echo "  ⚠️  .env file not found"
    echo "     Run: cp .env.example .env"
fi
echo ""

# Check Next.js config
echo "⚙️  Checking Next.js configuration..."
if grep -q "instrumentationHook" next.config.js; then
    echo "  ✅ instrumentationHook enabled in next.config.js"
else
    echo "  ❌ instrumentationHook not enabled in next.config.js"
fi
echo ""

# Summary
echo "=========================================="
if [ "$ALL_FILES_EXIST" = true ]; then
    echo "✅ All required files are present"
else
    echo "❌ Some required files are missing"
fi
echo ""

echo "📖 Next steps:"
echo "  1. Configure your .env file with OTLP credentials"
echo "  2. Run: npm install"
echo "  3. Run: npm run dev"
echo "  4. Check console for: [OpenTelemetry] SDK initialized successfully"
echo ""
echo "📚 Documentation:"
echo "  - Quick Start: QUICKSTART_OTEL.md"
echo "  - Full Guide:  OPENTELEMETRY_SETUP.md"
echo ""
