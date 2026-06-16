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
  description = "Private subnet IDs for RDS subnet group."
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
  description = "Master password (supply via TF_VAR_db_password)."
  sensitive   = true
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

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnet IDs for the Elastic Beanstalk load balancer."
}

variable "eb_solution_stack" {
  type        = string
  description = "Elastic Beanstalk solution stack. Use latest Node.js 20 on Amazon Linux 2023."
  default     = "64bit Amazon Linux 2023 v6.3.1 running Node.js 20"
}

variable "eb_instance_type" {
  type        = string
  description = "EC2 instance type for Elastic Beanstalk environment."
  default     = "t4g.small"
}

variable "eb_min_instances" {
  type        = number
  description = "Minimum EC2 instances in the Elastic Beanstalk auto-scaling group."
  default     = 1
}

variable "eb_max_instances" {
  type        = number
  description = "Maximum EC2 instances in the Elastic Beanstalk auto-scaling group."
  default     = 3
}
