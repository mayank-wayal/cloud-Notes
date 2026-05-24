"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Eye, FileText, PenLine, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes, formatDate } from "@/lib/utils";
import type { Note } from "@/types/note";

type NotesTableProps = {
  notes: Note[];
  loading: boolean;
  onDownload: (noteId: string) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
};

export function NotesTable({ notes, loading, onDownload, onDelete }: NotesTableProps) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const filteredNotes = useMemo(() => {
    const nextNotes = notes.filter((note) => `${note.title} ${note.content || ""} ${(note.tags || []).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));

    return nextNotes.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "size") return Number(b.file_size) - Number(a.file_size);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [notes, query, sortBy]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton className="h-6 w-40" />
          <div className="mt-5 space-y-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b-0 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-300">Library</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Recent notes</h2>
          <p className="mt-1 text-sm text-slate-500">{notes.length} workspace item{notes.length === 1 ? "" : "s"} across notes and files</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <label className="flex h-11 w-full items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-950/60 px-3 text-sm text-slate-500 transition focus-within:border-indigo-400/60 md:w-72">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none" placeholder="Search notes" />
          </label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-11 rounded-2xl border border-slate-800/60 bg-slate-950/60 px-3 text-sm text-slate-300 outline-none transition focus:border-indigo-400/60"
            aria-label="Sort notes"
          >
            <option value="newest">Newest</option>
            <option value="title">Title</option>
            <option value="size">Largest</option>
          </select>
        </div>
      </CardHeader>

      {filteredNotes.length === 0 ? (
        <CardContent>
          <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-800/70 bg-slate-950/35 text-center">
            <div>
              <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-slate-800 bg-slate-900/80 text-indigo-200">
                <FileText size={22} />
              </span>
              <h3 className="text-lg font-semibold text-white">{notes.length === 0 ? "No workspace items yet" : "No matching notes"}</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">{notes.length === 0 ? "Create a note or upload your first file to start building your secure library." : "Try another title, tag, or phrase."}</p>
            </div>
          </div>
        </CardContent>
      ) : (
        <div className="px-6 pb-6">
          <div className="overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-950/35">
          <table className="min-w-full text-left">
            <thead className="bg-white/[0.02] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-5 py-3 font-semibold">Size</th>
                <th className="px-5 py-3 font-semibold">Uploaded</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filteredNotes.map((note, index) => (
                  <motion.tr
                    key={note.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-slate-900/80 transition hover:bg-white/[0.035]"
                  >
                    <td className="max-w-[260px] px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-800/70 bg-slate-900/80 text-indigo-200">
                          {note.note_type === "note" ? <PenLine size={16} /> : <FileText size={16} />}
                        </span>
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-200">{note.title}</span>
                          <span className="mt-1 inline-flex rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-200">{note.note_type === "note" ? "Note" : "File"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{note.note_type === "note" ? `${note.content?.length || 0} chars` : formatBytes(Number(note.file_size))}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{formatDate(note.updated_at || note.created_at)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <Link href={note.note_type === "note" ? `/editor?id=${note.id}` : `/preview?id=${note.id}`} className="mr-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl text-slate-300 transition hover:bg-slate-900 hover:text-white" aria-label={`${note.note_type === "note" ? "Edit" : "Preview"} ${note.title}`}>
                        {note.note_type === "note" ? <PenLine size={16} /> : <Eye size={16} />}
                      </Link>
                      {note.note_type === "file" ? (
                        <Button variant="ghost" className="h-9 w-9 px-0" onClick={() => onDownload(note.id)} aria-label={`Download ${note.title}`}>
                          <Download size={16} />
                        </Button>
                      ) : null}
                      <Button variant="ghost" className="h-9 w-9 px-0 text-red-300 hover:text-red-200" onClick={() => onDelete(note.id)} aria-label={`Delete ${note.title}`}>
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          </div>
        </div>
      )}
    </Card>
  );
}
