#!/usr/bin/env bash
#
# deploy.sh — converge the Render infrastructure with Terraform and confirm the
# web service is live.
#
# Steps:
#   1. terraform init  (wires up the configured backend / provider)
#   2. terraform apply (creates/updates the Render service + Postgres and, via
#      auto_deploy, triggers a fresh deploy of the tracked branch)
#   3. Smoke test: poll the service's health endpoint until it returns 200.
#
# Secrets are read from the environment (TF_VAR_render_api_key,
# TF_VAR_render_owner_id) or terraform.tfvars — never passed on the command line.
#
# Usage:
#   ./deploy.sh                 # plan + apply (interactive approval), then smoke test
#   AUTO_APPROVE=1 ./deploy.sh  # non-interactive apply (CI)
#   PLAN_ONLY=1 ./deploy.sh     # terraform plan only, no changes
#
# Environment overrides:
#   TERRAFORM_DIR   directory holding the module            (default: ./terraform)
#   HEALTH_PATH     health endpoint to probe                (default: /api/health)
#   SMOKE_RETRIES   number of smoke-test attempts           (default: 40)
#   SMOKE_INTERVAL  seconds between smoke-test attempts     (default: 15)
#   SERVICE_URL     skip the terraform output lookup and probe this URL directly

set -euo pipefail

TERRAFORM_DIR="${TERRAFORM_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/terraform}"
HEALTH_PATH="${HEALTH_PATH:-/api/health}"
SMOKE_RETRIES="${SMOKE_RETRIES:-40}"
SMOKE_INTERVAL="${SMOKE_INTERVAL:-15}"

log()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mwarning:\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31merror:\033[0m %s\n' "$*" >&2; exit 1; }

command -v terraform >/dev/null 2>&1 || die "terraform is not installed (see https://developer.hashicorp.com/terraform/install)"
command -v curl >/dev/null 2>&1 || die "curl is required for the smoke test"

cd "$TERRAFORM_DIR" || die "terraform directory not found: $TERRAFORM_DIR"

log "Initializing Terraform in $TERRAFORM_DIR"
terraform init -input=false

if [[ "${PLAN_ONLY:-0}" == "1" ]]; then
  log "Running terraform plan (PLAN_ONLY=1); no changes will be applied"
  terraform plan -input=false
  exit 0
fi

log "Applying Terraform (this converges the Render service and triggers a deploy)"
apply_args=(-input=false)
[[ "${AUTO_APPROVE:-0}" == "1" ]] && apply_args+=(-auto-approve)
terraform apply "${apply_args[@]}"

# Report how wide the launch is so the operator can sanity-check the cohort.
if launch_mode="$(terraform output -raw launch_mode 2>/dev/null)"; then
  log "Soft-launch mode: ${launch_mode}"
fi

service_url="${SERVICE_URL:-$(terraform output -raw service_url 2>/dev/null || true)}"
[[ -n "$service_url" ]] || die "could not determine service_url from terraform outputs"

health_url="${service_url%/}${HEALTH_PATH}"
log "Smoke testing ${health_url}"

attempt=1
while (( attempt <= SMOKE_RETRIES )); do
  status="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$health_url" || echo 000)"
  if [[ "$status" == "200" ]]; then
    log "Service is live (HTTP 200) after ${attempt} attempt(s): ${service_url}"
    exit 0
  fi
  warn "attempt ${attempt}/${SMOKE_RETRIES}: got HTTP ${status}, retrying in ${SMOKE_INTERVAL}s"
  sleep "$SMOKE_INTERVAL"
  (( attempt++ ))
done

die "service did not become healthy after $(( SMOKE_RETRIES * SMOKE_INTERVAL ))s"
