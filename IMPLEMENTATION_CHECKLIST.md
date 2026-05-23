# 🎯 CloudNotes - Implementation Checklist

## ✅ Phase 1: Code Integration (COMPLETED)

### Backend
- [x] Installed aws-jwt-verify
- [x] Updated src/config/env.js with Cognito variables
- [x] Updated src/middleware/auth.middleware.js to use Cognito JWT verifier
- [x] Updated src/app.js to remove auth routes
- [x] Updated .env file with Cognito placeholders

### Frontend
- [x] Installed amazon-cognito-identity-js, @aws-amplify/auth, @aws-amplify/core
- [x] Created src/config/cognito.ts
- [x] Updated src/services/api.ts to use Cognito tokens
- [x] Updated src/services/auth.ts to use Cognito signUp/signIn
- [x] Updated src/features/auth/auth-provider.tsx
- [x] Updated src/app/layout.tsx
- [x] Updated .env.local file with Cognito placeholders

---

## ⏭️ Phase 2: AWS Setup (DO THIS NEXT)

### [ ] Step 1: Create AWS Account (if needed)
- [ ] Go to: https://aws.amazon.com/
- [ ] Click "Create an AWS Account"
- [ ] Verify email and add payment method
- [ ] Note: Free tier includes 50K Cognito users/month

### [ ] Step 2: Create Cognito User Pool
- [ ] Login to AWS Console
- [ ] Navigate to: Cognito → User Pools
- [ ] Click: "Create user pool"
- [ ] **Pool name:** `cloudnotes-users`
- [ ] **Cognito user name attributes:** Email
- [ ] **Password policy:** 
  - [x] Minimum length: 8
  - [x] Require uppercase: Yes
  - [x] Require numbers: Yes
  - [x] Require special characters: Yes
- [ ] Continue through remaining steps
- [ ] **Recommended:** Skip email and phone verification for learning

### [ ] Step 3: Create App Client
- [ ] Go to: User Pools → cloudnotes-users → Integrations → App clients
- [ ] Click: "Create app client"
- [ ] **App name:** `cloudnotes-frontend`
- [ ] **Authentication flows:** Authorization code grant
- [ ] **Callback URL:** `http://localhost:3000/auth/callback`
- [ ] **Sign-out URL:** `http://localhost:3000/logout`
- [ ] **Allowed OAuth scopes:** 
  - [x] email
  - [x] openid
  - [x] profile
- [ ] **Create app client**

### [ ] Step 4: Save Credentials
After creating the pool and client, copy these values:

```
COGNITO_USER_POOL_ID = us-east-1_abc123xyz
COGNITO_CLIENT_ID = 1a2b3c4d5e6f7g8h9i0j
COGNITO_REGION = us-east-1
```

**Find these in:**
- Pool ID: User Pools → cloudnotes-users → General Settings → Pool ID
- Client ID: User Pools → cloudnotes-users → Integrations → App clients → cloudnotes-frontend → Client ID

---

## 📝 Phase 3: Environment Configuration (DO THIS)

### [ ] Backend Environment

**File:** `backend/.env`

Find these lines:
```
COGNITO_USER_POOL_ID=replace_with_cognito_user_pool_id
COGNITO_CLIENT_ID=replace_with_cognito_client_id
COGNITO_REGION=us-east-1
```

Replace with your actual values:
```
COGNITO_USER_POOL_ID=us-east-1_abc123xyz
COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
COGNITO_REGION=us-east-1
```

### [ ] Frontend Environment

**File:** `frontend/.env.local`

Replace placeholders with your Cognito credentials:
```
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_abc123xyz
NEXT_PUBLIC_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
NEXT_PUBLIC_COGNITO_REGION=us-east-1
```

---

## 🚀 Phase 4: Local Testing (DO THIS)

### [ ] Terminal 1: Start Backend
```bash
cd /path/to/cloudnotes/backend
npm run dev
```

Expected output:
```
> node --watch src/server.js
CloudNotes API listening on port 5000
```

If you see errors about missing COGNITO_USER_POOL_ID:
- [ ] Verify backend/.env has your credentials
- [ ] Verify no spaces around = signs

### [ ] Terminal 2: Start Frontend
```bash
cd /path/to/cloudnotes/frontend
npm run dev
```

Expected output:
```
> next dev
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### [ ] Test Registration
- [ ] Visit: http://localhost:3000
- [ ] Click "Register"
- [ ] Fill in form:
  - Email: `test@example.com`
  - Password: `TestPass123!`
  - Confirm: `TestPass123!`
- [ ] Click "Register"
- [ ] **Expected:** Redirects to dashboard
- [ ] **If error:** Check browser console (F12) for details

### [ ] Test Login
- [ ] Click "Logout" if you're already logged in
- [ ] Go to: http://localhost:3000/login
- [ ] Enter your test credentials
- [ ] Click "Login"
- [ ] **Expected:** Redirects to dashboard

### [ ] Test Note Upload
- [ ] On dashboard, click "Upload"
- [ ] Enter title: "Test Note"
- [ ] Select or drag a file
- [ ] Click "Upload"
- [ ] **Expected:** File appears in notes list

### [ ] Verify in Browser DevTools
- [ ] Press F12 (Open Developer Tools)
- [ ] Go to Application → Local Storage
- [ ] Look for `AMPLIFY_CACHE` keys (Cognito tokens)
- [ ] **Expected:** Token data is stored by Cognito

---

## 🐛 Phase 5: Troubleshooting (IF NEEDED)

### Issue: "Invalid user pool ID" at backend startup
**Cause:** COGNITO_USER_POOL_ID not set correctly
**Solution:**
```bash
# Check .env file
cat backend/.env | grep COGNITO

# Should output:
# COGNITO_USER_POOL_ID=us-east-1_abc123xyz
# COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j

# Restart backend:
npm run dev
```

### Issue: CORS error in browser console
**Cause:** Cognito callback URL not configured
**Solution:**
1. Go to AWS Console → Cognito → cloudnotes-users
2. Click: Integrations → App client settings
3. Verify Callback URL includes: `http://localhost:3000/auth/callback`
4. Save changes
5. Refresh browser

### Issue: "Cannot find module 'aws-amplify'" in frontend
**Cause:** Dependencies not installed
**Solution:**
```bash
cd frontend
npm install
npm run dev
```

### Issue: Backend won't start - "Cannot find module 'aws-jwt-verify'"
**Cause:** Dependencies not installed
**Solution:**
```bash
cd backend
npm install
npm run dev
```

### Issue: Cannot sign up - "User already exists"
**Cause:** Email already registered in Cognito pool
**Solution:**
- Use a different email (add +1, +2, etc.: test+2@example.com)
- Or ask instructor to reset the user pool

---

## ☁️ Phase 6: AWS Deployment (OPTIONAL - DO LATER)

When ready to deploy to production AWS:

1. **Read:** COGNITO_DEPLOYMENT_GUIDE.md
2. **Create RDS database**
3. **Create S3 bucket**
4. **Create Docker images**
5. **Push to ECR**
6. **Create ECS cluster and services**
7. **Deploy**

---

## ✨ Success Criteria

You're done when:

- [x] Backend starts without errors
- [x] Frontend starts without errors
- [x] Can register a new account
- [x] Can login with created account
- [x] Can upload a file
- [x] Can see uploaded files in list
- [x] Can delete files
- [x] Can logout
- [x] Tokens appear in DevTools

---

## 📚 Quick Reference

### Important Files Modified
```
backend/src/config/env.js              ← Cognito config
backend/src/middleware/auth.middleware.js  ← Cognito JWT verification
backend/src/app.js                     ← Removed auth routes
backend/.env                           ← Cognito credentials

frontend/src/config/cognito.ts         ← Amplify setup
frontend/src/services/api.ts           ← Token injection
frontend/src/services/auth.ts          ← Cognito methods
frontend/src/features/auth/auth-provider.tsx  ← Session management
frontend/src/app/layout.tsx            ← Cognito import
frontend/.env.local                    ← Cognito credentials
```

### Commands You'll Need
```bash
# Start backend development server
cd backend && npm run dev

# Start frontend development server
cd frontend && npm run dev

# Install dependencies
npm install

# Build for production
npm run build

# Deploy commands (later)
docker build -t cloudnotes-backend .
docker build -t cloudnotes-frontend .
```

### Useful Links
- AWS Cognito Console: https://console.aws.amazon.com/cognito/
- Amplify Auth Docs: https://docs.amplify.aws/gen1/react/build-a-backend/auth/
- Cognito User Pool: https://docs.aws.amazon.com/cognito/latest/developerguide/

---

## 🎊 Next Milestone

After local testing works:
- Deploy to AWS (see COGNITO_DEPLOYMENT_GUIDE.md)
- Add social login (Google, Facebook)
- Add MFA (Multi-Factor Authentication)
- Add password recovery
- Add profile management

---

**READY? Start with Step 1: Create AWS Account!** 🚀
