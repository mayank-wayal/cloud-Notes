import { Router } from "express";
import { createNote, deleteNote, downloadNote, getNote, listNotes, previewNote, updateNote, uploadNote } from "../controllers/note.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { handleMulterError, upload } from "../middleware/upload.middleware.js";
import { validateCreateNote, validateNoteId, validateUpdateNote, validateUpload } from "../middleware/validate.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", listNotes);
router.post("/create", validateCreateNote, createNote);
router.post("/upload", upload.single("file"), handleMulterError, validateUpload, uploadNote);
router.get("/download/:id", validateNoteId, downloadNote);
router.get("/:id/preview", validateNoteId, previewNote);
router.get("/:id", validateNoteId, getNote);
router.put("/:id", validateNoteId, validateUpdateNote, updateNote);
router.delete("/:id", validateNoteId, deleteNote);

export default router;
