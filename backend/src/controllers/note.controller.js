import { getUserNoteDownload, getUserNotes, removeUserNote, uploadUserNote } from "../services/note.service.js";

export const listNotes = async (req, res, next) => {
  try {
    const notes = await getUserNotes(req.user.id);
    res.json({ notes });
  } catch (error) {
    next(error);
  }
};

export const uploadNote = async (req, res, next) => {
  try {
    const note = await uploadUserNote({
      userId: req.user.id,
      title: req.body.title,
      file: req.file
    });

    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    await removeUserNote({ userId: req.user.id, noteId: req.params.id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const downloadNote = async (req, res, next) => {
  try {
    const payload = await getUserNoteDownload({ userId: req.user.id, noteId: req.params.id });
    res.json(payload);
  } catch (error) {
    next(error);
  }
};
