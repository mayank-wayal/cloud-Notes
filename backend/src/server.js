import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";
import { logS3BucketConnectivity } from "./services/s3.service.js";

const server = app.listen(env.port, () => {
  console.log(`CloudNotes API listening on port ${env.port}`);
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
