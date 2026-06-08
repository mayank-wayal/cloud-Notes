import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const required = ["AWS_REGION", "S3_BUCKET_NAME", "COGNITO_USER_POOL_ID", "COGNITO_CLIENT_ID", "JWT_SECRET"];

if (!hasDatabaseUrl) {
  required.push("DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD");
}

const isPlaceholder = (value = "") => value.includes("replace_with") || value.includes("replace_me");

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  if (isPlaceholder(process.env[key])) {
    throw new Error(`Environment variable ${key} still contains a placeholder value`);
  }
}

if (!/^[a-z]{2}-[a-z]+-\d_[A-Za-z0-9]+$/.test(process.env.COGNITO_USER_POOL_ID)) {
  throw new Error("COGNITO_USER_POOL_ID must look like us-east-1_abc123xyz");
}

const cognitoJwksTimeoutMs = Number(process.env.COGNITO_JWKS_TIMEOUT_MS || 10000);
const databaseConnectRetries = Number(process.env.DATABASE_CONNECT_RETRIES || 3);
const bcryptSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

if (!Number.isFinite(cognitoJwksTimeoutMs) || cognitoJwksTimeoutMs <= 0) {
  throw new Error("COGNITO_JWKS_TIMEOUT_MS must be a positive number");
}

if (!Number.isInteger(databaseConnectRetries) || databaseConnectRetries < 0) {
  throw new Error("DATABASE_CONNECT_RETRIES must be a non-negative integer");
}

if (!Number.isInteger(bcryptSaltRounds) || bcryptSaltRounds < 10) {
  throw new Error("BCRYPT_SALT_ROUNDS must be an integer of 10 or higher");
}

const buildDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const user = encodeURIComponent(process.env.DB_USER);
  const password = encodeURIComponent(process.env.DB_PASSWORD);
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const database = encodeURIComponent(process.env.DB_NAME);

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRATION || "7d",
  bcryptSaltRounds,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  clientUrls: (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:3000").split(",").map((origin) => origin.trim()).filter(Boolean),
  databaseUrl: buildDatabaseUrl(),
  databaseSsl: process.env.DATABASE_SSL === "true",
  databaseConnectRetries,
  awsRegion: process.env.AWS_REGION,
  s3BucketName: process.env.S3_BUCKET_NAME,
  s3SignedUrlExpiresSeconds: Number(process.env.S3_SIGNED_URL_EXPIRES_SECONDS || 300),
  s3ConnectivityCheck: process.env.S3_CONNECTIVITY_CHECK === "true",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 25),
  maxNoteContentChars: Number(process.env.MAX_NOTE_CONTENT_CHARS || 200000),
  // Cognito configuration
  cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID,
  cognitoClientId: process.env.COGNITO_CLIENT_ID,
  cognitoRegion: process.env.COGNITO_REGION || process.env.AWS_REGION,
  cognitoJwksTimeoutMs
};
