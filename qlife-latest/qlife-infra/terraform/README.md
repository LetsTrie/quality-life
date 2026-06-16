# QLife Infra (Terraform)

This folder is the deployment baseline for QLife.

## What it provisions (MVP)

- **S3 bucket** for static/legal docs and content assets (DB stores only URLs/metadata).
- **RDS Postgres** for the application database (managed, not self-hosted).
- **Cognito User Pool + App Client** placeholders for mobile auth (Hosted UI).

## Design notes

- This is intentionally minimal (KISS/YAGNI). Networking is BYO: you supply an existing VPC and subnets.
- Secrets are NOT stored in state: pass them as variables at apply time or via your secrets manager.

## Usage

1. Configure AWS credentials.
2. Provide required variables (see `variables.tf`).
3. Run:

```bash
terraform init
terraform plan
terraform apply
```

