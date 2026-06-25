# OpenTelemetry + Grafana Observability Stack

This directory contains the configuration for a self-hosted observability stack using OpenTelemetry, Grafana, Prometheus, Loki, and Tempo.

## Architecture

```
┌─────────────────┐
│   Next.js App   │
│  (Node + React) │
└────────┬────────┘
         │ OTLP (HTTP)
         │ Traces, Metrics, Logs
         ▼
┌─────────────────────────┐
│  OpenTelemetry Collector│
│   (Port 4318/4317)      │
└───┬─────────┬─────────┬─┘
    │         │         │
    │Traces   │Metrics  │Logs
    ▼         ▼         ▼
┌──────┐ ┌─────────┐ ┌──────┐
│Tempo │ │Prometheus│ │Loki  │
└───┬──┘ └────┬────┘ └──┬───┘
    │         │          │
    └─────────┼──────────┘
              ▼
        ┌──────────┐
        │ Grafana  │
        │(Port 3001)│
        └──────────┘
```

## Components

### OpenTelemetry Instrumentation

#### Server-side (Node.js)
- **Location**: `/instrumentation.ts`
- **Features**:
  - Auto-instrumentation for HTTP, Express, DNS, Net
  - Traces exported to Tempo via OTLP
  - Metrics exported to Prometheus via OTLP
  - Logs exported to Loki via OTLP
  - Service metadata (name, version, environment)

#### Client-side (Browser)
- **Location**: `/lib/otel-browser.tsx`
- **Features**:
  - Browser trace collection (page loads, user interactions)
  - Session duration metrics (histogram)
  - Page view counter
  - Uncaught error tracking
  - Unhandled promise rejection tracking

### OpenTelemetry Collector
- **Config**: `observability/otel-collector-config.yaml`
- **Receivers**: OTLP (gRPC on 4317, HTTP on 4318)
- **Processors**: Batch, Memory Limiter, Resource, Attributes
- **Exporters**:
  - **Traces**: Tempo (OTLP)
  - **Metrics**: Prometheus (Remote Write + Prometheus Exporter)
  - **Logs**: Loki

### Prometheus
- **Config**: `observability/prometheus.yml`
- **Port**: 9090
- **Scrape Targets**:
  - OTel Collector metrics endpoint
  - Self-monitoring
- **Features**:
  - Remote write receiver for OTel Collector
  - 15s scrape interval

### Loki
- **Config**: `observability/loki-config.yaml`
- **Port**: 3100
- **Features**:
  - Log aggregation and storage
  - 30-day retention
  - BoltDB-shipper for index management

### Tempo
- **Config**: `observability/tempo-config.yaml`
- **Port**: 3200
- **Features**:
  - Distributed trace storage
  - Span metrics generation
  - Service graph generation
  - Integration with Prometheus for RED metrics

### Grafana
- **Port**: 3001 (to avoid conflict with Next.js on 3000)
- **Credentials**: admin/admin
- **Auto-provisioned**:
  - 3 Datasources (Prometheus, Loki, Tempo)
  - 3 Dashboards (Node.js Overview, Error Tracking, Session Analytics)
  - 6 Alert Rules (Error rate, Session duration, Browser errors, No traffic)

## Dashboards

### 1. Node.js Application Overview (`nodejs-overview.json`)
- HTTP request rate by method/route
- P95 response time gauge
- HTTP error rate (5xx)
- HTTP status code distribution
- Response time percentiles (p50, p90, p95, p99)

### 2. Error Tracking Dashboard (`error-tracking.json`)
- Current error rate gauge
- Total errors in last hour
- Browser errors in last hour
- Error spans rate from traces
- Error rate by status code
- Error rate by endpoint
- Error logs from Loki (filterable)

### 3. Session Analytics Dashboard (`session-analytics.json`)
- Median session duration
- P95 session duration
- Total page views
- Session duration histogram (p25, p50, p75, p90, p95, p99)
- Page views by path
- Median session duration by page

## Alert Rules

All alerts are configured in `observability/grafana/provisioning/alerting/alert-rules.yaml`:

1. **High Error Rate** (Critical)
   - Trigger: Error rate > 5% for 5 minutes
   - Team: Platform

2. **Sustained Error Rate** (Warning)
   - Trigger: Error rate > 1% for 10 minutes
   - Team: Platform

3. **High Session Duration P95** (Warning)
   - Trigger: P95 > 5 minutes for 5 minutes
   - Team: Product
   - Rationale: Users might be confused or struggling with UX

4. **Low Session Duration P50** (Warning)
   - Trigger: Median < 10 seconds for 10 minutes
   - Team: Product
   - Rationale: Users leaving too quickly

5. **Browser Error Spike** (Warning)
   - Trigger: Browser error rate > 0.1 errors/sec for 5 minutes
   - Team: Frontend

6. **No Traffic Detected** (Critical)
   - Trigger: Request rate < 0.01 req/sec for 5 minutes
   - Team: Platform
   - Rationale: Service might be down

## Quick Start

### Local Development with Docker Compose

1. **Start the entire stack**:
   ```bash
   docker-compose up -d
   ```

2. **Access the services**:
   - **Application**: http://localhost:3000
   - **Grafana**: http://localhost:3001 (admin/admin)
   - **Prometheus**: http://localhost:9090
   - **Loki**: http://localhost:3100
   - **Tempo**: http://localhost:3200
   - **OTel Collector**: http://localhost:4318 (HTTP), http://localhost:4317 (gRPC)

3. **View logs**:
   ```bash
   docker-compose logs -f app
   docker-compose logs -f otel-collector
   docker-compose logs -f grafana
   ```

4. **Stop the stack**:
   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes** (clean slate):
   ```bash
   docker-compose down -v
   ```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required for server-side instrumentation
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
OTEL_SERVICE_NAME=adulting-app

# Required for browser-side instrumentation
NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

**Note**: For browser instrumentation to work, the OTel Collector must be accessible from the client browser. In production, you'll need to expose the collector endpoint publicly or use a different approach (e.g., sending to a backend endpoint that forwards to the collector).

## Verification Steps

### 1. Verify Instrumentation is Working

**Server-side traces**:
1. Make a request to your app: `curl http://localhost:3000/api/users`
2. Open Grafana → Explore → Tempo
3. Search for traces with `service.name = "adulting-app"`
4. You should see HTTP spans

**Browser traces**:
1. Open the app in a browser: http://localhost:3000
2. Open Grafana → Explore → Tempo
3. Search for traces with `service.name = "adulting-app-browser"`
4. You should see browser traces

**Metrics**:
1. Open Grafana → Explore → Prometheus
2. Query: `http_server_request_duration_seconds_count`
3. You should see metrics from your API requests

**Logs**:
1. Open Grafana → Explore → Loki
2. Query: `{service_name="adulting-app"}`
3. You should see application logs

### 2. Verify Dashboards

1. Open Grafana → Dashboards → Browse
2. Navigate to "Adulting App" folder
3. Open each dashboard and verify panels are showing data

### 3. Verify Alerts

1. Open Grafana → Alerting → Alert rules
2. You should see 6 alert rules
3. Generate some errors to trigger the alerts:
   ```bash
   # Trigger a 500 error (if your app has error handling)
   for i in {1..100}; do curl http://localhost:3000/api/nonexistent; done
   ```

## KR Validation

### Error Rate Monitoring
✅ **KR**: Track and alert on error rate exceeding threshold

**Validation**:
1. Open "Error Tracking Dashboard" in Grafana
2. Generate errors by hitting non-existent endpoints
3. Verify the "Current Error Rate" gauge increases
4. Check Alerting → Alert rules → "High Error Rate" triggers

### Session Duration Metrics
✅ **KR**: Measure user session duration with histogram

**Validation**:
1. Open "Session Analytics Dashboard" in Grafana
2. Open the app in a browser and interact for a few minutes
3. Refresh the page (triggers session end)
4. Verify the "Session Duration Histogram" shows data
5. Check that P50, P95 gauges are populated

## Production Deployment

### Security Considerations

1. **Change Grafana credentials**:
   - Update `GF_SECURITY_ADMIN_PASSWORD` in `docker-compose.yml`
   - Or set via environment variable

2. **Secure OTel Collector**:
   - Enable TLS for OTLP endpoints
   - Use authentication (API keys, mTLS)
   - Restrict CORS origins

3. **Network isolation**:
   - Put observability stack in a private network
   - Only expose Grafana publicly (behind auth)
   - Use reverse proxy with TLS

4. **Data retention**:
   - Configure appropriate retention periods
   - Monitor storage usage
   - Set up backup policies

### Scaling

For production workloads, consider:

1. **Horizontal scaling**:
   - Run multiple OTel Collector instances
   - Use load balancer for OTLP endpoints

2. **External storage**:
   - Use managed Prometheus (Thanos, Cortex, Mimir)
   - Use cloud storage for Loki (S3, GCS)
   - Use cloud storage for Tempo (S3, GCS)

3. **Resource limits**:
   - Set appropriate memory limits for collectors
   - Configure batch sizes and flush intervals
   - Monitor collector performance

## Troubleshooting

### No traces appearing

1. Check OTel Collector logs:
   ```bash
   docker-compose logs otel-collector | grep -i error
   ```

2. Verify app is sending data:
   ```bash
   # Check collector received data
   curl http://localhost:8888/metrics | grep receiver
   ```

3. Check Next.js instrumentation loaded:
   - Look for "OpenTelemetry SDK initialized" in app logs

### No metrics in Prometheus

1. Check Prometheus targets:
   - Open http://localhost:9090/targets
   - Verify all targets are UP

2. Check remote write:
   ```bash
   docker-compose logs prometheus | grep -i "remote write"
   ```

### Dashboards show "No Data"

1. Verify time range is appropriate (last 1 hour)
2. Check datasource configuration in Grafana
3. Run test queries in Explore view
4. Verify metric/log names match dashboard queries

### Browser telemetry not working

1. Check browser console for errors
2. Verify CORS is configured in OTel Collector
3. Check `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT` is accessible from browser
4. Consider using backend proxy for OTLP requests

## Metrics Reference

### Server-side Metrics

- `http_server_request_duration_seconds_count`: Total HTTP requests
- `http_server_request_duration_seconds_sum`: Total request duration
- `http_server_request_duration_seconds_bucket`: Request duration histogram
- Labels: `http_method`, `http_route`, `http_status_code`, `service_name`

### Browser Metrics

- `browser_session_duration_milliseconds`: Session duration histogram
- `browser_page_views_total`: Page view counter
- `browser_error_total`: Browser error counter
- Labels: `page_path`, `error_type`

### Trace Attributes

- `service.name`: Service identifier
- `service.version`: Application version
- `deployment.environment`: Environment (dev/staging/prod)
- `http.method`, `http.target`, `http.status_code`: HTTP metadata
- `error.type`, `error.message`: Error metadata

## Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Tempo Documentation](https://grafana.com/docs/tempo/latest/)
- [OTel Collector Documentation](https://opentelemetry.io/docs/collector/)
