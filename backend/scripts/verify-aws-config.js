import dotenv from "dotenv";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import pg from "pg";
import https from "https";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

const tests = [];
let passedTests = 0;
let failedTests = 0;

const test = (name, fn) => {
  tests.push({ name, fn });
};

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`)
};

// Test 1: Check environment variables
test("Environment Variables", async () => {
  const required = ["AWS_REGION", "S3_BUCKET_NAME", "COGNITO_USER_POOL_ID", "COGNITO_CLIENT_ID", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  log.info(`All required environment variables are set`);
  return true;
});

// Test 2: S3 Connectivity
test("AWS S3 Bucket Access", async () => {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const bucketName = process.env.S3_BUCKET_NAME;
  const command = new HeadBucketCommand({ Bucket: bucketName });

  try {
    await s3Client.send(command);
    log.info(`S3 bucket '${bucketName}' is accessible`);
    return true;
  } catch (error) {
    throw new Error(`Cannot access S3 bucket: ${error.message}`);
  }
});

// Test 3: PostgreSQL/RDS Connectivity
test("PostgreSQL Database Connection", async () => {
  const pool = new pg.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000
  });

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT current_timestamp;");
    client.release();
    log.info(`PostgreSQL connected to '${process.env.DB_NAME}' at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    await pool.end();
    return true;
  } catch (error) {
    await pool.end();
    throw new Error(`Cannot connect to PostgreSQL: ${error.message}`);
  }
});

// Test 4: Cognito Configuration Validation
test("AWS Cognito Configuration", async () => {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const region = process.env.COGNITO_REGION;

  // Validate format
  if (!/^[a-z]{2}-[a-z]+-\d_[A-Za-z0-9]+$/.test(userPoolId)) {
    throw new Error(`Invalid COGNITO_USER_POOL_ID format: ${userPoolId}`);
  }

  if (!clientId || clientId.length < 10) {
    throw new Error(`Invalid COGNITO_CLIENT_ID: ${clientId}`);
  }

  log.info(`Cognito User Pool: ${userPoolId} (${region})`);
  log.info(`Cognito Client ID: ${clientId.substring(0, 5)}...${clientId.substring(clientId.length - 5)}`);

  return true;
});

// Test 5: Cognito JWKS Endpoint
test("Cognito JWKS Endpoint", async () => {
  const region = process.env.COGNITO_REGION;
  const userPoolId = process.env.COGNITO_USER_POOL_ID;

  return new Promise((resolve, reject) => {
    const url = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

    https
      .get(url, (res) => {
        if (res.statusCode === 200) {
          log.info(`Cognito JWKS endpoint is reachable`);
          resolve(true);
        } else {
          reject(new Error(`Cognito JWKS endpoint returned status ${res.statusCode}`));
        }
      })
      .on("error", (error) => {
        reject(new Error(`Cannot reach Cognito JWKS endpoint: ${error.message}`));
      });
  });
});

// Run all tests
const runTests = async () => {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║          AWS Configuration Verification Report             ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  for (const { name, fn } of tests) {
    process.stdout.write(`Testing: ${name}... `);
    try {
      await fn();
      console.log("✓");
      passedTests++;
    } catch (error) {
      console.log("✗");
      log.error(error.message);
      failedTests++;
    }
  }

  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log(`║                    Test Results                           ║`);
  console.log(`║  Passed: ${passedTests}/${tests.length}`.padEnd(61) + "║");
  console.log(`║  Failed: ${failedTests}/${tests.length}`.padEnd(61) + "║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  if (failedTests > 0) {
    console.log("❌ Configuration verification failed. Please check your AWS credentials and services.\n");
    process.exit(1);
  } else {
    console.log("✅ All AWS configurations are working correctly!\n");
    process.exit(0);
  }
};

runTests().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
