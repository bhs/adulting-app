#!/bin/bash

# Telemetry Implementation Verification Script
# Run this to verify the Honeycomb OpenTelemetry setup is complete

set -e

echo "🔍 Verifying Honeycomb OpenTelemetry Implementation..."
echo ""

# Check for required files
echo "📁 Checking for implementation files..."
files=(
  "lib/telemetry.ts"
  "lib/analytics.ts"
  "components/ErrorBoundary.tsx"
  "components/ClientLayout.tsx"
  "components/AnalyticsExample.tsx"
  "HONEYCOMB_SETUP.md"
  "TELEMETRY_QUICKSTART.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ Missing: $file"
    exit 1
  fi
done

echo ""
echo "📦 Checking package.json dependencies..."

required_deps=(
  "@honeycombio/opentelemetry-web"
  "@opentelemetry/api"
  "@opentelemetry/exporter-trace-otlp-http"
  "@opentelemetry/resources"
  "@opentelemetry/sdk-trace-web"
  "@opentelemetry/semantic-conventions"
)

for dep in "${required_deps[@]}"; do
  if grep -q "\"$dep\"" package.json; then
    echo "  ✅ $dep"
  else
    echo "  ❌ Missing dependency: $dep"
    exit 1
  fi
done

echo ""
echo "🔧 Checking environment configuration..."

if grep -q "NEXT_PUBLIC_HONEYCOMB_API_KEY" .env.example; then
  echo "  ✅ .env.example has Honeycomb config"
else
  echo "  ❌ .env.example missing Honeycomb config"
  exit 1
fi

echo ""
echo "📝 Checking code integration..."

if grep -q "ClientLayout" app/layout.tsx; then
  echo "  ✅ ClientLayout integrated in app/layout.tsx"
else
  echo "  ❌ ClientLayout not integrated in app/layout.tsx"
  exit 1
fi

if grep -q "AnalyticsExample" app/page.tsx; then
  echo "  ✅ AnalyticsExample added to home page"
else
  echo "  ⚠️  AnalyticsExample not in home page (optional)"
fi

echo ""
echo "✨ All checks passed!"
echo ""
echo "📋 Next steps:"
echo "  1. Install dependencies: npm install"
echo "  2. Get Honeycomb API key: https://ui.honeycomb.io/account"
echo "  3. Create .env.local and add:"
echo "     NEXT_PUBLIC_HONEYCOMB_API_KEY=\"your-key-here\""
echo "  4. Start dev server: npm run dev"
echo "  5. Test at: http://localhost:3000"
echo ""
echo "📖 See HONEYCOMB_SETUP.md for complete setup guide"
echo "🚀 See TELEMETRY_QUICKSTART.md for quick reference"
