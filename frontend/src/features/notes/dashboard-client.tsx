"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, Calendar, Database, FileText, Plus, Sparkles, UploadCloud } from "lucide-react";
import { NotesTable } from "@/components/dashboard/notes-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { UploadPanel } from "@/components/dashboard/upload-panel";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { fadeUp, staggerContainer } from "@/components/layout/motion-shell";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { useNotes } from "@/hooks/use-notes";
import { getApiError } from "@/services/api";
import { formatBytes, formatDate } from "@/lib/utils";

export function DashboardClient() {
  const { notes, loading, error, setError, upload, remove, download, stats } = useNotes();
  const { toast } = useToast();

  const handleUpload = async (input: { title: string; file: File; onProgress?: (progress: number) => void }) => {
    try {
      await upload(input);
      toast({ type: "success", title: "Note uploaded", description: "Your file is available in the library." });
    } catch (uploadError) {
      toast({ type: "error", title: "Upload failed", description: getApiError(uploadError) });
      throw uploadError;
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await remove(noteId);
      toast({ type: "success", title: "Note deleted" });
    } catch (deleteError) {
      toast({ type: "error", title: "Delete failed", description: getApiError(deleteError) });
    }
  };

  const handleDownload = async (noteId: string) => {
    try {
      await download(noteId);
    } catch (downloadError) {
      toast({ type: "error", title: "Download failed", description: getApiError(downloadError) });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.section variants={fadeUp} className="mb-8 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-slate-950/45 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 rounded-2xl border border-indigo-300/15 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-200">
                  <Sparkles size={15} />
                  Dashboard
                </p>
                <h2 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  Your notes, files, and downloads in one calm workspace.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
                  Upload private files, search your library, and preview recent activity without leaving the dashboard.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link href="/upload" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200">
                    <Plus size={17} />
                    Upload note
                  </Link>
                  <Link href="/notes" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-950/50 px-5 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-900">
                    Browse library
                    <ArrowUpRight size={17} />
                  </Link>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-800/50 bg-slate-950/50 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Storage pulse</p>
                    <p className="text-xs text-slate-500">Live from your library</p>
                  </div>
                  <UploadCloud className="text-indigo-200" size={20} />
                </div>
                <div className="flex items-end gap-2">
                  {[48, 68, 42, 82, 58, 74, 92].map((height, index) => (
                    <motion.div
                      key={height}
                      initial={{ height: 12, opacity: 0 }}
                      animate={{ height, opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="w-full rounded-t-2xl bg-gradient-to-t from-indigo-500/40 to-blue-300/70"
                    />
                  ))}
                </div>
                <div className="mt-5 rounded-2xl bg-white/[0.03] p-4">
                  <p className="text-3xl font-bold text-white">{formatBytes(stats.storage)}</p>
                  <p className="mt-1 text-sm text-slate-500">stored across {stats.totalNotes} files</p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section variants={fadeUp} className="mb-6 grid gap-4 md:grid-cols-3">
            <StatCard label="Total notes" value={String(stats.totalNotes)} detail="Files in your library" icon={FileText} tone="indigo" />
            <StatCard label="Storage used" value={formatBytes(stats.storage)} detail="Across private uploads" icon={Database} tone="blue" delay={0.04} />
            <StatCard label="Latest upload" value={formatDate(stats.latest)} detail="Most recent activity" icon={Calendar} tone="violet" delay={0.08} />
          </motion.section>

          {error ? (
            <motion.div variants={fadeUp} className="mb-6 flex items-start gap-3 rounded-lg border border-red-950/70 bg-red-950/30 px-4 py-3 text-sm text-red-200">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
              <Button variant="ghost" className="ml-auto h-7 px-2 text-red-200" onClick={() => setError("")}>
                Dismiss
              </Button>
            </motion.div>
          ) : null}

          <motion.div variants={fadeUp} className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <UploadPanel onUpload={handleUpload} />
              <NotesTable notes={notes} loading={loading} onDelete={handleDelete} onDownload={handleDownload} />
            </div>
            <aside className="space-y-5">
              <div className="premium-card rounded-2xl p-6">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-300">Activity</p>
                <h3 className="mt-2 text-xl font-bold text-white">Recent movement</h3>
                <div className="mt-6 space-y-5">
                  {(notes.slice(0, 4).length ? notes.slice(0, 4) : [{ id: "empty-state", title: "Upload your first note", created_at: new Date().toISOString(), file_size: 0 }]).map((note) => (
                    <div key={note.id} className="relative border-l border-slate-800 pl-4">
                      <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-indigo-300" />
                      <p className="truncate text-sm font-medium text-slate-200">{note.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(note.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="premium-card rounded-2xl p-6">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-300">Quick actions</p>
                <div className="mt-5 grid gap-3">
                  <Link href="/upload" className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07]">Upload a file</Link>
                  <Link href="/notes" className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07]">Open notes library</Link>
                  <Link href="/settings" className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07]">Review settings</Link>
                </div>
              </div>
            </aside>
          </motion.div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
