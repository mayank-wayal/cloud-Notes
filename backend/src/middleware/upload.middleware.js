import multer from "multer";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024
  }
});

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return next(new AppError(err.message, 400));
  }

  next(err);
};
