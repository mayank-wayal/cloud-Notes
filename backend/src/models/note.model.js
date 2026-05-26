import { query } from "../config/db.js";

const noteFields = `
  id, user_id, title, s3_key, note_type, content, tags, is_archived, is_pinned,
  file_name, content_type, file_size, created_at, updated_at
`;

export const createFileNote = async ({ userId, title, s3Key, fileName, contentType, fileSize }) => {
  const result = await query(
    `INSERT INTO notes (user_id, title, s3_key, note_type, file_name, content_type, file_size)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${noteFields}`,
    [userId, title, s3Key, "file", fileName, contentType, fileSize]
  );

  return result.rows[0];
};

export const createTextNote = async ({ userId, title, content, tags, isPinned }) => {
  const result = await query(
    `INSERT INTO notes (user_id, title, note_type, content, tags, is_pinned, file_size)
     VALUES ($1, $2, 'note', $3, $4, $5, 0)
     RETURNING ${noteFields}`,
    [userId, title, content, tags, isPinned]
  );

  return result.rows[0];
};

export const listNotesByUser = async (userId) => {
  const result = await query(
    `SELECT ${noteFields}
     FROM notes
     WHERE user_id = $1
     ORDER BY is_pinned DESC, updated_at DESC, created_at DESC`,
    [userId]
  );

  return result.rows;
};

export const findNoteByUser = async ({ noteId, userId }) => {
  const result = await query(
    `SELECT ${noteFields}
     FROM notes
     WHERE id = $1 AND user_id = $2`,
    [noteId, userId]
  );

  return result.rows[0] || null;
};

export const findNoteById = async (noteId) => {
  const result = await query(
    `SELECT ${noteFields}
     FROM notes
     WHERE id = $1`,
    [noteId]
  );

  return result.rows[0] || null;
};

export const updateNoteByUser = async ({ noteId, userId, title, content, tags, isArchived, isPinned }) => {
  const result = await query(
    `UPDATE notes
     SET title = COALESCE($3, title),
         content = COALESCE($4, content),
         tags = COALESCE($5, tags),
         is_archived = COALESCE($6, is_archived),
         is_pinned = COALESCE($7, is_pinned),
         updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND note_type = 'note'
     RETURNING ${noteFields}`,
    [noteId, userId, title, content, tags, isArchived, isPinned]
  );

  return result.rows[0] || null;
};

export const deleteNoteByUser = async ({ noteId, userId }) => {
  const result = await query(
    `DELETE FROM notes
     WHERE id = $1 AND user_id = $2
     RETURNING id, s3_key, note_type`,
    [noteId, userId]
  );

  return result.rows[0] || null;
};
