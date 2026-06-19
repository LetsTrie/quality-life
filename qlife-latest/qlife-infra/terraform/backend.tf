# Remote state backend — prevents the terraform.tfstate file (which contains
# the DB password) from living on a developer's laptop.
#
# SETUP (one-time, before the first `terraform init`):
#   1. Create the S3 bucket manually in the AWS console (or via the bootstrap
#      script below). Versioning and SSE must be enabled BEFORE init.
#   2. Create a DynamoDB table named <name_prefix>-tf-locks with partition key
#      "LockID" (String) for state locking.
#   3. Fill in the values below and run `terraform init`.
#
# Quick bootstrap (run once with a user that has S3+DynamoDB permissions):
#   BUCKET=qlife-prod-tf-state
#   aws s3api create-bucket --bucket $BUCKET --region ap-south-1 \
#     --create-bucket-configuration LocationConstraint=ap-south-1
#   aws s3api put-bucket-versioning --bucket $BUCKET \
#     --versioning-configuration Status=Enabled
#   aws s3api put-bucket-encryption --bucket $BUCKET \
#     --server-side-encryption-configuration \
#     '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
#   aws s3api put-public-access-block --bucket $BUCKET \
#     --public-access-block-configuration \
#     'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'
#   aws dynamodb create-table --table-name qlife-prod-tf-locks \
#     --attribute-definitions AttributeName=LockID,AttributeType=S \
#     --key-schema AttributeName=LockID,KeyType=HASH \
#     --billing-mode PAY_PER_REQUEST --region ap-south-1

terraform {
  backend "s3" {
    bucket         = "qlife-prod-tf-state-397289504874"
    key            = "qlife/prod/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "qlife-prod-tf-locks"
    encrypt        = true
  }
}
