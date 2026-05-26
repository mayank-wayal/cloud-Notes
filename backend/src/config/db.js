import pg from "pg";
import { env } from "./env.js";

const databaseHost = new URL(env.databaseUrl).hostname;
const retryableConnectionCodes = new Set(["ECONNRESET", "EPIPE", "EPROTO", "ETIMEDOUT"]);

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false, servername: databaseHost } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const getClient = async () => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await pool.connect();
    } catch (error) {
      if (!retryableConnectionCodes.has(error.code) || attempt >= env.databaseConnectRetries) {
        throw error;
      }

      await sleep(200 * (attempt + 1));
    }
  }
};

export const query = async (text, params) => {
  const client = await getClient();

  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};
