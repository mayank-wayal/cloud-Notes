import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, "../database/schema.sql");
const databaseUrl = process.env.DATABASE_URL;
const databaseConnectRetries = Number(process.env.DATABASE_CONNECT_RETRIES || 3);

if (!databaseUrl) {
  console.error("DATABASE_URL is required to run migrations.");
  process.exit(1);
}

if (!Number.isInteger(databaseConnectRetries) || databaseConnectRetries < 0) {
  console.error("DATABASE_CONNECT_RETRIES must be a non-negative integer.");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false, servername: new URL(databaseUrl).hostname } : false,
  connectionTimeoutMillis: Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS || 10000)
});
const retryableConnectionCodes = new Set(["ECONNRESET", "EPIPE", "EPROTO", "ETIMEDOUT"]);
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const getClient = async () => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await pool.connect();
    } catch (error) {
      if (!retryableConnectionCodes.has(error.code) || attempt >= databaseConnectRetries) {
        throw error;
      }

      console.warn(`Database connection failed; retrying (${attempt + 1}/${databaseConnectRetries}).`);
      await sleep(200 * (attempt + 1));
    }
  }
};

try {
  const schema = await fs.readFile(schemaPath, "utf8");
  const client = await getClient();

  try {
    await client.query(schema);
  } finally {
    client.release();
  }

  console.log("Database schema applied successfully.");
} catch (error) {
  console.error("Database migration failed.");
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
