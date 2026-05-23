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

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name: string;
};
