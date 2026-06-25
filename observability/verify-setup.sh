#!/bin/bash

# Verify OpenTelemetry + Grafana Observability Stack Setup
# This script checks if all components are working correctly

set -e

echo "🔍 Verifying OpenTelemetry + Grafana Observability Stack..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check HTTP endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}

    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo -e "${GREEN}✅ $name is accessible${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is not accessible${NC}"
        return 1
    fi
}

# Check if Docker Compose is running
echo "📦 Checking Docker containers..."
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ Docker Compose stack is not running${NC}"
    echo "Run: docker-compose up -d"
    exit 1
fi

# Count running containers
running=$(docker-compose ps | grep "Up" | wc -l)
echo -e "${GREEN}✅ $running containers are running${NC}"
echo ""

# Check individual services
echo "🌐 Checking service endpoints..."
check_endpoint "Application" "http://localhost:3000" || true
check_endpoint "Grafana" "http://localhost:3001" "302|200" || true
check_endpoint "Prometheus" "http://localhost:9090" || true
check_endpoint "Loki (ready)" "http://localhost:3100/ready" || true
check_endpoint "Tempo (ready)" "http://localhost:3200/ready" || true
check_endpoint "OTel Collector (health)" "http://localhost:13133" || true

echo ""
echo "📊 Checking data collection..."

# Check if OTel Collector is receiving data
otel_received=$(curl -s http://localhost:8888/metrics | grep -c "receiver_accepted" || echo "0")
if [ "$otel_received" -gt 0 ]; then
    echo -e "${GREEN}✅ OTel Collector is receiving telemetry data${NC}"
else
    echo -e "${YELLOW}⚠️  OTel Collector has not received data yet${NC}"
    echo "   Generate traffic: curl http://localhost:3000/api/users"
fi

# Check if Prometheus has metrics
prom_metrics=$(curl -s "http://localhost:9090/api/v1/query?query=up" | grep -c "success" || echo "0")
if [ "$prom_metrics" -gt 0 ]; then
    echo -e "${GREEN}✅ Prometheus is collecting metrics${NC}"
else
    echo -e "${RED}❌ Prometheus is not collecting metrics${NC}"
fi

# Check if Tempo has traces
tempo_services=$(curl -s "http://localhost:3200/api/search/tags/service.name" | grep -c "tagValues" || echo "0")
if [ "$tempo_services" -gt 0 ]; then
    echo -e "${GREEN}✅ Tempo has received traces${NC}"
else
    echo -e "${YELLOW}⚠️  Tempo has not received traces yet${NC}"
    echo "   Generate traces: curl http://localhost:3000/api/users"
fi

echo ""
echo "🎨 Checking Grafana configuration..."

# Check Grafana datasources (requires authentication)
grafana_ds=$(curl -s -u admin:admin "http://localhost:3001/api/datasources" | grep -c "Prometheus\|Loki\|Tempo" || echo "0")
if [ "$grafana_ds" -ge 3 ]; then
    echo -e "${GREEN}✅ Grafana datasources are configured (Prometheus, Loki, Tempo)${NC}"
else
    echo -e "${YELLOW}⚠️  Grafana datasources might not be fully configured${NC}"
fi

# Check Grafana dashboards
grafana_dashboards=$(curl -s -u admin:admin "http://localhost:3001/api/search?type=dash-db" | grep -c "nodejs-overview\|error-tracking\|session-analytics" || echo "0")
if [ "$grafana_dashboards" -ge 3 ]; then
    echo -e "${GREEN}✅ Grafana dashboards are provisioned (3 dashboards)${NC}"
else
    echo -e "${YELLOW}⚠️  Grafana dashboards might not be fully provisioned yet${NC}"
    echo "   Dashboards might still be loading. Wait a few seconds and try again."
fi

# Check Grafana alert rules
grafana_alerts=$(curl -s -u admin:admin "http://localhost:3001/api/v1/provisioning/alert-rules" 2>/dev/null | grep -c "High Error Rate\|Session Duration" || echo "0")
if [ "$grafana_alerts" -ge 2 ]; then
    echo -e "${GREEN}✅ Grafana alert rules are configured${NC}"
else
    echo -e "${YELLOW}⚠️  Grafana alert rules might not be fully configured yet${NC}"
fi

echo ""
echo "🧪 Testing instrumentation..."

# Make a test request to generate telemetry
echo "Sending test request to generate telemetry..."
response=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/api/users)

if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Test request successful (HTTP $response)${NC}"
    echo "   Waiting for telemetry to be processed..."
    sleep 5

    # Check if we can find the trace in Tempo
    trace_count=$(curl -s "http://localhost:3200/api/search?tags=service.name%3Dadulting-app" | grep -c "traceID" || echo "0")
    if [ "$trace_count" -gt 0 ]; then
        echo -e "${GREEN}✅ Traces are being collected in Tempo${NC}"
    else
        echo -e "${YELLOW}⚠️  Traces not found yet. This might take a few moments.${NC}"
    fi
else
    echo -e "${RED}❌ Test request failed (HTTP $response)${NC}"
fi

echo ""
echo "📋 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Access your observability stack:"
echo "  • Application:       http://localhost:3000"
echo "  • Grafana:          http://localhost:3001 (admin/admin)"
echo "  • Prometheus:       http://localhost:9090"
echo "  • Loki:            http://localhost:3100"
echo "  • Tempo:           http://localhost:3200"
echo ""
echo "Next steps:"
echo "  1. Open Grafana: http://localhost:3001"
echo "  2. Browse Dashboards → Adulting App"
echo "  3. View traces in Explore → Tempo"
echo "  4. Query metrics in Explore → Prometheus"
echo "  5. Search logs in Explore → Loki"
echo ""
echo "Generate more data:"
echo "  curl http://localhost:3000/api/users"
echo "  for i in {1..100}; do curl http://localhost:3000; done"
echo ""
echo "📖 Full documentation: observability/README.md"
