provider "render" {
  api_key  = var.render_api_key
  owner_id = var.render_owner_id
}

locals {
  # The application reads a single comma-separated string (see
  # lib/soft-launch/allowlist.ts); Terraform models the cohort as a list for
  # clean tfvars, so we join it here.
  soft_launch_allowlist = join(",", var.soft_launch_allowlist)

  # Base env vars every deploy needs. The Render provider expects each entry to
  # be an object with a `value` (or `generate_value`) attribute.
  base_env_vars = {
    NODE_ENV = { value = "production" }
    # Connect to Postgres over Render's private network (same region), which is
    # faster and avoids exposing the DB publicly.
    DATABASE_URL          = { value = render_postgres.db.connection_info.internal_connection_string }
    SOFT_LAUNCH_ALLOWLIST = { value = local.soft_launch_allowlist }
  }

  # Fold any operator-supplied plaintext vars into the provider's shape.
  extra_env_vars = { for k, v in var.extra_env_vars : k => { value = v } }
}

# Managed PostgreSQL for the app. Migrations run on service startup
# (`prisma migrate deploy`, see the Dockerfile CMD).
resource "render_postgres" "db" {
  name          = "${var.service_name}-db"
  plan          = var.database_plan
  region        = var.region
  version       = var.database_version
  database_name = "adulting_app"
  database_user = "adulting_app_user"
}

# The Next.js web service, built from the repo's Dockerfile.
resource "render_web_service" "app" {
  name              = var.service_name
  plan              = var.plan
  region            = var.region
  health_check_path = var.health_check_path

  runtime_source = {
    docker = {
      repo_url        = var.repo_url
      branch          = var.branch
      dockerfile_path = var.dockerfile_path
      auto_deploy     = var.auto_deploy
    }
  }

  env_vars = merge(local.base_env_vars, local.extra_env_vars)
}
