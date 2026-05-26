import { createUserTextNote, getUserNoteById, getUserNoteDownload, getUserNotePreview, getUserNotes, removeUserNote, updateUserTextNote, uploadUserNote } from "../services/note.service.js";

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
    console.log("[upload] Incoming upload request", {
      userId: req.user?.id,
      title: req.body?.title,
      hasFile: Boolean(req.file),
      fileName: req.file?.originalname,
      contentType: req.file?.mimetype,
      size: req.file?.size
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "A file is required"
      });
    }

    const { note, key } = await uploadUserNote({
      userId: req.user.id,
      title: req.body.title,
      file: req.file
    });

    res.status(201).json({
      success: true,
      key,
      message: "Upload successful",
      note
    });
  } catch (error) {
    console.error("[upload] Upload failed", {
      userId: req.user?.id,
      errorName: error.name,
      errorMessage: error.message,
      details: error.details
    });
    console.error(error);

    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const note = await createUserTextNote({
      userId: req.user.id,
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags,
      isPinned: req.body.isPinned
    });

    res.status(201).json({
      success: true,
      message: "Note created",
      note
    });
  } catch (error) {
    next(error);
  }
};

export const getNote = async (req, res, next) => {
  try {
    const note = await getUserNoteById({ userId: req.user.id, noteId: req.params.id });
    res.json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await updateUserTextNote({
      userId: req.user.id,
      noteId: req.params.id,
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags,
      isArchived: req.body.isArchived,
      isPinned: req.body.isPinned
    });

    res.json({
      success: true,
      message: "Note saved",
      note
    });
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

export const previewNote = async (req, res, next) => {
  try {
    const payload = await getUserNotePreview({ userId: req.user.id, noteId: req.params.id });
    res.json(payload);
  } catch (error) {
    console.error("[preview] Preview URL generation failed", {
      userId: req.user?.id,
      noteId: req.params.id,
      errorName: error.name,
      errorMessage: error.message,
      details: error.details
    });
    console.error(error);
    next(error);
  }
};
