"use client";

import { motion } from "framer-motion";
import { Download, FileText, Info } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { fadeUp, staggerContainer } from "@/components/layout/motion-shell";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { useNotes } from "@/hooks/use-notes";
import { formatBytes, formatDate } from "@/lib/utils";
import { getApiError } from "@/services/api";

export function PreviewPageClient() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const { notes, loading, download } = useNotes();
  const { toast } = useToast();
  const note = notes.find((item) => item.id === id) || notes[0];

  const handleDownload = async () => {
    if (!note) return;
    try {
      await download(note.id);
    } catch (error) {
      toast({ type: "error", title: "Download failed", description: getApiError(error) });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.section variants={fadeUp} className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Preview</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">{note?.title || "File preview"}</h1>
              <p className="mt-2 text-sm text-slate-400">A clean preview shell for reviewing metadata and taking file actions.</p>
            </div>
            <Button disabled={!note} onClick={handleDownload}>
              <Download size={17} />
              Download
            </Button>
          </motion.section>

          <motion.div variants={fadeUp} className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <Card className="min-h-[520px]">
              <CardContent className="grid min-h-[520px] place-items-center">
                {loading ? (
                  <p className="text-slate-500">Loading preview...</p>
                ) : note ? (
                  <div className="text-center">
                    <span className="mx-auto grid h-20 w-20 place-items-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300">
                      <FileText size={34} />
                    </span>
                    <h2 className="mt-5 text-xl font-semibold text-white">{note.title}</h2>
                    <p className="mt-2 text-sm text-slate-500">Inline rendering depends on file type. Download uses the existing secure signed URL flow.</p>
                  </div>
                ) : (
                  <p className="text-slate-500">No file selected.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-semibold text-white">File details</h2>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-lg border border-slate-800 bg-slate-900/45 p-4">
                  <div className="mb-3 flex items-center gap-2 text-slate-300">
                    <Info size={16} />
                    Metadata
                  </div>
                  <dl className="space-y-3 text-slate-500">
                    <div className="flex justify-between gap-4">
                      <dt>Name</dt>
                      <dd className="truncate text-slate-300">{note?.title || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Size</dt>
                      <dd className="text-slate-300">{note ? formatBytes(Number(note.file_size)) : "N/A"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Uploaded</dt>
                      <dd className="text-slate-300">{formatDate(note?.created_at)}</dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
