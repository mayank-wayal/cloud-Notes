import dotenv from "dotenv";

dotenv.config();

const required = ["DATABASE_URL", "AWS_REGION", "S3_BUCKET_NAME", "COGNITO_USER_POOL_ID", "COGNITO_CLIENT_ID"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DATABASE_SSL === "true",
  awsRegion: process.env.AWS_REGION,
  s3BucketName: process.env.S3_BUCKET_NAME,
  s3SignedUrlExpiresSeconds: Number(process.env.S3_SIGNED_URL_EXPIRES_SECONDS || 300),
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 25),
  // Cognito configuration
  cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID,
  cognitoClientId: process.env.COGNITO_CLIENT_ID,
  cognitoRegion: process.env.COGNITO_REGION || process.env.AWS_REGION
};
