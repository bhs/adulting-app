output "service_id" {
  description = "Render service ID of the web service."
  value       = render_web_service.app.id
}

output "service_url" {
  description = "Public URL of the deployed web service. deploy.sh smoke-tests this."
  value       = render_web_service.app.url
}

output "launch_mode" {
  description = "Coarse description of how wide the soft launch currently is, derived from the allow-list."
  value = length(var.soft_launch_allowlist) == 0 ? "closed" : (
    contains(var.soft_launch_allowlist, "*") ? "open" : "restricted"
  )
}

output "soft_launch_cohort_size" {
  description = "Number of allow-list entries configured for the soft launch."
  value       = length(var.soft_launch_allowlist)
}

output "database_id" {
  description = "Render Postgres instance ID."
  value       = render_postgres.db.id
}
