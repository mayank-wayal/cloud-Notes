import { Router } from "express";
import { createNote, deleteNote, downloadNote, getNote, listNotes, previewNote, updateNote, uploadNote } from "../controllers/note.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { handleMulterError, upload } from "../middleware/upload.middleware.js";
import { validateCreateNote, validateNoteId, validateUpdateNote, validateUpload } from "../middleware/validate.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(listNotes));
router.post("/create", validateCreateNote, asyncHandler(createNote));
router.post("/upload", upload.single("file"), handleMulterError, validateUpload, asyncHandler(uploadNote));
router.get("/download/:id", validateNoteId, asyncHandler(downloadNote));
router.get("/:id/preview", validateNoteId, asyncHandler(previewNote));
router.get("/:id", validateNoteId, asyncHandler(getNote));
router.put("/:id", validateNoteId, validateUpdateNote, asyncHandler(updateNote));
router.delete("/:id", validateNoteId, asyncHandler(deleteNote));

export default router;
