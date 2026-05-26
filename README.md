# cloud-Notes

## Local Development

Start PostgreSQL, apply the schema, and start the applications:

```bash
docker compose up -d postgres
cd backend && npm run db:migrate && npm run dev
cd frontend && npm run dev
```

For local backend development, set:

```dotenv
DATABASE_URL=postgresql://cloudnotes:cloudnotes_password@localhost:5432/cloudnotes
DATABASE_SSL=false
```

An Amazon RDS endpoint must be copied from the active RDS instance; an endpoint
that no longer resolves in DNS will fail with `getaddrinfo ENOTFOUND`.

## AWS RDS

To run the backend against PostgreSQL on RDS, configure `backend/.env` with the
available instance endpoint and enable TLS:

```dotenv
DATABASE_URL=postgresql://DB_USER:DB_PASSWORD@RDS_ENDPOINT:5432/cloudnotes
DATABASE_SSL=true
DATABASE_CONNECT_RETRIES=8
```

Allow inbound TCP port `5432` on the RDS security group only from the backend
host or your current development IP, then apply the schema:

```bash
cd backend
npm run db:migrate
npm start
```
