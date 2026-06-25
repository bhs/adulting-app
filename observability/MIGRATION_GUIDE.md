# Migration Guide: Adding Observability to Existing Deployments

This guide helps you add OpenTelemetry + Grafana observability to existing deployments of this application.

## Table of Contents
- [Local Development](#local-development)
- [Docker Deployments](#docker-deployments)
- [Render.com Deployments](#rendercom-deployments)
- [Vercel Deployments](#vercel-deployments)
- [Custom Deployments](#custom-deployments)

## Local Development

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Environment Variables
```bash
# Copy the local environment template
cp .env.local.example .env.local

# Edit .env.local with your settings
# The defaults work for Docker Compose setup
```

### Step 3: Start Observability Stack
```bash
# Start everything
docker-compose up -d

# Or use the helper script
./observability/start-observability.sh
```

### Step 4: Verify
```bash
# Run verification script
./observability/verify-setup.sh

# Access Grafana
open http://localhost:3001
```

## Docker Deployments

### Existing Docker Setup

If you already have a Docker deployment, integrate the observability stack:

#### Option 1: Merge with Existing docker-compose.yml
1. Copy services from `docker-compose.yml` to your existing compose file
2. Add the observability network to your app service
3. Set environment variables on your app service:
   ```yaml
   environment:
     - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
     - OTEL_SERVICE_NAME=your-app-name
   ```

#### Option 2: Separate Stack with Network
1. Create `docker-compose.observability.yml` with just the observability services
2. Create a shared network:
   ```bash
   docker network create app-network
   ```
3. Update both compose files to use the shared network:
   ```yaml
   networks:
     default:
       external:
         name: app-network
   ```

### Step-by-Step Integration

1. **Add OTel Collector endpoint to your app**:
   ```yaml
   services:
     your-app:
       environment:
         - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
         - OTEL_SERVICE_NAME=your-app-name
       networks:
         - observability
   ```

2. **Copy observability directory**:
   ```bash
   # Ensure you have the observability configs
   ls -la observability/
   ```

3. **Start both stacks**:
   ```bash
   docker-compose -f docker-compose.yml up -d
   docker-compose -f docker-compose.observability.yml up -d
   ```

## Render.com Deployments

Render.com deployments require a different approach since you can't run the full Grafana stack on the free tier.

### Option 1: External Observability Service (Recommended)

Use a hosted observability service:

1. **Grafana Cloud** (Free tier available):
   - Sign up at https://grafana.com/products/cloud/
   - Get OTLP endpoint and API key
   - Update environment variables in Render:
     ```
     OTEL_EXPORTER_OTLP_ENDPOINT=https://your-endpoint.grafana.net
     OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64-token>
     OTEL_SERVICE_NAME=adulting-app
     ```

2. **Honeycomb.io** (Free tier available):
   - Sign up at https://honeycomb.io
   - Get API key
   - Update environment variables

3. **New Relic** (Free tier available):
   - Sign up at https://newrelic.com
   - Get license key
   - Update environment variables

### Option 2: Self-Hosted on Separate Instance

Run the observability stack on a separate Render service or external server:

1. **Create a new Render service** for observability:
   ```yaml
   # render-observability.yaml
   services:
     - type: web
       name: observability-stack
       env: docker
       dockerfilePath: ./observability/Dockerfile
       plan: standard  # Requires paid plan
       envVars:
         - key: GF_SECURITY_ADMIN_PASSWORD
           generateValue: true
   ```

2. **Update app environment variables**:
   ```
   OTEL_EXPORTER_OTLP_ENDPOINT=https://observability-stack.onrender.com:4318
   ```

### Option 3: Development-Only Observability

Keep observability for local development only:

1. Don't deploy the observability stack to Render
2. Use environment variable conditionals:
   ```typescript
   // instrumentation.ts
   if (process.env.NODE_ENV === 'production' && !process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
     console.log('Skipping OpenTelemetry initialization (no endpoint configured)');
     return;
   }
   ```

## Vercel Deployments

Vercel has built-in observability features, but you can also use OpenTelemetry:

### Option 1: Use Vercel Analytics (Easiest)

1. Enable Vercel Analytics in your dashboard
2. Add Vercel Speed Insights:
   ```bash
   npm install @vercel/speed-insights
   ```

### Option 2: OpenTelemetry with External Service

1. **Use Vercel Edge Config** for sensitive data:
   ```bash
   vercel env add OTEL_EXPORTER_OTLP_ENDPOINT
   vercel env add OTEL_EXPORTER_OTLP_HEADERS
   ```

2. **Add environment variables in Vercel dashboard**:
   - `OTEL_EXPORTER_OTLP_ENDPOINT`: Your OTLP endpoint
   - `OTEL_SERVICE_NAME`: Your app name
   - `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`: Public endpoint for browser traces

3. **Deploy**:
   ```bash
   vercel deploy
   ```

### Browser Instrumentation on Vercel

For browser-side telemetry, you need a public OTLP endpoint:

1. **Option A**: Use Grafana Cloud OTLP endpoint (with CORS)
2. **Option B**: Create a Vercel API route as proxy:
   ```typescript
   // app/api/telemetry/route.ts
   export async function POST(request: Request) {
     const data = await request.json();
     // Forward to your OTLP collector
     const response = await fetch(process.env.OTEL_EXPORTER_OTLP_ENDPOINT, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data),
     });
     return new Response(response.body);
   }
   ```

## Custom Deployments

### AWS/Azure/GCP

For cloud provider deployments:

1. **Deploy Grafana Stack** on managed services:
   - **Prometheus**: Use AWS Managed Prometheus, Azure Monitor, or GCP Cloud Monitoring
   - **Loki**: Deploy on ECS/EKS, AKS, or GKE
   - **Tempo**: Deploy on ECS/EKS, AKS, or GKE
   - **Grafana**: Use Grafana Cloud or deploy on VM

2. **Configure OTel Collector** as a sidecar or DaemonSet:
   - In Kubernetes, deploy as DaemonSet
   - In VMs, run as systemd service
   - In containers, run as sidecar

3. **Set environment variables** on your app:
   ```
   OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector.internal:4318
   OTEL_SERVICE_NAME=your-app-name
   ```

### Kubernetes

1. **Deploy Grafana Stack** using Helm:
   ```bash
   # Add Grafana Helm repo
   helm repo add grafana https://grafana.github.io/helm-charts

   # Install Loki
   helm install loki grafana/loki-stack

   # Install Tempo
   helm install tempo grafana/tempo

   # Install Prometheus
   helm install prometheus prometheus-community/kube-prometheus-stack
   ```

2. **Deploy OTel Collector** as DaemonSet:
   ```bash
   kubectl apply -f https://github.com/open-telemetry/opentelemetry-collector/releases/latest/download/otel-collector-k8s.yaml
   ```

3. **Configure your app deployment**:
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: adulting-app
   spec:
     template:
       spec:
         containers:
           - name: app
             env:
               - name: OTEL_EXPORTER_OTLP_ENDPOINT
                 value: "http://otel-collector:4318"
               - name: OTEL_SERVICE_NAME
                 value: "adulting-app"
   ```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP endpoint for server-side telemetry | `http://otel-collector:4318` |
| `OTEL_SERVICE_NAME` | Service identifier | `adulting-app` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OTEL_EXPORTER_OTLP_HEADERS` | Headers for authentication | - |
| `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT` | Browser OTLP endpoint | Same as server |
| `NODE_ENV` | Environment name | `development` |

## Testing After Migration

### 1. Verify Instrumentation
```bash
# Check server logs for initialization
docker logs <container-id> | grep -i "opentelemetry"

# Or in Render/Vercel logs
# Look for: "OpenTelemetry SDK initialized"
```

### 2. Generate Test Traffic
```bash
# Make requests
curl https://your-app.com/api/users

# Load test
for i in {1..100}; do
  curl -s https://your-app.com/ > /dev/null
done
```

### 3. Verify Data Collection
- Open Grafana
- Navigate to Explore → Tempo
- Search for traces with your service name
- Check dashboards show data

## Rollback Plan

If you need to rollback:

### Option 1: Disable Instrumentation
```bash
# Set environment variable
OTEL_SDK_DISABLED=true
```

### Option 2: Remove OTel Dependencies
```bash
# Revert package.json
git checkout HEAD -- package.json package-lock.json

# Remove instrumentation files
rm instrumentation.ts lib/otel-browser.tsx

# Rebuild
npm install
npm run build
```

### Option 3: Conditional Initialization
```typescript
// instrumentation.ts
export async function register() {
  if (process.env.ENABLE_OTEL !== 'true') {
    return;
  }
  // ... rest of initialization
}
```

## Performance Impact

OpenTelemetry instrumentation has minimal performance impact:

- **CPU overhead**: <5% in most cases
- **Memory overhead**: ~50-100MB
- **Network overhead**: Batched exports (default 10s)
- **Latency**: <1ms per request

To minimize impact:
- Use sampling for high-traffic apps
- Adjust batch sizes and intervals
- Disable unused instrumentations

## Troubleshooting

### Issue: High Memory Usage
**Solution**: Reduce batch sizes in instrumentation.ts:
```typescript
metricReader: new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter(),
  exportIntervalMillis: 30000, // Increase from 10s to 30s
})
```

### Issue: Missing Traces
**Solution**: Check network connectivity to OTLP endpoint:
```bash
curl -v http://otel-collector:4318/v1/traces
```

### Issue: CORS Errors (Browser)
**Solution**: Add your domain to OTel Collector CORS config:
```yaml
receivers:
  otlp:
    protocols:
      http:
        cors:
          allowed_origins:
            - "https://your-domain.com"
```

## Support

For issues specific to this observability setup:
1. Check the [README](./README.md) for detailed documentation
2. Review logs: `docker-compose logs otel-collector`
3. Validate config: `docker-compose config`
4. Run verification: `./verify-setup.sh`

For general OpenTelemetry questions:
- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [CNCF Slack #opentelemetry](https://cloud-native.slack.com)
