import { Router } from "express";
import { deleteNote, downloadNote, listNotes, uploadNote } from "../controllers/note.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { handleMulterError, upload } from "../middleware/upload.middleware.js";
import { validateNoteId, validateUpload } from "../middleware/validate.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", listNotes);
router.post("/upload", upload.single("file"), handleMulterError, validateUpload, uploadNote);
router.delete("/:id", validateNoteId, deleteNote);
router.get("/download/:id", validateNoteId, downloadNote);

export default router;
