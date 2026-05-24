import { Amplify } from "aws-amplify";

const isPlaceholder = (value: string) => !value || value.includes("replace_with") || value.includes("replace_me");

const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
      region: process.env.NEXT_PUBLIC_COGNITO_REGION || "us-east-1"
    }
  }
};

export const isCognitoConfigured =
  !isPlaceholder(cognitoConfig.Auth.Cognito.userPoolId) &&
  !isPlaceholder(cognitoConfig.Auth.Cognito.userPoolClientId);

if (isCognitoConfigured) {
  Amplify.configure(cognitoConfig);
} else if (typeof window !== "undefined") {
  console.warn("CloudNotes Cognito is not configured. Add NEXT_PUBLIC_COGNITO_* values to frontend/.env.local.");
}

export default cognitoConfig;
