import multer from "multer";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const storage = multer.memoryStorage();
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "text/markdown",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/zip"
]);

export const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(new AppError("Unsupported file type", 400));
  }
});

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("[upload] Multer error", {
      code: err.code,
      field: err.field,
      message: err.message
    });
    console.error(err);
    return next(new AppError(err.message, 400));
  }

  if (err) {
    console.error("[upload] File middleware error");
    console.error(err);
  }

  next(err);
};
