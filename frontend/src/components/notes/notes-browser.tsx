"use client";

import { Grid2X2, List, PenLine, Search, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { NoteCard } from "@/components/notes/note-card";
import { NotesTable } from "@/components/dashboard/notes-table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import type { Note } from "@/types/note";

type NotesBrowserProps = {
  notes: Note[];
  loading: boolean;
  onDownload: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function NotesBrowser({ notes, loading, onDownload, onDelete }: NotesBrowserProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid");
  const filteredNotes = useMemo(
    () => notes.filter((note) => `${note.title} ${note.content || ""} ${(note.tags || []).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())),
    [notes, query]
  );

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Skeleton key={item} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="flex h-11 w-full items-center gap-3 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-slate-500 transition focus-within:border-slate-500 md:max-w-md">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none" placeholder="Search your notes" />
        </label>
        <Tabs
          value={view}
          onChange={setView}
          items={[
            { value: "grid", label: "Grid", icon: Grid2X2 },
            { value: "list", label: "List", icon: List }
          ]}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/editor" className="flex items-center gap-3 rounded-lg border border-indigo-400/15 bg-indigo-500/[0.06] p-4 text-slate-200 transition hover:bg-indigo-500/[0.09]">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-400/15 text-indigo-200">
            <PenLine size={17} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-white">Create note</span>
            <span className="text-xs text-slate-500">Write markdown in the browser</span>
          </span>
        </Link>
        <Link href="/upload" className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/55 p-4 text-slate-200 transition hover:bg-slate-900/70">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-slate-300">
            <UploadCloud size={17} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-white">Upload file</span>
            <span className="text-xs text-slate-500">Add PDFs, docs, and images</span>
          </span>
        </Link>
      </div>

      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent>
            <div className="grid min-h-64 place-items-center text-center">
              <div>
                <h3 className="font-semibold text-white">{notes.length === 0 ? "Your library is empty" : "No notes found"}</h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500">{notes.length === 0 ? "Create a note or upload files and they will appear here together." : "Try a different search term."}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note, index) => (
            <NoteCard key={note.id} note={note} index={index} onDownload={(id) => void onDownload(id)} onDelete={(id) => void onDelete(id)} />
          ))}
        </div>
      ) : (
        <NotesTable notes={filteredNotes} loading={false} onDownload={onDownload} onDelete={onDelete} />
      )}
    </div>
  );
}
