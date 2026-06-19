terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  # These tags are merged onto every resource Terraform manages.
  # Activate them in the AWS console under Billing → Cost allocation tags
  # so they appear as columns in Cost Explorer.
  default_tags {
    tags = {
      Project     = "qlife"
      Environment = var.name_prefix
      ManagedBy   = "terraform"
    }
  }
}

