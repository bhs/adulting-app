variable "render_api_key" {
  description = "Render API key (create one at https://dashboard.render.com/u/settings#api-keys). Prefer supplying via the RENDER_API_KEY / TF_VAR_render_api_key environment variable rather than committing it."
  type        = string
  sensitive   = true
}

variable "render_owner_id" {
  description = "Render owner (user or team) ID that owns the created resources, e.g. 'tea-...' or 'usr-...'. Find it under Account Settings or via the Render API."
  type        = string
}

variable "service_name" {
  description = "Name of the Render web service."
  type        = string
  default     = "adulting-app"
}

variable "region" {
  description = "Render region to deploy into."
  type        = string
  default     = "oregon"

  validation {
    condition     = contains(["frankfurt", "ohio", "oregon", "singapore", "virginia"], var.region)
    error_message = "region must be one of: frankfurt, ohio, oregon, singapore, virginia."
  }
}

variable "plan" {
  description = "Render instance plan for the web service."
  type        = string
  default     = "starter"
}

variable "repo_url" {
  description = "Git repository URL Render builds from."
  type        = string
  default     = "https://github.com/adulting-app/adulting-app"
}

variable "branch" {
  description = "Git branch Render builds and auto-deploys from."
  type        = string
  default     = "main"
}

variable "dockerfile_path" {
  description = "Path to the Dockerfile within the repository."
  type        = string
  default     = "./Dockerfile"
}

variable "health_check_path" {
  description = "Path Render polls to confirm the service is healthy. Must return HTTP 200."
  type        = string
  default     = "/api/health"
}

variable "auto_deploy" {
  description = "Whether Render should auto-deploy on every push to the tracked branch."
  type        = bool
  default     = true
}

variable "database_plan" {
  description = "Render Postgres plan. Use 'free' for the free tier."
  type        = string
  default     = "basic_256mb"
}

variable "database_version" {
  description = "Postgres major version."
  type        = string
  default     = "16"
}

variable "soft_launch_allowlist" {
  description = <<-EOT
    Comma/whitespace-separated email allow-list defining the soft-launch cohort.
    Entries may be exact addresses ('alice@example.com'), domain wildcards
    ('*@example.com'), or a single '*' to open the launch to everyone.
    An empty value keeps the launch closed (nobody admitted). This value is
    injected into the web service as the SOFT_LAUNCH_ALLOWLIST env var and read
    by lib/soft-launch/allowlist.ts.
  EOT
  type        = list(string)
  default     = []
}

variable "extra_env_vars" {
  description = "Additional plaintext environment variables to set on the web service."
  type        = map(string)
  default     = {}
}
