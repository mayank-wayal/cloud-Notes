import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║         Current Environment Configuration Summary          ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

const config = {
  "Environment": process.env.NODE_ENV,
  "Backend Port": process.env.PORT,
  "Frontend URL": process.env.CLIENT_URL,
  "": "",
  "AWS Region": process.env.AWS_REGION,
  "S3 Bucket": process.env.S3_BUCKET_NAME,
  "S3 Region": process.env.S3_BUCKET_REGION,
  "AWS Access Key": process.env.AWS_ACCESS_KEY_ID ? "✓ Set" : "✗ Missing",
  "AWS Secret Key": process.env.AWS_SECRET_ACCESS_KEY ? "✓ Set" : "✗ Missing",
  " ": "",
  "Cognito Region": process.env.COGNITO_REGION,
  "Cognito User Pool ID": process.env.COGNITO_USER_POOL_ID,
  "Cognito Client ID": process.env.COGNITO_CLIENT_ID ? "✓ Set" : "✗ Missing",
  "Cognito Client Secret": process.env.COGNITO_CLIENT_SECRET ? "✓ Set" : "✗ Missing",
  "  ": "",
  "Database Host": process.env.DB_HOST,
  "Database Port": process.env.DB_PORT,
  "Database Name": process.env.DB_NAME,
  "Database User": process.env.DB_USER ? "✓ Set" : "✗ Missing",
  "Database Password": process.env.DB_PASSWORD ? "✓ Set" : "✗ Missing",
  "Database SSL": process.env.DATABASE_SSL,
  "   ": "",
  "JWT Secret": process.env.JWT_SECRET ? "✓ Set" : "✗ Missing",
  "Cognito JWKS Timeout": process.env.COGNITO_JWKS_TIMEOUT_MS + "ms",
};

Object.entries(config).forEach(([key, value]) => {
  if (key === "" || key === " " || key === "  " || key === "   ") {
    console.log("");
  } else {
    console.log(`  ${key.padEnd(30)}: ${value}`);
  }
});

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║  To fix S3 access, ensure your AWS credentials have:      ║");
console.log("║  - s3:GetObject permission on bucket                      ║");
console.log("║  - s3:PutObject permission on bucket                      ║");
console.log("║  - s3:HeadBucket permission                               ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");
