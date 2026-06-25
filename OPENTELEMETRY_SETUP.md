# OpenTelemetry Setup Guide

This guide explains how to configure and use OpenTelemetry for error tracking and analytics in the Adulting App.

## Overview

The application is instrumented with OpenTelemetry to provide:
- **Distributed Tracing**: Track requests across services and database calls
- **Metrics Collection**: Monitor performance and business metrics
- **Error Tracking**: Capture and analyze errors with full context
- **Performance Monitoring**: Track Core Web Vitals and API latency

## Architecture

### Backend Instrumentation
- **Node.js SDK**: Auto-instrumentation for HTTP, Express, and other Node.js modules
- **Prisma Middleware**: Custom tracing for database queries
- **Manual Instrumentation**: Custom spans for business logic
- **OTLP HTTP Exporter**: Sends telemetry to managed backend

### Frontend Instrumentation
- **Web Tracer**: Browser-side tracing for user interactions
- **Performance Monitoring**: Track component rendering and page loads
- **Session Tracking**: Monitor user sessions and interactions

## Supported Managed Backends

This implementation supports any OTLP-compatible backend. Here are three popular free-tier options:

### Option 1: Grafana Cloud (Recommended)

**Why Grafana Cloud?**
- Free tier: 50GB traces, 10k series metrics, 50GB logs
- Native OTLP support for all signal types
- Built-in dashboards and alerting
- No credit card required for free tier

**Setup Steps:**

1. Sign up at [grafana.com](https://grafana.com/)
2. Create a new stack (free tier)
3. Navigate to "Connections" → "Add new connection" → "OpenTelemetry"
4. Get your credentials:
   - Instance ID (e.g., `123456`)
   - API Token
   - OTLP Endpoint (e.g., `https://otlp-gateway-prod-us-central-0.grafana.net/otlp`)

5. Set environment variables:
```bash
# Encode credentials: echo -n "INSTANCE_ID:API_TOKEN" | base64
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-central-0.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic <base64-encoded-instance-id:api-key>"
OTEL_SERVICE_NAME=adulting-app
```

### Option 2: Honeycomb

**Features:**
- Free tier: 20M events/month
- Excellent query interface
- Strong focus on observability

**Setup Steps:**

1. Sign up at [honeycomb.io](https://www.honeycomb.io/)
2. Create a new environment
3. Get API key from Settings
4. Set environment variables:
```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io
OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=<your-api-key>"
OTEL_SERVICE_NAME=adulting-app
```

### Option 3: Axiom

**Features:**
- Free tier: 500GB/month
- Fast queries
- Simple setup

**Setup Steps:**

1. Sign up at [axiom.co](https://axiom.co/)
2. Create a dataset
3. Generate API token
4. Set environment variables:
```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.axiom.co
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <your-api-token>,X-Axiom-Dataset=<dataset-name>"
OTEL_SERVICE_NAME=adulting-app
```

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required OpenTelemetry packages:
- `@opentelemetry/sdk-node`
- `@opentelemetry/auto-instrumentations-node`
- `@opentelemetry/exporter-trace-otlp-http`
- `@opentelemetry/exporter-metrics-otlp-http`
- And more...

### 2. Configure Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Update with your chosen backend credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/adulting_app"

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT="https://your-backend-endpoint"
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <your-token>"
OTEL_SERVICE_NAME="adulting-app"
OTEL_SERVICE_VERSION="1.0.0"
```

### 3. Run the Application

```bash
npm run dev
```

You should see:
```
[OpenTelemetry] SDK initialized successfully
[OpenTelemetry] Service: adulting-app
[OpenTelemetry] Environment: development
[OpenTelemetry] Exporting to: https://your-backend-endpoint
```

## Production Deployment

### Render.com

The `render.yaml` is already configured with OpenTelemetry environment variables. Add these secrets in your Render dashboard:

1. Go to your service → Environment
2. Add secret environment variables:
   - `OTEL_EXPORTER_OTLP_ENDPOINT`
   - `OTEL_EXPORTER_OTLP_HEADERS`
3. Redeploy

### Vercel

Add environment variables in your Vercel dashboard:

1. Go to Settings → Environment Variables
2. Add:
   - `OTEL_EXPORTER_OTLP_ENDPOINT`
   - `OTEL_EXPORTER_OTLP_HEADERS`
   - `OTEL_SERVICE_NAME`
   - `OTEL_SERVICE_VERSION`
3. Redeploy

### Docker

Update your `.env` or pass environment variables:

```bash
docker run -e OTEL_EXPORTER_OTLP_ENDPOINT="..." \
           -e OTEL_EXPORTER_OTLP_HEADERS="..." \
           -e OTEL_SERVICE_NAME="adulting-app" \
           -p 3000:3000 \
           your-image
```

## Usage Examples

### Automatic Instrumentation

Most HTTP requests, database queries, and external API calls are automatically traced. No code changes needed!

### Manual Instrumentation

Add custom spans for business logic:

```typescript
import { withSpan, addSpanAttributes, recordError } from '@/lib/otel'

// Wrap async functions
export async function processOrder(orderId: string) {
  return withSpan('processOrder', async (span) => {
    // Add custom attributes
    addSpanAttributes({
      'order.id': orderId,
      'order.type': 'online',
    })

    try {
      const result = await performBusinessLogic()
      return result
    } catch (error) {
      // Record errors with context
      recordError(error, {
        'error.type': 'order_processing_failed',
        'order.id': orderId,
      })
      throw error
    }
  })
}
```

### API Route Instrumentation

API routes are automatically instrumented, but you can add custom attributes:

```typescript
import { addSpanAttributes } from '@/lib/otel'

export async function GET(request: Request) {
  addSpanAttributes({
    'user.id': userId,
    'api.version': 'v1',
  })

  // Your logic here
}
```

### Database Query Tracing

Prisma queries are automatically traced with the following attributes:
- `db.system`: `postgresql`
- `db.operation`: `findMany`, `create`, `update`, etc.
- `db.model`: `User`, `Post`, etc.

### Frontend Tracing (Optional)

Enable browser-side tracing by setting:

```env
NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT=https://your-backend-endpoint
NEXT_PUBLIC_OTEL_SERVICE_NAME=adulting-app-browser
```

Track component performance:

```typescript
import { useComponentTracing } from '@/lib/otel-browser'

export function MyComponent() {
  useComponentTracing('MyComponent')
  // Component logic
}
```

## Dashboards and Alerts

### Grafana Cloud Dashboards

1. Navigate to "Dashboards"
2. Import recommended dashboards:
   - **OpenTelemetry APM**: Request rates, latencies, errors
   - **Database Performance**: Query performance and errors
   - **Next.js Monitoring**: Page loads, API routes

### Key Metrics to Track

**Error Tracking KRs:**
- Error rate by endpoint
- Error rate by type
- Top errors by frequency
- Error traces with full context

**Performance KRs:**
- API response time (p50, p95, p99)
- Database query duration
- Session duration (frontend)
- Core Web Vitals (LCP, FID, CLS)

### Example Alerts

Set up alerts in your observability platform:

1. **High Error Rate**
   - Condition: Error rate > 5% over 5 minutes
   - Action: Send notification

2. **Slow API Response**
   - Condition: p95 latency > 1s over 5 minutes
   - Action: Send notification

3. **Database Query Performance**
   - Condition: Query duration > 500ms
   - Action: Log warning

## Troubleshooting

### Telemetry Not Appearing

1. Check logs for OpenTelemetry initialization:
   ```
   [OpenTelemetry] SDK initialized successfully
   ```

2. Verify environment variables are set:
   ```bash
   echo $OTEL_EXPORTER_OTLP_ENDPOINT
   ```

3. Check network connectivity to OTLP endpoint

4. Verify authentication headers are correct

### High Data Volume

If you're exceeding free tier limits:

1. Reduce sampling rate (add to `instrumentation.ts`):
   ```typescript
   sampler: new TraceIdRatioBasedSampler(0.1) // Sample 10%
   ```

2. Disable verbose logging:
   ```typescript
   log: ['error'] // Only log errors
   ```

3. Filter noisy endpoints (add to instrumentation)

### Performance Impact

OpenTelemetry has minimal overhead (<5% typically), but if you notice issues:

1. Use batch span processor (already configured)
2. Increase export interval (default: 60s)
3. Disable file system instrumentation (already disabled)
4. Profile your application

## Security Considerations

1. **API Keys**: Never commit API keys or tokens
   - Use environment variables
   - Use secret management in CI/CD

2. **PII Data**: Avoid logging sensitive data
   - Don't log passwords, tokens, credit cards
   - Sanitize user data before adding to spans

3. **Network**: Use HTTPS for OTLP endpoints
   - All recommended backends use HTTPS
   - Verify TLS certificates

## Next Steps

1. Set up your chosen observability backend
2. Deploy the application with environment variables
3. Generate some traffic
4. View traces and metrics in your dashboard
5. Set up alerts for error rates and performance
6. Create custom dashboards for business KPIs

## Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
- [Grafana Cloud OTLP](https://grafana.com/docs/grafana-cloud/monitor-applications/application-observability/setup/collector/opentelemetry-collector/)
- [Honeycomb OTLP](https://docs.honeycomb.io/getting-data-in/opentelemetry/collector/)
- [Axiom OTLP](https://axiom.co/docs/send-data/opentelemetry)

## Support

For issues with this implementation, please open an issue in the repository.
For backend-specific support, contact your observability provider.
