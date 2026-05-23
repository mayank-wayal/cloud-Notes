import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import { createUser, findUserByEmail } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/tokens.js";

export const registerUser = async ({ name, email, password }) => {
  const existing = await findUserByEmail(email);

  if (existing) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const user = await createUser({ name: name.trim(), email, passwordHash });

  return {
    user,
    token: signToken(user)
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at
  };

  return {
    user: safeUser,
    token: signToken(safeUser)
  };
};
