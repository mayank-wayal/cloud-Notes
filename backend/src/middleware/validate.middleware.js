import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

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

  if (!req.file.buffer?.length) {
    return next(new AppError("Uploaded file is empty", 400));
  }

  req.body.title = title;
  next();
};

const validateTags = (tags) => Array.isArray(tags) && tags.every((tag) => typeof tag === "string" && tag.length <= 40);

export const validateCreateNote = (req, res, next) => {
  const errors = [];
  const title = req.body.title?.trim();

  if (!title || title.length > 120) errors.push("Title is required and must be under 120 characters");
  if (typeof req.body.content !== "string") errors.push("Content must be text");
  if (typeof req.body.content === "string" && req.body.content.length > env.maxNoteContentChars) errors.push("Content is too large");
  if (req.body.tags !== undefined && !validateTags(req.body.tags)) errors.push("Tags must be short text values");

  if (errors.length) return next(new AppError("Validation failed", 400, errors));

  req.body.title = title;
  req.body.content = req.body.content || "";
  next();
};

export const validateUpdateNote = (req, res, next) => {
  const errors = [];

  if (req.body.title !== undefined) {
    const title = req.body.title?.trim();
    if (!title || title.length > 120) errors.push("Title must be under 120 characters");
    req.body.title = title;
  }

  if (req.body.content !== undefined && typeof req.body.content !== "string") errors.push("Content must be text");
  if (typeof req.body.content === "string" && req.body.content.length > env.maxNoteContentChars) errors.push("Content is too large");
  if (req.body.tags !== undefined && !validateTags(req.body.tags)) errors.push("Tags must be short text values");
  if (req.body.isArchived !== undefined && typeof req.body.isArchived !== "boolean") errors.push("isArchived must be true or false");
  if (req.body.isPinned !== undefined && typeof req.body.isPinned !== "boolean") errors.push("isPinned must be true or false");

  if (errors.length) return next(new AppError("Validation failed", 400, errors));
  next();
};

export const validateNoteId = (req, res, next) => {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuid.test(req.params.id)) {
    return next(new AppError("Invalid note id", 400));
  }

  next();
};
