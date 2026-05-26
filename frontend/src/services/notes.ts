import { api } from "./api";
import type { Note, NotePreview } from "@/types/note";

type UploadNoteInput = {
  title: string;
  file: File;
  onProgress?: (progress: number) => void;
};

export type CreateTextNoteInput = {
  title: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
};

export type UpdateTextNoteInput = Partial<CreateTextNoteInput> & {
  isArchived?: boolean;
};

export const fetchNotes = async () => {
  const { data } = await api.get<{ notes: Note[] }>("/notes");
  return data.notes;
};

export const fetchNote = async (noteId: string) => {
  const { data } = await api.get<{ success: boolean; note: Note }>(`/notes/${noteId}`);
  return data.note;
};

export const createTextNote = async (input: CreateTextNoteInput) => {
  const { data } = await api.post<{ success: boolean; note: Note }>("/notes/create", input);
  return data.note;
};

export const updateTextNote = async (noteId: string, input: UpdateTextNoteInput) => {
  const { data } = await api.put<{ success: boolean; note: Note }>(`/notes/${noteId}`, input);
  return data.note;
};

export const uploadNote = async ({ title, file, onProgress }: UploadNoteInput) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);

  const { data } = await api.post<{ success: boolean; note: Note }>("/notes/upload", formData, {
    onUploadProgress: (event) => {
      if (!event.total) return;
      onProgress?.(Math.round((event.loaded * 100) / event.total));
    }
  });

  return data.note;
};

export const deleteNote = async (noteId: string) => {
  await api.delete(`/notes/${noteId}`);
};

export const getDownloadUrl = async (noteId: string) => {
  const { data } = await api.get<{ success?: boolean; url: string }>(`/notes/download/${noteId}`);
  return data.url;
};

export const getPreviewUrl = async (noteId: string) => {
  const { data } = await api.get<NotePreview>(`/notes/${noteId}/preview`);
  return data;
};
