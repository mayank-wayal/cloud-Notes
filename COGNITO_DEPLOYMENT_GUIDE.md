# CloudNotes - AWS Cognito Integration & Deployment Guide

## 🚀 Phase 1: AWS Cognito Setup (Console)

### Step 1.1: Create Cognito User Pool

1. **Go to AWS Console:**
   - Navigate to `AWS Cognito` → `User Pools`
   - Click **Create user pool**

2. **Configuration:**
   - **Pool name:** `cloudnotes-users`
   - **Authentication methods:** Email + Password
   - **Password policy:** 
     - Minimum length: 8
     - Require uppercase: ✓
     - Require numbers: ✓
     - Require special characters: ✓
   - **MFA:** Optional (for learning)
   - **Custom attributes:** None (use defaults for now)

3. **App Client Settings:**
   - Create a new app client: `cloudnotes-frontend`
   - **Callback URL:** `http://localhost:3000/auth/callback`
   - **Sign-out URL:** `http://localhost:3000/logout`
   - **Allowed OAuth scopes:** email, openid, profile
   - **Allowed OAuth flows:** Authorization code grant

4. **Save these values:**
   ```
   USER_POOL_ID = us-east-1_abc123xyz (example)
   CLIENT_ID = 1a2b3c4d5e6f7g8h9i0j (example)
   REGION = us-east-1
   ```

### Step 1.2: Create Cognito Identity Pool (Optional - for direct S3 upload)

1. **Go to AWS Console:**
   - Navigate to `AWS Cognito` → `Identity Pools`
   - Click **Create new identity pool**

2. **Configuration:**
   - **Pool name:** `cloudnotes-identity`
   - **Authentication providers:** Link to User Pool
   - **User Pool ID:** (from Step 1.1)
   - **App Client ID:** (from Step 1.1)

3. **IAM Role for authenticated users:**
   - Allow `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`
   - Resource: `arn:aws:s3:::cloudnotes-bucket/users/${cognito-identity.amazonaws.com:sub}/*`

---

## 🔧 Phase 2: Local Setup & Testing

### Step 2.1: Update Environment Variables

**Backend (.env):**
```bash
cd backend
# Replace with your actual Cognito credentials:
COGNITO_USER_POOL_ID=us-east-1_your_pool_id
COGNITO_CLIENT_ID=your_client_id
COGNITO_REGION=us-east-1
```

**Frontend (.env.local):**
```bash
cd frontend
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_your_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
NEXT_PUBLIC_COGNITO_REGION=us-east-1
```

### Step 2.2: Start Local Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App running on http://localhost:3000
```

### Step 2.3: Test Registration & Login

1. Visit: `http://localhost:3000/register`
2. Create a test account
3. Login should work and redirect to dashboard
4. Check browser DevTools → Application → Auth tokens

---

## ☁️ Phase 3: AWS Deployment

### Step 3.1: Create AWS RDS PostgreSQL Database

1. **AWS Console → RDS:**
   - Create database: `cloudnotes-db`
   - Engine: PostgreSQL 16
   - Instance: `db.t3.micro` (free tier eligible)
   - Storage: 20 GB
   - Backup: 7 days
   - Multi-AZ: No (for learning)

2. **Security Group:**
   - Allow inbound: Port 5432 from ECS security group

3. **Save connection string:**
   ```
   DATABASE_URL=postgresql://postgres:password@cloudnotes-db.c12abcdef.us-east-1.rds.amazonaws.com:5432/cloudnotes
   ```

### Step 3.2: Create S3 Bucket

1. **AWS Console → S3:**
   - Create bucket: `cloudnotes-storage`
   - Region: `us-east-1`
   - **Block public access:** Yes
   - **Enable versioning:** No
   - **Enable encryption:** Yes (SSE-S3)

2. **Bucket Policy (for authenticated users only):**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "AWS": "arn:aws:iam::ACCOUNT_ID:role/CloudnotesCognitoIdentityRole"
         },
         "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
         "Resource": "arn:aws:s3:::cloudnotes-storage/users/*"
       }
     ]
   }
   ```

### Step 3.3: Create ECR Repositories

**Backend:**
```bash
aws ecr create-repository --repository-name cloudnotes-backend --region us-east-1
# Save: 123456789.dkr.ecr.us-east-1.amazonaws.com/cloudnotes-backend
```

**Frontend:**
```bash
aws ecr create-repository --repository-name cloudnotes-frontend --region us-east-1
# Save: 123456789.dkr.ecr.us-east-1.amazonaws.com/cloudnotes-frontend
```

### Step 3.4: Build & Push Docker Images

**Backend:**
```bash
cd backend
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker build -t cloudnotes-backend .
docker tag cloudnotes-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/cloudnotes-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/cloudnotes-backend:latest
```

**Frontend:**
```bash
cd frontend
docker build -t cloudnotes-frontend .
docker tag cloudnotes-frontend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/cloudnotes-frontend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/cloudnotes-frontend:latest
```

### Step 3.5: Create ECS Cluster

1. **AWS Console → ECS:**
   - Create cluster: `cloudnotes-cluster`
   - Infrastructure: EC2 (or Fargate for managed)
   - Instance type: `t3.micro` (free tier eligible)

### Step 3.6: Create Task Definitions

**Backend Task Definition:**
- Image: `123456789.dkr.ecr.us-east-1.amazonaws.com/cloudnotes-backend:latest`
- Port: 5000
- Environment:
  ```
  DATABASE_URL=postgresql://...
  COGNITO_USER_POOL_ID=...
  COGNITO_CLIENT_ID=...
  S3_BUCKET_NAME=cloudnotes-storage
  AWS_REGION=us-east-1
  CLIENT_URL=https://yourdomain.com
  ```

**Frontend Task Definition:**
- Image: `123456789.dkr.ecr.us-east-1.amazonaws.com/cloudnotes-frontend:latest`
- Port: 3000
- Environment:
  ```
  NEXT_PUBLIC_API_URL=https://api.yourdomain.com
  NEXT_PUBLIC_COGNITO_USER_POOL_ID=...
  NEXT_PUBLIC_COGNITO_CLIENT_ID=...
  ```

### Step 3.7: Create Services & Load Balancers

1. **Application Load Balancer (ALB):**
   - Create ALB: `cloudnotes-alb`
   - Port 80 → Redirect to 443
   - Port 443 → Target groups:
     - `/api/*` → Backend service
     - `/*` → Frontend service

2. **ECS Services:**
   - Backend service: 1 task, ALB listener port 5000
   - Frontend service: 1 task, ALB listener port 3000

### Step 3.8: Set Up SSL/TLS

1. **AWS Certificate Manager (ACM):**
   - Request certificate: `yourdomain.com`
   - Add CNAME records to DNS
   - Attach to ALB

2. **Route 53 (DNS):**
   - Create A record: `yourdomain.com` → ALB
   - Create CNAME: `api.yourdomain.com` → ALB

---

## 📊 Phase 4: Monitoring & Logs

### CloudWatch Logs
```bash
# View backend logs
aws logs tail /ecs/cloudnotes-backend --follow

# View frontend logs
aws logs tail /ecs/cloudnotes-frontend --follow
```

### CloudWatch Alarms
- Set up alarms for:
  - CPU usage > 80%
  - Memory usage > 80%
  - Unhealthy target count > 0
  - API latency > 1s

---

## 🔒 Security Checklist

- ✅ Enable RDS encryption at rest
- ✅ Enable S3 encryption
- ✅ Use VPC with private subnets for RDS
- ✅ Use security groups to restrict access
- ✅ Enable CloudTrail for audit logging
- ✅ Use IAM roles for ECS tasks
- ✅ Rotate AWS credentials regularly
- ✅ Enable MFA on AWS console
- ✅ Set up budget alerts

---

## 💰 Cost Estimation

**Monthly estimate (first 50K users):**
- RDS (t3.micro): ~$15
- S3 (10 GB storage): ~$0.23
- ECS (t3.micro × 2): ~$20
- ALB: ~$16
- NAT Gateway: ~$32
- **Cognito: $0** (within free tier)
- **Total: ~$83/month**

---

## 🆘 Troubleshooting

### Cognito Token Issues
```bash
# Verify token signature
# Check token in debugger.auth0.com

# Common errors:
# - Invalid user pool ID: Verify COGNITO_USER_POOL_ID
# - Client ID mismatch: Verify COGNITO_CLIENT_ID
# - Token expired: Refresh token automatically handled by Amplify
```

### Database Connection Issues
```bash
# Test connection
psql -U postgres -h cloudnotes-db.c12abcdef.us-east-1.rds.amazonaws.com -d cloudnotes

# Check security group rules
# Verify RDS endpoint is correct
```

### S3 Upload Issues
```bash
# Check bucket policy
# Verify IAM role has correct permissions
# Check CORS configuration
```

---

## 📚 Useful Commands

```bash
# Deploy backend
cd backend && npm run build && docker build -t cloudnotes-backend .

# Deploy frontend
cd frontend && npm run build && docker build -t cloudnotes-frontend .

# Check ECS tasks
aws ecs list-tasks --cluster cloudnotes-cluster

# Scale service
aws ecs update-service --cluster cloudnotes-cluster --service cloudnotes-backend --desired-count 3

# View logs
aws logs tail /ecs/cloudnotes-backend --follow --since 1h
```

---

**Ready to deploy CloudNotes to AWS! 🚀**
