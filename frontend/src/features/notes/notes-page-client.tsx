"use client";

import { motion } from "framer-motion";
import { NotesBrowser } from "@/components/notes/notes-browser";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { fadeUp, staggerContainer } from "@/components/layout/motion-shell";
import { useToast } from "@/components/providers/toast-provider";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { useNotes } from "@/hooks/use-notes";
import { getApiError } from "@/services/api";

export function NotesPageClient() {
  const { notes, loading, remove, download } = useNotes();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast({ type: "success", title: "Note deleted" });
    } catch (error) {
      toast({ type: "error", title: "Delete failed", description: getApiError(error) });
    }
  };

  const handleDownload = async (id: string) => {
    try {
      await download(id);
    } catch (error) {
      toast({ type: "error", title: "Download failed", description: getApiError(error) });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.section variants={fadeUp} className="mb-6">
            <p className="text-sm font-medium text-slate-500">Library</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Notes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Browse, filter, preview, and download every file in your private workspace.</p>
          </motion.section>
          <motion.section variants={fadeUp}>
            <NotesBrowser notes={notes} loading={loading} onDownload={handleDownload} onDelete={handleDelete} />
          </motion.section>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
