import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";
import { logS3BucketConnectivity } from "./services/s3.service.js";
import { hydrateAuthVerifier } from "./middleware/auth.middleware.js";

const server = app.listen(env.port, async () => {
  console.log(`CloudNotes API listening on port ${env.port}`);

  try {
    await hydrateAuthVerifier();
    console.log("Cognito JWKS cache hydrated");
  } catch (error) {
    console.warn(`Unable to hydrate Cognito JWKS cache: ${error.message}`);
  }

  if (env.s3ConnectivityCheck) {
    void logS3BucketConnectivity();
  }
});

const shutdown = async () => {
  console.log("Shutting down CloudNotes API");
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
