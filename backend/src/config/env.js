import dotenv from "dotenv";

dotenv.config();

const required = [
  "DATABASE_URL",
  "AWS_REGION",
  "S3_BUCKET_NAME",
  "COGNITO_USER_POOL_ID",
  "COGNITO_CLIENT_ID"
];

if (process.env.NODE_ENV !== "production" || process.env.REQUIRE_STATIC_AWS_CREDENTIALS === "true") {
  required.push("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY");
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

if (!Number.isFinite(cognitoJwksTimeoutMs) || cognitoJwksTimeoutMs <= 0) {
  throw new Error("COGNITO_JWKS_TIMEOUT_MS must be a positive number");
}

if (!Number.isInteger(databaseConnectRetries) || databaseConnectRetries < 0) {
  throw new Error("DATABASE_CONNECT_RETRIES must be a non-negative integer");
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  clientUrls: (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:3000").split(",").map((origin) => origin.trim()).filter(Boolean),
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DATABASE_SSL === "true",
  databaseConnectRetries,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
