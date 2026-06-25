#!/bin/bash

# Start Observability Stack
# This script starts the complete OpenTelemetry + Grafana observability stack

set -e

echo "🚀 Starting OpenTelemetry + Grafana Observability Stack..."
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose is not installed"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env.local exists, if not copy from example
if [ ! -f ../.env.local ]; then
    echo "📝 Creating .env.local from .env.local.example..."
    cp ../.env.local.example ../.env.local
    echo "✅ .env.local created. Please update it with your configuration if needed."
    echo ""
fi

# Start the stack
echo "🐳 Starting Docker Compose stack..."
cd ..
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service health..."

services=("app:3000" "grafana:3000" "prometheus:9090" "loki:3100" "tempo:3200" "otel-collector:4318")
for service in "${services[@]}"; do
    name="${service%%:*}"
    port="${service##*:}"

    if docker-compose ps | grep -q "$name.*Up"; then
        echo "✅ $name is running"
    else
        echo "⚠️  $name might not be running properly"
    fi
done

echo ""
echo "🎉 Observability Stack is ready!"
echo ""
echo "📊 Access Points:"
echo "  - Application:       http://localhost:3000"
echo "  - Grafana:          http://localhost:3001 (admin/admin)"
echo "  - Prometheus:       http://localhost:9090"
echo "  - Loki:            http://localhost:3100"
echo "  - Tempo:           http://localhost:3200"
echo "  - OTel Collector:  http://localhost:4318 (HTTP)"
echo ""
echo "📚 Next Steps:"
echo "  1. Open Grafana at http://localhost:3001"
echo "  2. Navigate to Dashboards → Browse → Adulting App"
echo "  3. View the pre-configured dashboards"
echo "  4. Generate some traffic: curl http://localhost:3000/api/users"
echo ""
echo "📖 Full documentation: observability/README.md"
echo ""
echo "🛑 To stop the stack: docker-compose down"
echo "🧹 To stop and remove data: docker-compose down -v"
