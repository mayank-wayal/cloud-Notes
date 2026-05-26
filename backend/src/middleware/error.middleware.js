import { env } from "../config/env.js";

export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  const responseStatus = res.statusCode >= 400 ? res.statusCode : 500;
  const statusCode = err.statusCode || responseStatus;
  const hideServerDetails = env.nodeEnv === "production" && statusCode >= 500;

  res.status(statusCode).json({
    success: false,
    message: hideServerDetails ? "Internal server error" : err.message || "Internal server error",
    details: hideServerDetails ? undefined : err.details || undefined,
    stack: env.nodeEnv === "production" ? undefined : err.stack
  });
};
