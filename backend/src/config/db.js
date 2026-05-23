import pg from "pg";
import { env } from "./env.js";

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

export const query = (text, params) => pool.query(text, params);
