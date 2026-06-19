locals {
  assets_bucket_name = "${var.name_prefix}-assets"
  db_subnet_ids      = length(var.private_subnet_ids) > 0 ? var.private_subnet_ids : var.public_subnet_ids
  db_password_param_name = (
    var.db_password_ssm_parameter_name != null
    ? var.db_password_ssm_parameter_name
    : "/qlife/${var.name_prefix}/db_password"
  )
}

data "aws_ssm_parameter" "db_password" {
  count           = var.db_password == null ? 1 : 0
  name            = local.db_password_param_name
  with_decryption = true
}

locals {
  db_password_effective = var.db_password != null ? var.db_password : data.aws_ssm_parameter.db_password[0].value
}

# --- S3: assets/legal docs ---
resource "aws_s3_bucket" "assets" {
  bucket        = local.assets_bucket_name
  force_destroy = var.assets_bucket_force_destroy
  tags          = { Name = local.assets_bucket_name }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# --- RDS: Postgres ---
resource "aws_db_subnet_group" "db" {
  name       = "${var.name_prefix}-db-subnets"
  subnet_ids = local.db_subnet_ids
  tags       = { Name = "${var.name_prefix}-db-subnets" }
}

resource "aws_security_group" "db" {
  name        = "${var.name_prefix}-db"
  description = "Postgres access (restrict in production)"
  vpc_id      = var.vpc_id

  # Default: no ingress. Add app SG ingress in your environment module.
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.name_prefix}-db" }
}

resource "aws_db_instance" "postgres" {
  identifier                = "${var.name_prefix}-postgres"
  engine                    = "postgres"
  engine_version            = "15.18"
  instance_class            = var.db_instance_class
  allocated_storage         = var.db_allocated_storage_gb
  storage_encrypted         = true
  db_name                   = var.db_name
  username                  = var.db_username
  password                  = local.db_password_effective
  db_subnet_group_name      = aws_db_subnet_group.db.name
  vpc_security_group_ids    = [aws_security_group.db.id]
  publicly_accessible       = false
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.name_prefix}-postgres-final"
  deletion_protection       = true
  backup_retention_period   = 7
  tags                      = { Name = "${var.name_prefix}-postgres" }
}

# --- Cognito (Hosted UI auth baseline) ---
resource "aws_cognito_user_pool" "users" {
  name = "${var.name_prefix}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 12
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  tags = { Name = "${var.name_prefix}-users" }
}

resource "aws_cognito_user_pool_client" "mobile" {
  name         = "${var.name_prefix}-mobile"
  user_pool_id = aws_cognito_user_pool.users.id

  generate_secret = false

  # SDK auth (amazon_cognito_identity_dart_2): the app talks to the Cognito
  # user-pool API directly instead of the hosted UI.
  #  - USER_SRP_AUTH      → sign-in (the SDK's authenticateUser uses SRP)
  #  - REFRESH_TOKEN_AUTH → silent token refresh
  #  - USER_PASSWORD_AUTH → plain username/password fallback
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
  ]

  # Hosted-UI OAuth flows are retained for now as a fallback / transition aid;
  # the client no longer uses them. Safe to remove once SDK auth is fully
  # rolled out (also drop the aws_cognito_user_pool_domain below).
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  supported_identity_providers = ["COGNITO"]

  # Configure these per environment / app scheme.
  callback_urls = ["qlife://auth/callback"]
  logout_urls   = ["qlife://auth/logout"]
}

resource "aws_cognito_user_pool_domain" "hosted_ui" {
  domain       = "${var.name_prefix}-auth"
  user_pool_id = aws_cognito_user_pool.users.id
}

# --- IAM: Elastic Beanstalk instance role ---
resource "aws_iam_role" "eb_ec2" {
  name = "${var.name_prefix}-eb-ec2"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
  tags = { Name = "${var.name_prefix}-eb-ec2" }
}

resource "aws_iam_role_policy_attachment" "eb_ec2_web_tier" {
  role       = aws_iam_role.eb_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_instance_profile" "eb_ec2" {
  name = "${var.name_prefix}-eb-ec2-profile"
  role = aws_iam_role.eb_ec2.name
  tags = { Name = "${var.name_prefix}-eb-ec2-profile" }
}

# --- Security Group: Elastic Beanstalk → RDS ---
resource "aws_security_group_rule" "eb_to_db" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.eb.id
  security_group_id        = aws_security_group.db.id
  description              = "Allow Elastic Beanstalk EC2 instances to reach RDS"
}

resource "aws_security_group" "eb" {
  name        = "${var.name_prefix}-eb"
  description = "Elastic Beanstalk EC2 instance security group"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.name_prefix}-eb" }
}

# --- Elastic Beanstalk Application ---
resource "aws_elastic_beanstalk_application" "server" {
  name        = "${var.name_prefix}-server"
  description = "QLife NestJS API server"
  tags        = { Name = "${var.name_prefix}-server" }
}

# --- Elastic Beanstalk Environment ---
# Single-instance mode: no ALB (saves ~$18/mo), no NAT gateway needed
# (instance runs in a public subnet with a public IP). TLS can be terminated
# by CloudFront in front of the EB CNAME, or by adding Nginx+cert on the box.
resource "aws_elastic_beanstalk_environment" "server" {
  name                = "${var.name_prefix}-server-env"
  application         = aws_elastic_beanstalk_application.server.name
  solution_stack_name = var.eb_solution_stack

  # Single-instance: one EC2 with an Elastic IP, no load balancer.
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }

  # Instance profile
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_ec2.name
  }

  # Instance type
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.eb_instance_type
  }

  # Public subnet so traffic reaches the instance without a NAT gateway.
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = var.vpc_id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", var.public_subnet_ids)
  }

  # Security group for EC2 instances
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.eb.id
  }

  # Auto Scaling — min=max=1 prevents accidental scale-out cost.
  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MinSize"
    value     = tostring(var.eb_min_instances)
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"
    value     = tostring(var.eb_max_instances)
  }

  # Environment variables (runtime config)
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = "production"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PORT"
    value     = "8080"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DATABASE_URL"
    value     = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.address}:5432/${var.db_name}"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "COGNITO_REGION"
    value     = var.aws_region
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "COGNITO_USER_POOL_ID"
    value     = aws_cognito_user_pool.users.id
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "COGNITO_APP_CLIENT_ID"
    value     = aws_cognito_user_pool_client.mobile.id
  }

  # Health check path (used by EB internal checks, not an ALB target group).
  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "HealthCheckPath"
    value     = "/v1/health"
  }

  # Single-instance deploys replace in-place; AllAtOnce is the only option.
  setting {
    namespace = "aws:elasticbeanstalk:command"
    name      = "DeploymentPolicy"
    value     = "AllAtOnce"
  }

  tags = { Name = "${var.name_prefix}-server-env" }
}

# --- Budgets: monthly cost cap with email alerts ---
resource "aws_budgets_budget" "monthly" {
  name         = "${var.name_prefix}-monthly-budget"
  budget_type  = "COST"
  limit_amount = tostring(var.budget_monthly_usd)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.budget_alert_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.budget_alert_email]
  }
}
