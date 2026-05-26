import { CognitoJwtVerifier } from "aws-jwt-verify";
import { FetchError } from "aws-jwt-verify/error";
import { SimpleFetcher } from "aws-jwt-verify/https";
import { SimpleJwksCache } from "aws-jwt-verify/jwk";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

const verifier = CognitoJwtVerifier.create(
  {
    userPoolId: env.cognitoUserPoolId,
    tokenUse: "access",
    clientId: env.cognitoClientId
  },
  {
    jwksCache: new SimpleJwksCache({
      fetcher: new SimpleFetcher({
        defaultRequestOptions: {
          responseTimeout: env.cognitoJwksTimeoutMs
        }
      })
    })
  }
);

const toAuthError = (error) => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof FetchError) {
    return new AppError("Authentication service is temporarily unavailable", 503);
  }

  if (error.name === "NotBeforeError" || error.name === "TokenExpiredError") {
    return new AppError("Token has expired", 401);
  }

  if (
    error.name?.includes("Jwt") ||
    error.name?.includes("Cognito") ||
    error.message?.includes("Token") ||
    error.message?.includes("Invalid")
  ) {
    return new AppError("Invalid authentication token", 401);
  }

  return new AppError("Invalid authentication token", 401);
};

export const hydrateAuthVerifier = () => verifier.hydrate();

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Authentication token is required", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifier.verify(token);

    req.user = {
      id: payload.sub,
      email: payload.email || payload.username || payload["cognito:username"] || payload.sub,
      name: payload.name || payload.username || payload["cognito:username"] || "CloudNotes user",
      tokenUse: payload.token_use
    };

    next();
  } catch (error) {
    next(toAuthError(error));
  }
};
