# OpenTelemetry Quick Start Guide

Get up and running with OpenTelemetry in 5 minutes using Grafana Cloud free tier.

## Prerequisites

- A Grafana Cloud account (free tier, no credit card required)
- Node.js 20+ installed
- This application cloned and ready

## Step 1: Create Grafana Cloud Account

1. Go to [grafana.com](https://grafana.com/)
2. Click "Create free account"
3. Complete registration
4. Your stack will be automatically created

## Step 2: Get OTLP Credentials

1. In Grafana Cloud, click "Connections" in the left sidebar
2. Click "Add new connection"
3. Search for "OpenTelemetry" and select it
4. You'll see your OTLP configuration:
   ```
   Endpoint: https://otlp-gateway-prod-us-central-0.grafana.net/otlp
   Instance ID: 123456
   ```
5. Generate an API token:
   - Click "Generate now" under API token
   - Copy the token (you won't see it again!)

## Step 3: Encode Credentials

You need to base64-encode your credentials for authentication:

```bash
# Replace with your actual Instance ID and API Token
echo -n "123456:glc_your_api_token_here" | base64
```

Copy the output (e.g., `MTIzNDU2OmdsY195b3VyX2FwaV90b2tlbl9oZXJl`)

## Step 4: Configure Environment Variables

Create or update your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add:

```env
# Database (keep your existing config)
DATABASE_URL="postgresql://user:password@localhost:5432/adulting_app"

# OpenTelemetry - Grafana Cloud
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-central-0.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic MTIzNDU2OmdsY195b3VyX2FwaV90b2tlbl9oZXJl"
OTEL_SERVICE_NAME=adulting-app
OTEL_SERVICE_VERSION=1.0.0
```

Replace:
- The endpoint with your actual region endpoint
- The base64 string with your encoded credentials

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Start the Application

```bash
npm run dev
```

You should see:
```
[OpenTelemetry] SDK initialized successfully
[OpenTelemetry] Service: adulting-app
[OpenTelemetry] Environment: development
[OpenTelemetry] Exporting to: https://otlp-gateway-prod-us-central-0.grafana.net/otlp
```

## Step 7: Generate Some Traffic

Open your browser and make some requests:

1. Visit http://localhost:3000
2. Visit http://localhost:3000/api/users
3. Create a user:
   ```bash
   curl -X POST http://localhost:3000/api/users \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User"}'
   ```

## Step 8: View Traces in Grafana

1. Go back to Grafana Cloud
2. Click "Explore" in the left sidebar
3. Select your data source (should be "grafanacloud-*-traces")
4. You should see traces from your application!
5. Click on a trace to see the full span details

### What to Look For

- HTTP request spans
- Database query spans (from Prisma)
- Custom spans from your API routes
- Error spans (if any errors occurred)

## Step 9: View Metrics

1. In Grafana, click "Explore"
2. Select your metrics data source (should be "grafanacloud-*-prom")
3. Try these queries:
   ```promql
   # Request rate
   rate(http_server_request_duration_seconds_count[5m])

   # Request duration (p95)
   histogram_quantile(0.95, rate(http_server_request_duration_seconds_bucket[5m]))

   # Error rate
   rate(http_server_request_duration_seconds_count{http_status_code=~"5.."}[5m])
   ```

## Step 10: Create a Dashboard

1. Click "Dashboards" in the sidebar
2. Click "New" → "Import"
3. Search for "OpenTelemetry" in the public dashboard library
4. Import a pre-built dashboard like "OpenTelemetry APM"
5. Select your data sources

## Next Steps

### Set Up Alerts

1. Go to "Alerting" → "Alert rules"
2. Click "New alert rule"
3. Create alerts for:
   - High error rate (>5% errors)
   - Slow response time (p95 > 1s)
   - Database query performance

### Deploy to Production

For Render.com:
```bash
# Add environment variables in Render dashboard
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-central-0.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <your-base64-credentials>
```

For Vercel:
```bash
# Add in Vercel dashboard → Settings → Environment Variables
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-central-0.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <your-base64-credentials>
```

### Explore More

- Check out `OPENTELEMETRY_SETUP.md` for detailed documentation
- Add custom spans to your business logic
- Monitor database query performance
- Track user sessions with browser tracing

## Troubleshooting

### Not seeing traces?

1. Check the console for initialization message
2. Verify your base64 encoding is correct
3. Make sure you're making requests to your app
4. Wait 10-30 seconds for data to appear in Grafana

### Authentication errors?

1. Verify Instance ID and API token are correct
2. Check base64 encoding (no spaces or newlines)
3. Ensure the format is: `echo -n "ID:TOKEN" | base64`

### Still having issues?

1. Check the full setup guide: `OPENTELEMETRY_SETUP.md`
2. Enable debug logging in `instrumentation.ts`
3. Check Grafana Cloud documentation

## Summary

You now have:
- ✅ Full distributed tracing for your Next.js app
- ✅ Automatic instrumentation for HTTP and database calls
- ✅ Error tracking with full context
- ✅ Performance metrics (request rate, latency, errors)
- ✅ A managed observability backend (Grafana Cloud)

No local services to run, no databases to manage—just configure the environment variables and you're done!

## Free Tier Limits

Grafana Cloud free tier includes:
- 50GB traces/month
- 10,000 series metrics
- 50GB logs/month
- 14-day retention

For a small application, this should be more than enough!
