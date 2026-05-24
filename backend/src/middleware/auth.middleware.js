import { CognitoJwtVerifier } from "aws-jwt-verify";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

const verifier = CognitoJwtVerifier.create({
  userPoolId: env.cognitoUserPoolId,
  tokenUse: "access",
  clientId: env.cognitoClientId
});

const toAuthError = (error) => {
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

  return error;
};

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
