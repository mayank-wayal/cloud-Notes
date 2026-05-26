import path from "node:path";
import multer from "multer";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const storage = multer.memoryStorage();
const contentTypeByExtension = new Map([
  [".pdf", "application/pdf"],
  [".doc", "application/msword"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  [".xls", "application/vnd.ms-excel"],
  [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  [".ppt", "application/vnd.ms-powerpoint"],
  [".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  [".txt", "text/plain"],
  [".csv", "text/csv"],
  [".md", "text/markdown"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".webp", "image/webp"],
  [".zip", "application/zip"]
]);

export const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const contentType = contentTypeByExtension.get(extension);

    if (contentType) {
      file.mimetype = contentType;
      callback(null, true);
      return;
    }

    callback(new AppError("Unsupported file type. Upload a PDF, document, spreadsheet, presentation, text file, image, or ZIP archive.", 400));
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
