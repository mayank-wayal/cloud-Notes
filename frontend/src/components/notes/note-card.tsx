"use client";

import { motion } from "framer-motion";
import { Download, Eye, FileArchive, FileImage, FileText } from "lucide-react";
import Link from "next/link";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { formatBytes, formatDate } from "@/lib/utils";
import type { Note } from "@/types/note";

const getIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp")) return FileImage;
  if (lower.endsWith(".zip") || lower.endsWith(".rar")) return FileArchive;
  return FileText;
};

export function NoteCard({ note, index, onDownload, onDelete }: { note: Note; index: number; onDownload: (id: string) => void; onDelete: (id: string) => void }) {
  const Icon = getIcon(note.title);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 transition hover:border-slate-700"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-md border border-slate-800 bg-slate-900 text-slate-300">
          <Icon size={20} />
        </span>
        <DropdownMenu
          actions={[
            { label: "Preview", onClick: () => window.location.assign(`/preview?id=${note.id}`) },
            { label: "Download", onClick: () => onDownload(note.id) },
            { label: "Delete", destructive: true, onClick: () => onDelete(note.id) }
          ]}
        />
      </div>
      <Link href={`/preview?id=${note.id}`} className="block">
        <h3 className="truncate font-semibold text-white">{note.title}</h3>
        <p className="mt-2 text-sm text-slate-500">{formatBytes(Number(note.file_size))}</p>
      </Link>
      <div className="mt-5 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span className="rounded-full border border-slate-800 px-2 py-1">Personal</span>
        <span>{formatDate(note.created_at)}</span>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md bg-slate-900 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white" onClick={() => onDownload(note.id)}>
          <Download size={14} />
          Download
        </button>
        <Link href={`/preview?id=${note.id}`} className="inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md border border-slate-800 text-xs font-medium text-slate-300 transition hover:text-white">
          <Eye size={14} />
          Preview
        </Link>
      </div>
    </motion.article>
  );
}
