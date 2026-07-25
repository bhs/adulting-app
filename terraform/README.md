# Render infrastructure (Terraform)

This module manages the production deployment of **adulting-app** on
[Render](https://render.com) using the official
[`render-oss/render`](https://registry.terraform.io/providers/render-oss/render/latest)
provider. It declares:

- a Render **web service** built from the repo `Dockerfile`,
- a managed **PostgreSQL** instance (connected over Render's private network),
- the service's **environment variables**, including the soft-launch email
  allow-list (`SOFT_LAUNCH_ALLOWLIST`), and
- the outputs `deploy.sh` uses to smoke-test the deploy.

It intentionally replaces the click-ops / `render.yaml` Blueprint flow with a
reproducible, code-reviewed `terraform apply`. State lives in a remote backend
so any team member can deploy from a fresh machine.

## Layout

| File | Purpose |
| --- | --- |
| `versions.tf` | Provider + `required_version`, and the (commented) backend block |
| `variables.tf` | All inputs, with defaults and validation |
| `main.tf` | The `render_web_service` and `render_postgres` resources |
| `outputs.tf` | `service_url`, `launch_mode`, etc. |
| `terraform.tfvars.example` | Copy to `terraform.tfvars` and fill in |

## Prerequisites

- Terraform >= 1.5
- A Render account, a [Render API key](https://dashboard.render.com/u/settings#api-keys),
  and your Render owner ID (`tea-…` for a team, `usr-…` for a personal account).

## Configure

```bash
cp terraform.tfvars.example terraform.tfvars   # then edit
# Secrets are best supplied via the environment instead of the tfvars file:
export TF_VAR_render_api_key="rnd_..."
export TF_VAR_render_owner_id="tea-..."
```

### Remote state (recommended)

Uncomment one backend in `versions.tf` — Terraform Cloud's free tier or a GCS
bucket — then run `terraform init -migrate-state`. Until then a first apply uses
local state.

## The soft-launch cohort

`soft_launch_allowlist` is a list of emails Terraform joins into the
`SOFT_LAUNCH_ALLOWLIST` env var, which the app reads in
[`lib/soft-launch/allowlist.ts`](../lib/soft-launch/allowlist.ts) and enforces at
[`/api/access`](../app/api/access/route.ts).

| Allow-list value | Launch mode | Who is admitted |
| --- | --- | --- |
| `[]` (empty) | `closed` | nobody (fail-closed default) |
| `["alice@x.com", "*@partner.com"]` | `restricted` | those addresses / that domain |
| `["*"]` | `open` | everyone (general availability) |

Widening or narrowing the launch is just an edit to this list followed by
`terraform apply` — no code change or redeploy of a new image is needed.

## Deploy

From the repo root, `deploy.sh` wraps the full flow (`init` → `apply` →
health-check smoke test):

```bash
./deploy.sh                 # interactive approval, then smoke test
AUTO_APPROVE=1 ./deploy.sh  # non-interactive (CI)
PLAN_ONLY=1 ./deploy.sh     # plan only
```

Or run Terraform directly:

```bash
terraform init
terraform plan
terraform apply
terraform output service_url
```
