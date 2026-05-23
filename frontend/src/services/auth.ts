import { signUp, signIn, signOut, fetchAuthSession, getCurrentUser } from "@aws-amplify/auth";
import type { AuthSession, LoginPayload, RegisterPayload, User } from "@/types/auth";

export const register = async (payload: RegisterPayload): Promise<AuthSession> => {
  try {
    await signUp({
      username: payload.email,
      password: payload.password,
      options: {
        userAttributes: {
          email: payload.email,
          name: payload.email.split("@")[0]
        }
      }
    });

    // Auto-confirm in development (in production, user confirms via email)
    // For now, we skip email confirmation for learning purposes
    
    // Attempt to sign in
    await signIn({
      username: payload.email,
      password: payload.password
    });

    const session = await fetchAuthSession();
    const user = await getCurrentUser();

    return {
      user: {
        id: user.userId,
        email: user.username,
        name: payload.email.split("@")[0],
        created_at: new Date().toISOString()
      },
      token: session?.tokens?.accessToken?.toString() || ""
    };
  } catch (error: any) {
    throw new Error(error.message || "Registration failed");
  }
};

export const login = async (payload: LoginPayload): Promise<AuthSession> => {
  try {
    await signIn({
      username: payload.email,
      password: payload.password
    });

    const session = await fetchAuthSession();
    const user = await getCurrentUser();

    return {
      user: {
        id: user.userId,
        email: user.username,
        name: user.username.split("@")[0],
        created_at: new Date().toISOString()
      },
      token: session?.tokens?.accessToken?.toString() || ""
    };
  } catch (error: any) {
    throw new Error(error.message || "Login failed");
  }
};

export const logout = async () => {
  await signOut();
};

export const getCurrentAuthUser = async () => {
  try {
    return await getCurrentUser();
  } catch (error) {
    return null;
  }
};
