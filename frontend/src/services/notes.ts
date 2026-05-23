import { api } from "./api";
import type { Note } from "@/types/note";

type UploadNoteInput = {
  title: string;
  file: File;
  onProgress?: (progress: number) => void;
};

export const fetchNotes = async () => {
  const { data } = await api.get<{ notes: Note[] }>("/notes");
  return data.notes;
};

export const uploadNote = async ({ title, file, onProgress }: UploadNoteInput) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);

  const { data } = await api.post<{ note: Note }>("/notes/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
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
  const { data } = await api.get<{ url: string }>(`/notes/download/${noteId}`);
  return data.url;
};
