import { createFileNote, createTextNote, deleteNoteByUser, findNoteById, listNotesByUser, updateNoteByUser } from "../models/note.model.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { buildS3Key, createDownloadUrl, createPreviewUrl, deleteFileFromS3, uploadFileToS3 } from "./s3.service.js";

export const getUserNotes = async (userId) => listNotesByUser(userId);

const normalizeTags = (tags = []) =>
  [...new Set(tags.map((tag) => `${tag}`.trim().toLowerCase()).filter(Boolean))].slice(0, 12);

const normalizeTitle = (title) => {
  const nextTitle = `${title || ""}`.trim();
  return nextTitle || "Untitled note";
};

export const uploadUserNote = async ({ userId, title, file }) => {
  const s3Key = buildS3Key({ userId, originalName: file.originalname });

  console.log("[notes] Generated S3 object key", {
    userId,
    bucket: env.s3BucketName,
    region: env.awsRegion,
    key: s3Key
  });

  await uploadFileToS3({ key: s3Key, file });

  try {
    const note = await createFileNote({
      userId,
      title: normalizeTitle(title),
      s3Key,
      fileName: file.originalname,
      contentType: file.mimetype,
      fileSize: file.size
    });

    return {
      note,
      key: s3Key
    };
  } catch (error) {
    console.error("[notes] Failed to save uploaded note metadata; deleting S3 object", {
      userId,
      key: s3Key
    });
    console.error(error);
    await deleteFileFromS3(s3Key);
    throw error;
  }
};

export const createUserTextNote = async ({ userId, title, content = "", tags = [], isPinned = false }) => {
  const note = await createTextNote({
    userId,
    title: normalizeTitle(title),
    content,
    tags: normalizeTags(tags),
    isPinned: Boolean(isPinned)
  });

  return note;
};

const getOwnedNote = async ({ userId, noteId }) => {
  const note = await findNoteById(noteId);

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  if (note.user_id !== userId) {
    throw new AppError("You do not have access to this item", 403);
  }

  return note;
};

export const removeUserNote = async ({ userId, noteId }) => {
  const deleted = await deleteNoteByUser({ userId, noteId });

  if (!deleted) {
    throw new AppError("Note not found", 404);
  }

  if (deleted.note_type === "file" && deleted.s3_key) {
    await deleteFileFromS3(deleted.s3_key);
  }

  return deleted;
};

export const getUserNoteById = async ({ userId, noteId }) => {
  return getOwnedNote({ userId, noteId });
};

export const updateUserTextNote = async ({ userId, noteId, title, content, tags, isArchived, isPinned }) => {
  const existing = await getUserNoteById({ userId, noteId });

  if (existing.note_type !== "note") {
    throw new AppError("Uploaded files cannot be edited as text notes", 400);
  }

  const note = await updateNoteByUser({
    userId,
    noteId,
    title: title === undefined ? undefined : normalizeTitle(title),
    content,
    tags: tags === undefined ? undefined : normalizeTags(tags),
    isArchived,
    isPinned
  });

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  return note;
};

export const getUserNoteDownload = async ({ userId, noteId }) => {
  const note = await getOwnedNote({ userId, noteId });

  if (note.note_type !== "file" || !note.s3_key) {
    throw new AppError("Text notes do not have downloadable files", 400);
  }

  const url = await createDownloadUrl({ key: note.s3_key, fileName: note.file_name || note.title });

  return {
    success: true,
    url,
    expiresInSeconds: env.s3SignedUrlExpiresSeconds
  };
};

export const getUserNotePreview = async ({ userId, noteId }) => {
  const note = await getOwnedNote({ userId, noteId });

  if (note.note_type !== "file" || !note.s3_key) {
    throw new AppError("Text notes are previewed directly in the app", 400);
  }
  const previewUrl = await createPreviewUrl({
    key: note.s3_key,
    fileName: note.file_name || note.title,
    contentType: note.content_type
  });

  return {
    success: true,
    previewUrl,
    expiresInSeconds: env.s3SignedUrlExpiresSeconds,
    note: {
      id: note.id,
      title: note.title,
      file_name: note.file_name,
      content_type: note.content_type,
      file_size: note.file_size,
      created_at: note.created_at
    }
  };
};
