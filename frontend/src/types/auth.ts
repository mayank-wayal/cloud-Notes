export type User = {
  id: string;
  name: string;
  email: string;
  created_at?: string;
};

export type AuthSession = {
  token: string;
  user: User;
};

export type AuthNextStep =
  | {
      status: "CONFIRM_SIGN_UP";
      email: string;
    }
  | {
      status: "RESET_PASSWORD";
      email: string;
    };

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name: string;
};

export type ConfirmSignupPayload = {
  email: string;
  code: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  code: string;
  password: string;
};
