export type Note = {
  id: string;
  title: string;
  note_type: "file" | "note";
  content?: string;
  tags?: string[];
  is_archived?: boolean;
  is_pinned?: boolean;
  file_name?: string | null;
  content_type?: string | null;
  file_size: number;
  created_at: string;
  updated_at?: string;
};

export type NotePreview = {
  success: true;
  previewUrl: string;
  expiresInSeconds: number;
  note: Note;
};
