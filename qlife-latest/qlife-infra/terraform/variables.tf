variable "aws_region" {
  type        = string
  description = "AWS region to deploy into."
  default     = "ap-south-1"
}

variable "name_prefix" {
  type        = string
  description = "Resource name prefix, e.g. qlife-dev."
}

# --- Networking (BYO VPC/Subnets) ---
variable "vpc_id" {
  type        = string
  description = "Existing VPC ID."
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs for RDS subnet group. If empty, Terraform will fall back to `public_subnet_ids` (cheaper/simpler, less isolated)."
}

# --- RDS ---
variable "db_name" {
  type        = string
  description = "Initial database name."
  default     = "qlife"
}

variable "db_username" {
  type        = string
  description = "Master username."
  default     = "qlife"
}

variable "db_password" {
  type        = string
  description = "Master password (optional). If null, Terraform will read it from SSM Parameter Store (SecureString). Default param path is /qlife/<name_prefix>/db_password (or override with db_password_ssm_parameter_name)."
  sensitive   = true
  default     = null
}

variable "db_password_ssm_parameter_name" {
  type        = string
  description = "Optional override for the SSM Parameter Store name that holds the DB master password (SecureString). If null, defaults to /qlife/<name_prefix>/db_password."
  default     = null
}

variable "db_instance_class" {
  type        = string
  description = "RDS instance class."
  default     = "db.t4g.micro"
}

variable "db_allocated_storage_gb" {
  type        = number
  description = "Allocated storage in GB."
  default     = 20
}

# --- S3 ---
variable "assets_bucket_force_destroy" {
  type        = bool
  description = "If true, allow terraform destroy to delete bucket contents (dev only)."
  default     = false
}

variable "enable_cloudfront" {
  type        = bool
  description = "If true, create CloudFront distributions for admin + API. If your AWS account is not verified for CloudFront, set to false to fall back to S3 static website (admin) + EB CNAME (api)."
  default     = true
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnet IDs. The EB EC2 instance runs here (single-instance mode, no ALB)."
}

# --- Budgets ---
variable "budget_monthly_usd" {
  type        = number
  description = "Monthly cost budget limit in USD. An alert fires at 80% and again at 100%."
  default     = 50
}

variable "budget_alert_email" {
  type        = string
  description = "Email address for budget alert notifications."
}

variable "eb_solution_stack" {
  type        = string
  description = "Elastic Beanstalk solution stack. Use latest Node.js 20 on Amazon Linux 2023."
  default     = "64bit Amazon Linux 2023 v6.11.2 running Node.js 20"
}

variable "eb_instance_type" {
  type        = string
  description = "EC2 instance type for Elastic Beanstalk environment."
  default     = "t4g.micro"
}

variable "eb_min_instances" {
  type        = number
  description = "Minimum EC2 instances in the Elastic Beanstalk auto-scaling group."
  default     = 1
}

variable "eb_max_instances" {
  type        = number
  description = "Maximum EC2 instances in the Elastic Beanstalk auto-scaling group. Capped at 1 to prevent runaway scale-out cost."
  default     = 1
}
