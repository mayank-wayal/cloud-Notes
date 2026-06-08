import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

console.log("\n🔍 Startup Configuration Test\n");

// Test 1: Environment validation
console.log("✓ Loading environment variables...");
const required = ["AWS_REGION", "S3_BUCKET_NAME", "COGNITO_USER_POOL_ID", "COGNITO_CLIENT_ID", "JWT_SECRET"];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.log("❌ Missing:", missing.join(", "));
  process.exit(1);
} else {
  console.log("✓ All required variables found");
}

// Test 2: Database URL validation
console.log("\n✓ Validating database configuration...");
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
if (!hasDatabaseUrl && (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD)) {
  console.log("❌ Database configuration invalid");
  process.exit(1);
} else {
  console.log("✓ Database configuration valid");
}

// Test 3: Cognito validation
console.log("\n✓ Validating Cognito configuration...");
if (!/^[a-z]{2}-[a-z]+-\d_[A-Za-z0-9]+$/.test(process.env.COGNITO_USER_POOL_ID)) {
  console.log("❌ Invalid Cognito User Pool ID format");
  process.exit(1);
} else {
  console.log("✓ Cognito User Pool ID format valid");
}

// Test 4: Import app module
console.log("\n✓ Testing application import...");
try {
  const app = await import("../src/app.js");
  console.log("✓ App module imports successfully");
} catch (error) {
  console.log("❌ App import error:", error.message);
  process.exit(1);
}

console.log("\n✅ All startup checks passed! Ready to run 'npm run dev'\n");
process.exit(0);
