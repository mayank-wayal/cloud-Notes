import { CognitoJwtVerifier } from "aws-jwt-verify";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

const verifier = CognitoJwtVerifier.create({
  userPoolId: env.cognitoUserPoolId,
  tokenUse: "access",
  clientId: env.cognitoClientId
});

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Authentication token is required", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifier.verify(token);

    // Extract user info from Cognito token
    req.user = {
      id: payload.sub,        // Cognito user ID (UUID)
      email: payload.email,
      name: payload.name || payload.email
    };

    next();
  } catch (error) {
    if (error.name === "NotBeforeError" || error.name === "TokenExpiredError") {
      next(new AppError("Token has expired", 401));
    } else if (error.message?.includes("Token is not valid") || error.message?.includes("Invalid")) {
      next(new AppError("Invalid token", 401));
    } else {
      next(error);
    }
  }
};
