# OpenTelemetry + Grafana Quick Start Guide

## 🚀 Start the Stack

```bash
# Option 1: Use the helper script
./observability/start-observability.sh

# Option 2: Use Docker Compose directly
docker-compose up -d
```

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Application** | http://localhost:3000 | - |
| **Grafana** | http://localhost:3001 | admin/admin |
| **Prometheus** | http://localhost:9090 | - |
| **Loki** | http://localhost:3100 | - |
| **Tempo** | http://localhost:3200 | - |
| **OTel Collector** | http://localhost:4318 | - |

## 📊 View Dashboards

1. Open Grafana: http://localhost:3001
2. Login: admin/admin
3. Navigate: Dashboards → Browse → Adulting App folder
4. Choose a dashboard:
   - **Node.js Application Overview** - Request rates, latency, errors
   - **Error Tracking Dashboard** - Error analysis and logs
   - **Session Analytics Dashboard** - User session metrics

## 🔍 Explore Data

### Traces (Tempo)
1. Grafana → Explore → Select "Tempo"
2. Click "Search" tab
3. Search by: `service.name = "adulting-app"`
4. Click a trace to see detailed span information

### Metrics (Prometheus)
1. Grafana → Explore → Select "Prometheus"
2. Try these queries:
   ```promql
   # Request rate
   rate(http_server_request_duration_seconds_count[5m])

   # Error rate
   rate(http_server_request_duration_seconds_count{http_status_code=~"5.."}[5m])

   # P95 latency
   histogram_quantile(0.95, rate(http_server_request_duration_seconds_bucket[5m]))
   ```

### Logs (Loki)
1. Grafana → Explore → Select "Loki"
2. Try these queries:
   ```logql
   # All application logs
   {service_name="adulting-app"}

   # Error logs only
   {service_name="adulting-app"} |= "error" or |= "ERROR"

   # HTTP request logs
   {service_name="adulting-app"} |= "GET" or |= "POST"
   ```

## 🧪 Generate Test Data

```bash
# Make some API requests
curl http://localhost:3000/api/users

# Generate load (100 requests)
for i in {1..100}; do
  curl -s http://localhost:3000/api/users > /dev/null
  echo "Request $i completed"
done

# Create a user (POST request)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

## 🔔 View Alerts

1. Grafana → Alerting → Alert rules
2. You'll see 6 pre-configured rules:
   - High Error Rate
   - Sustained Error Rate
   - High Session Duration
   - Low Session Duration
   - Browser Error Spike
   - No Traffic Detected

## ✅ Verify Setup

Run the verification script:
```bash
./observability/verify-setup.sh
```

This will check:
- All containers are running
- Services are accessible
- Data is being collected
- Dashboards are provisioned
- Alerts are configured

## 🛑 Stop the Stack

```bash
# Stop containers (keep data)
docker-compose down

# Stop and remove all data
docker-compose down -v
```

## 🔧 Troubleshooting

### Containers not starting
```bash
# View logs
docker-compose logs -f

# Check specific service
docker-compose logs -f grafana
docker-compose logs -f otel-collector
```

### No data in Grafana
1. Wait 30-60 seconds after starting for provisioning
2. Generate traffic: `curl http://localhost:3000/api/users`
3. Check OTel Collector is receiving data:
   ```bash
   curl http://localhost:8888/metrics | grep receiver_accepted
   ```

### Grafana login not working
- Default credentials: admin/admin
- Reset by stopping and removing volumes:
  ```bash
  docker-compose down -v
  docker-compose up -d
  ```

### Browser traces not appearing
1. Verify CORS in OTel Collector config
2. Check browser console for errors
3. Ensure `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT` is set correctly

## 📖 Full Documentation

For complete documentation, see [README.md](./README.md)

## 🎯 Key Metrics to Watch

### Golden Signals
- **Latency**: P50, P90, P95, P99 response times
- **Traffic**: Requests per second
- **Errors**: Error rate percentage
- **Saturation**: Resource utilization (CPU, memory)

### Custom Metrics
- **Session Duration**: How long users stay on the app
- **Page Views**: Which pages are most visited
- **Browser Errors**: Client-side JavaScript errors

## 💡 Tips

1. **First time setup**: Wait 30 seconds for all services to initialize
2. **Data retention**: Default is 30 days for logs, 1 hour for traces
3. **Performance**: OTel Collector batches data for efficiency
4. **Production**: Use external storage for Prometheus, Loki, and Tempo
5. **Security**: Change Grafana password and enable authentication on collectors

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Port conflicts | Check if ports 3000, 3001, 4318, 9090 are in use |
| Out of memory | Increase Docker memory limit |
| Slow dashboards | Reduce time range or increase refresh interval |
| Missing traces | Check app logs for OTel initialization |

## 📚 Resources

- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [Grafana Docs](https://grafana.com/docs/)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [LogQL (Loki)](https://grafana.com/docs/loki/latest/logql/)
- [TraceQL (Tempo)](https://grafana.com/docs/tempo/latest/traceql/)
