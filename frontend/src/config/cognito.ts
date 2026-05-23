import { Amplify } from "@aws-amplify/core";

const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
      region: process.env.NEXT_PUBLIC_COGNITO_REGION || "us-east-1"
    }
  }
};

Amplify.configure(cognitoConfig);

export default cognitoConfig;
