# AWS Quick Start Guide

Deploy your Next.js application to AWS in under 15 minutes.

## Prerequisites Checklist

- [ ] AWS account with Free Tier eligibility
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Terraform >= 1.0 installed
- [ ] Node.js 20.x installed

## 5-Step Deployment

### Step 1: Configure Infrastructure (2 min)

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
project_name = "myapp"      # Change this to your app name (lowercase)
aws_region   = "us-east-1"  # Keep for free tier
```

### Step 2: Deploy Infrastructure (10-15 min)

```bash
./scripts/setup-aws.sh
```

This will:
- Initialize Terraform
- Show you the plan
- Ask for confirmation
- Create all AWS resources

### Step 3: Save Important Info

After deployment completes, save these:

```bash
cd terraform

# Your app URL (save this!)
terraform output application_url

# Database password (you'll need this)
aws ssm get-parameter \
  --name $(terraform output -raw database_password_ssm) \
  --with-decryption \
  --query Parameter.Value \
  --output text
```

### Step 4: Deploy Application (2-3 min)

```bash
cd ..
./scripts/deploy.sh
```

Wait for deployment to complete (2-3 minutes).

### Step 5: Verify Deployment

```bash
# Get your URL again
cd terraform
terraform output application_url

# Visit it in your browser!
```

## That's It!

Your Next.js app is now running on AWS! 🎉

## What You Just Created

- ✅ **VPC** with public and private subnets
- ✅ **PostgreSQL Database** (db.t3.micro, 20GB)
- ✅ **Elastic Beanstalk** environment (Node.js 20)
- ✅ **S3 Buckets** for assets and deployments
- ✅ **Load Balancer** for high availability
- ✅ **Auto Scaling** (currently set to 1 instance)
- ✅ **CloudWatch Logs** for monitoring
- ✅ **SSM Parameter Store** for secrets

## Cost Estimate

**Free Tier (First 12 months)**: $0/month
- 750 hours EC2 t3.micro
- 750 hours RDS db.t3.micro
- 20GB database storage
- 100GB data transfer

**After Free Tier**: ~$15-25/month
- EC2: ~$8/month
- RDS: ~$15/month
- Data transfer: ~$0-5/month

## Next Steps

### Deploy Updates

```bash
./scripts/deploy.sh
```

### View Logs

```bash
# Install EB CLI (optional but recommended)
pip install awsebcli

# View logs
eb logs

# Or using AWS CLI
aws logs tail /aws/elasticbeanstalk/nextjs-app-env/var/log/eb-engine.log --follow
```

### Add Environment Variables

```bash
# Add a new variable
aws ssm put-parameter \
  --name "/myapp/API_KEY" \
  --value "your-secret-key" \
  --type "SecureString"

# Then redeploy
./scripts/deploy.sh
```

### Monitor Your App

```bash
# Check environment health
aws elasticbeanstalk describe-environment-health \
  --environment-name nextjs-app-env \
  --attribute-names All

# Check database metrics (CloudWatch)
# Go to AWS Console → CloudWatch → Metrics → RDS
```

### Add Custom Domain (Optional)

1. Edit `terraform/terraform.tfvars`:
   ```hcl
   domain_name = "yourdomain.com"
   ```

2. Apply changes:
   ```bash
   cd terraform
   terraform apply
   ```

3. Update nameservers at your domain registrar:
   ```bash
   terraform output route53_nameservers
   ```

4. Wait 24-48 hours for DNS propagation

5. Configure HTTPS listener in Elastic Beanstalk console

## Troubleshooting

### Deployment Failed?

```bash
# Check what went wrong
eb logs

# Check recent events
aws elasticbeanstalk describe-events \
  --environment-name nextjs-app-env \
  --max-records 20
```

### Can't Connect to Database?

```bash
# Verify security groups allow connections
aws ec2 describe-security-groups \
  --filters Name=group-name,Values=nextjs-app-rds-sg

# Check DATABASE_URL parameter
aws ssm get-parameter \
  --name "/myapp/DATABASE_URL" \
  --with-decryption
```

### App Not Starting?

```bash
# SSH into instance
eb ssh

# Check Node.js version
node --version

# Check environment variables
printenv | grep NODE
```

## Clean Up (Delete Everything)

**Warning**: This deletes all data permanently!

```bash
cd terraform
terraform destroy
# Type 'yes' to confirm
```

## Commands Cheat Sheet

```bash
# Deploy application
./scripts/deploy.sh

# View application logs
eb logs

# Check environment status
eb status

# SSH into instance
eb ssh

# Update environment variables
aws ssm put-parameter --name "/app/VAR" --value "value" --type "String"

# View infrastructure outputs
cd terraform && terraform output

# Update infrastructure
cd terraform && terraform apply

# Destroy everything
cd terraform && terraform destroy
```

## Getting Help

- **Infrastructure Issues**: Check `AWS_DEPLOYMENT.md`
- **Migration Issues**: Check `MIGRATION_GUIDE.md`
- **Terraform Details**: Check `terraform/README.md`
- **AWS Free Tier**: https://aws.amazon.com/free/
- **Elastic Beanstalk**: https://docs.aws.amazon.com/elasticbeanstalk/

## Security Checklist

After deployment, verify:

- [ ] Database is in private subnets (not publicly accessible)
- [ ] All S3 buckets have encryption enabled
- [ ] Security groups follow least privilege
- [ ] CloudWatch logs are enabled
- [ ] Database password is stored in SSM (encrypted)
- [ ] No sensitive data in environment variables
- [ ] HTTPS enabled (if using custom domain)

## Performance Tips

1. **Enable caching**: Configure CloudFront CDN
2. **Add database indexes**: For frequently queried fields
3. **Use connection pooling**: For database connections
4. **Enable compression**: Already configured in nginx
5. **Monitor metrics**: Set up CloudWatch alarms

## Backup Strategy

```bash
# Create RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier nextjs-app-db \
  --db-snapshot-identifier backup-$(date +%Y%m%d)

# Backup S3 buckets
aws s3 sync s3://your-assets-bucket ./backup/assets

# Export environment variables
aws ssm get-parameters-by-path \
  --path "/myapp/" \
  --with-decryption > env-backup.json
```

## Stay Within Free Tier

- ✅ Use t3.micro (or t2.micro) instances only
- ✅ Keep RDS as db.t3.micro with 20GB storage
- ✅ Disable Multi-AZ for RDS
- ✅ Keep Auto Scaling at 1-1 instances
- ✅ Monitor usage with AWS Cost Explorer
- ✅ Set up billing alerts at $10

## Learn More

- Full deployment guide: [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)
- Database migration: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Terraform details: [terraform/README.md](./terraform/README.md)
- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
