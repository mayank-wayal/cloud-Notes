# CloudNotes - Cognito Integration Quick Setup

## ⚡ 5-Minute Setup

### 1. AWS Cognito Console Setup (2 mins)
```
1. Go to: https://console.aws.amazon.com/cognito/
2. Create User Pool → Name: "cloudnotes-users"
3. Configure sign-in: Email + Password
4. Create app client → Name: "cloudnotes-frontend"
5. Callback URL: http://localhost:3000/auth/callback
6. Copy these values:
   - USER_POOL_ID (format: us-east-1_abc123xyz)
   - CLIENT_ID (format: 1a2b3c4d5e6f7g8h9i0j)
```

### 2. Backend Setup (1 min)
```bash
cd backend
# Update .env file:
COGNITO_USER_POOL_ID=us-east-1_abc123xyz
COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
COGNITO_REGION=us-east-1
```

### 3. Frontend Setup (1 min)
```bash
cd frontend
# Update .env.local file:
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_abc123xyz
NEXT_PUBLIC_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
NEXT_PUBLIC_COGNITO_REGION=us-east-1
```

### 4. Start Servers (1 min)
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 5. Test (1 min)
- Visit: http://localhost:3000
- Sign up / Login
- Upload a note
- Done! ✅

---

## 📦 What Changed?

### Backend Changes
- ✅ Removed JWT secret requirement
- ✅ Removed bcrypt password hashing
- ✅ Updated auth middleware to validate Cognito tokens
- ✅ Deleted auth routes (Cognito handles auth)
- ✅ Environment variables updated

**Files Modified:**
- `src/config/env.js` - Added Cognito config
- `src/middleware/auth.middleware.js` - Uses Cognito JWT verifier
- `src/app.js` - Removed auth routes
- `.env` - Added Cognito variables

### Frontend Changes
- ✅ Replaced manual JWT storage with Amplify Auth
- ✅ Updated API interceptors to get Cognito tokens
- ✅ Updated auth provider to use Cognito
- ✅ Created Cognito config file

**Files Modified:**
- `src/config/cognito.ts` - New Cognito configuration
- `src/services/api.ts` - Uses Cognito tokens automatically
- `src/services/auth.ts` - Cognito sign-in/up
- `src/features/auth/auth-provider.tsx` - Cognito-based provider
- `src/app/layout.tsx` - Imports Cognito config
- `.env.local` - Added Cognito variables

---

## 🔄 Architecture Changes

### Before (JWT + Database Users)
```
Frontend Form
  ↓
Backend API: POST /api/auth/register
  ↓
Database: Hash password → Store user
  ↓
JWT: Generate token → Return to frontend
```

### After (Cognito)
```
Frontend Form
  ↓
AWS Cognito: Sign up/Sign in
  ↓
Cognito returns: Access Token + ID Token
  ↓
Frontend: Store tokens (managed by Amplify)
  ↓
Backend: Validates token with Cognito public keys
```

---

## 📋 Environment Variables Needed

### Backend (.env)
```
DATABASE_URL=postgresql://...
COGNITO_USER_POOL_ID=us-east-1_...
COGNITO_CLIENT_ID=...
COGNITO_REGION=us-east-1
AWS_REGION=us-east-1
S3_BUCKET_NAME=...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_...
NEXT_PUBLIC_COGNITO_CLIENT_ID=...
NEXT_PUBLIC_COGNITO_REGION=us-east-1
```

---

## 🚀 Deploy to AWS

For detailed deployment instructions, see: **COGNITO_DEPLOYMENT_GUIDE.md**

Quick commands:
```bash
# Build Docker images
docker build -t cloudnotes-backend ./backend
docker build -t cloudnotes-frontend ./frontend

# Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/cloudnotes-backend
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/cloudnotes-frontend

# Deploy to ECS
aws ecs update-service --cluster cloudnotes-cluster --service cloudnotes-backend --force-new-deployment
aws ecs update-service --cluster cloudnotes-cluster --service cloudnotes-frontend --force-new-deployment
```

---

## ✅ Checklist

- [ ] Create Cognito User Pool
- [ ] Get USER_POOL_ID and CLIENT_ID
- [ ] Update backend .env
- [ ] Update frontend .env.local
- [ ] Test locally: `npm run dev`
- [ ] Create AWS RDS database
- [ ] Create S3 bucket
- [ ] Create ECR repositories
- [ ] Build and push Docker images
- [ ] Create ECS cluster and services
- [ ] Deploy and test
- [ ] Set up monitoring
- [ ] Configure domain and SSL

---

## 📞 Help & Troubleshooting

**Issue: "Invalid user pool ID"**
- Check Cognito User Pool ID in AWS console
- Verify format: `region_alphanumeric` (e.g., us-east-1_abc123xyz)

**Issue: "Client not found"**
- Check Cognito Client ID in User Pool
- Ensure app client is created in the pool

**Issue: "CORS error"**
- Verify `CLIENT_URL` in backend .env matches frontend URL
- Check Cognito callback URLs

**Issue: Login fails locally**
- Start both backend and frontend
- Check browser console for errors
- Verify Cognito credentials in .env files

---

**All integration complete! Your CloudNotes app now uses AWS Cognito for authentication. 🎉**
