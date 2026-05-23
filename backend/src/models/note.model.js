import { query } from "../config/db.js";

export const createNote = async ({ userId, title, s3Key, fileSize }) => {
  const result = await query(
    `INSERT INTO notes (user_id, title, s3_key, file_size)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, title, s3_key, file_size, created_at`,
    [userId, title, s3Key, fileSize]
  );

  return result.rows[0];
};

export const listNotesByUser = async (userId) => {
  const result = await query(
    `SELECT id, title, file_size, created_at
     FROM notes
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
};

export const findNoteByUser = async ({ noteId, userId }) => {
  const result = await query(
    `SELECT id, user_id, title, s3_key, file_size, created_at
     FROM notes
     WHERE id = $1 AND user_id = $2`,
    [noteId, userId]
  );

  return result.rows[0] || null;
};

export const deleteNoteByUser = async ({ noteId, userId }) => {
  const result = await query(
    `DELETE FROM notes
     WHERE id = $1 AND user_id = $2
     RETURNING id, s3_key`,
    [noteId, userId]
  );

  return result.rows[0] || null;
};
