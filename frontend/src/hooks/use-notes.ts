"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiError } from "@/services/api";
import { deleteNote, fetchNotes, getDownloadUrl, uploadNote } from "@/services/notes";
import type { Note } from "@/types/note";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setNotes(await fetchNotes());
    } catch (loadError) {
      setError(getApiError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const upload = useCallback(async (input: { title: string; file: File; onProgress?: (progress: number) => void }) => {
    const note = await uploadNote(input);
    setNotes((current) => [note, ...current]);
    return note;
  }, []);

  const remove = useCallback(
    async (noteId: string) => {
      const previous = notes;
      setNotes((current) => current.filter((note) => note.id !== noteId));

      try {
        await deleteNote(noteId);
      } catch (deleteError) {
        setNotes(previous);
        throw deleteError;
      }
    },
    [notes]
  );

  const download = useCallback(async (noteId: string) => {
    const url = await getDownloadUrl(noteId);
    window.location.assign(url);
  }, []);

  const stats = useMemo(() => {
    const storage = notes.reduce((sum, note) => sum + Number(note.file_size), 0);
    return {
      totalNotes: notes.length,
      storage,
      latest: notes[0]?.created_at
    };
  }, [notes]);

  return { notes, loading, error, setError, loadNotes, upload, remove, download, stats };
}
