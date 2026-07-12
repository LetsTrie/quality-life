output "assets_bucket_name" {
  value       = aws_s3_bucket.assets.bucket
  description = "Bucket for assets/legal docs."
}

output "db_endpoint" {
  value       = aws_db_instance.postgres.address
  description = "RDS hostname."
}

output "db_port" {
  value       = aws_db_instance.postgres.port
  description = "RDS port."
}

# Authentication is provided by WorkOS (configured in the WorkOS dashboard);
# there are no auth resources or outputs here.

output "eb_application_name" {
  value       = aws_elastic_beanstalk_application.server.name
  description = "Elastic Beanstalk application name."
}

output "eb_environment_name" {
  value       = aws_elastic_beanstalk_environment.server.name
  description = "Elastic Beanstalk environment name."
}

output "eb_cname" {
  value       = aws_elastic_beanstalk_environment.server.cname
  description = "Elastic Beanstalk CNAME (load balancer DNS). Point your API domain CNAME here."
}

output "api_cloudfront_domain" {
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.api[0].domain_name : null
  description = "CloudFront domain for the API (HTTPS). Null if enable_cloudfront=false."
}

output "admin_bucket_name" {
  value       = aws_s3_bucket.admin.bucket
  description = "S3 bucket that hosts the admin static site."
}

output "admin_cloudfront_domain" {
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.admin[0].domain_name : null
  description = "CloudFront domain for the admin UI (HTTPS). Null if enable_cloudfront=false."
}

output "admin_cloudfront_distribution_id" {
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.admin[0].id : null
  description = "CloudFront distribution ID for admin invalidations. Null if enable_cloudfront=false."
}

output "admin_website_url" {
  value       = "http://${aws_s3_bucket_website_configuration.admin.website_endpoint}"
  description = "Admin static website URL (HTTP, no CloudFront)."
}
