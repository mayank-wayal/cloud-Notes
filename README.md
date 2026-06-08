# CloudNotes

CloudNotes is a full-stack note app with a Next.js frontend, an Express API, PostgreSQL, AWS Cognito authentication, and private file storage in S3.

## What It Does

- Sign up and sign in with Cognito
- Create, edit, archive, and delete notes
- Upload files to private S3 storage
- Generate preview and download links with short-lived URLs
- Protect backend routes with Cognito JWTs

## Stack

- Frontend: Next.js, React, TypeScript
- Backend: Node.js, Express
- Database: PostgreSQL
- Auth: AWS Cognito
- Storage: Amazon S3
- Deployment: EC2, PM2

## Repo Layout

```text
cloud-Notes/
  backend/   Express API, database helpers, AWS integration
  frontend/  Next.js app, auth flow, dashboard, upload UI
```

## Local Run

Start the backend:

```bash
cd backend
npm install
npm run db:migrate
npm run dev
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/health`

## Environment

Backend `backend/.env.local`:

```env
NODE_ENV=development
PORT=5000
CLIENT_URLS=http://localhost:3000,http://127.0.0.1:3000

DB_HOST=<host>
DB_PORT=5432
DB_NAME=<db>
DB_USER=<user>
DB_PASSWORD=<password>
DATABASE_SSL=true

AWS_REGION=<region>
S3_BUCKET_NAME=<bucket>
S3_SIGNED_URL_EXPIRES_SECONDS=300

COGNITO_REGION=<region>
COGNITO_USER_POOL_ID=<pool-id>
COGNITO_CLIENT_ID=<public-client-id>
COGNITO_CLIENT_SECRET=
```

Frontend `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_COGNITO_REGION=<region>
NEXT_PUBLIC_COGNITO_USER_POOL_ID=<pool-id>
NEXT_PUBLIC_COGNITO_CLIENT_ID=<public-client-id>
```

## Git Hygiene

The repository already ignores common generated output such as:

- `node_modules/`
- `.next/`
- `coverage/`
- `*.log`
- `*.tsbuildinfo`

Keep those out of commits so pushes stay clean and reviewable.

## Helpful Commands

Backend:

```bash
npm run dev
npm run test
npm run db:migrate
```

Frontend:

```bash
npm run dev
npm run lint
npm run test
```

## Notes

- The frontend must use a Cognito app client without a secret.
- The backend must allow the browser origin through CORS.
- Upload requests go to the Express API on port `5000`, not the Next.js dev server.
