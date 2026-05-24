import {
  confirmResetPassword,
  confirmSignUp,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  resetPassword,
  signIn,
  signOut,
  signUp
} from "aws-amplify/auth";
import type {
  AuthNextStep,
  AuthSession,
  ConfirmSignupPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User
} from "@/types/auth";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  return fallback;
};

const isAlreadySignedInError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("already") && message.toLowerCase().includes("signed in");
};

const getSessionToken = async () => {
  const session = await fetchAuthSession();
  return session.tokens?.accessToken?.toString() || "";
};

const getSessionUser = async (): Promise<User> => {
  const [currentUser, attributes] = await Promise.all([getCurrentUser(), fetchUserAttributes()]);
  const email = attributes.email || currentUser.signInDetails?.loginId || currentUser.username;
  const name = attributes.name || email.split("@")[0];

  return {
    id: currentUser.userId,
    email,
    name,
    created_at: ""
  };
};

export const getCurrentSession = async (): Promise<AuthSession | null> => {
  try {
    const [token, user] = await Promise.all([getSessionToken(), getSessionUser()]);
    if (!token) return null;
    return { token, user };
  } catch {
    return null;
  }
};

export const hasCurrentSession = async () => Boolean(await getCurrentSession());

export const register = async (payload: RegisterPayload): Promise<AuthSession | AuthNextStep> => {
  try {
    const existingSession = await getCurrentSession();
    if (existingSession) return existingSession;

    const result = await signUp({
      username: payload.email,
      password: payload.password,
      options: {
        userAttributes: {
          email: payload.email,
          name: payload.name.trim() || payload.email.split("@")[0]
        }
      }
    });

    if (!result.isSignUpComplete) {
      return {
        status: "CONFIRM_SIGN_UP",
        email: payload.email
      };
    }

    return login({ email: payload.email, password: payload.password });
  } catch (error) {
    if (isAlreadySignedInError(error)) {
      const session = await getCurrentSession();
      if (session) return session;
    }
    throw new Error(getErrorMessage(error, "Registration failed"));
  }
};

export const confirmSignup = async ({ email, code }: ConfirmSignupPayload) => {
  try {
    if (await hasCurrentSession()) return;
    await confirmSignUp({ username: email, confirmationCode: code });
  } catch (error) {
    if (isAlreadySignedInError(error)) return;
    throw new Error(getErrorMessage(error, "Email verification failed"));
  }
};

export const login = async (payload: LoginPayload): Promise<AuthSession> => {
  try {
    const existingSession = await getCurrentSession();
    if (existingSession) return existingSession;

    const result = await signIn({
      username: payload.email,
      password: payload.password
    });

    if (!result.isSignedIn && result.nextStep.signInStep === "CONFIRM_SIGN_UP") {
      throw new Error("Please verify your email before signing in.");
    }

    const [token, user] = await Promise.all([getSessionToken(), getSessionUser()]);
    return { token, user };
  } catch (error) {
    if (isAlreadySignedInError(error)) {
      const session = await getCurrentSession();
      if (session) return session;
    }
    throw new Error(getErrorMessage(error, "Login failed"));
  }
};

export const requestPasswordReset = async ({ email }: ForgotPasswordPayload): Promise<AuthNextStep> => {
  try {
    await resetPassword({ username: email });
    return { status: "RESET_PASSWORD", email };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Password reset failed"));
  }
};

export const submitPasswordReset = async ({ email, code, password }: ResetPasswordPayload) => {
  try {
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword: password
    });
  } catch (error) {
    throw new Error(getErrorMessage(error, "Password reset confirmation failed"));
  }
};

export const logout = async () => {
  try {
    await signOut();
  } catch {
    // Treat logout as successful when Cognito has already cleared or lost the session.
  }
};
