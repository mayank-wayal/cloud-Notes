import { createNote, deleteNoteByUser, findNoteByUser, listNotesByUser } from "../models/note.model.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { buildS3Key, createDownloadUrl, deleteFileFromS3, uploadFileToS3 } from "./s3.service.js";

export const getUserNotes = async (userId) => listNotesByUser(userId);

export const uploadUserNote = async ({ userId, title, file }) => {
  const s3Key = buildS3Key({ userId, originalName: file.originalname });

  await uploadFileToS3({ key: s3Key, file });

  try {
    return await createNote({
      userId,
      title,
      s3Key,
      fileSize: file.size
    });
  } catch (error) {
    await deleteFileFromS3(s3Key);
    throw error;
  }
};

export const removeUserNote = async ({ userId, noteId }) => {
  const deleted = await deleteNoteByUser({ userId, noteId });

  if (!deleted) {
    throw new AppError("Note not found", 404);
  }

  await deleteFileFromS3(deleted.s3_key);
  return deleted;
};

export const getUserNoteDownload = async ({ userId, noteId }) => {
  const note = await findNoteByUser({ userId, noteId });

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  const url = await createDownloadUrl({ key: note.s3_key, fileName: note.title });

  return {
    url,
    expiresInSeconds: env.s3SignedUrlExpiresSeconds
  };
};
