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

output "cognito_user_pool_id" {
  value       = aws_cognito_user_pool.users.id
  description = "Cognito User Pool ID."
}

output "cognito_app_client_id" {
  value       = aws_cognito_user_pool_client.mobile.id
  description = "Cognito App Client ID."
}

output "cognito_issuer" {
  value       = aws_cognito_user_pool.users.endpoint
  description = "Issuer base (use with /{userPoolId})."
}

output "cognito_domain" {
  value       = aws_cognito_user_pool_domain.hosted_ui.domain
  description = "Hosted UI domain prefix (without the cognito-idp host suffix)."
}

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
