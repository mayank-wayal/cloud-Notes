import { AppError } from "../utils/AppError.js";

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) errors.push("Name must be at least 2 characters");
  if (!email || !isEmail(email)) errors.push("A valid email is required");
  if (!password || password.length < 8) errors.push("Password must be at least 8 characters");

  if (errors.length) return next(new AppError("Validation failed", 400, errors));
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isEmail(email)) errors.push("A valid email is required");
  if (!password) errors.push("Password is required");

  if (errors.length) return next(new AppError("Validation failed", 400, errors));
  next();
};

export const validateUpload = (req, res, next) => {
  const title = req.body.title?.trim();

  if (!title || title.length > 120) {
    return next(new AppError("Title is required and must be under 120 characters", 400));
  }

  if (!req.file) {
    return next(new AppError("A file is required", 400));
  }

  req.body.title = title;
  next();
};

export const validateNoteId = (req, res, next) => {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuid.test(req.params.id)) {
    return next(new AppError("Invalid note id", 400));
  }

  next();
};
