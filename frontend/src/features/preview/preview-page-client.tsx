"use client";

import { motion } from "framer-motion";
import { Download, ExternalLink, FileText, Info, Loader2, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { fadeUp, staggerContainer } from "@/components/layout/motion-shell";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { useNotes } from "@/hooks/use-notes";
import { formatBytes, formatDate } from "@/lib/utils";
import { getApiError } from "@/services/api";
import { getPreviewUrl } from "@/services/notes";
import type { NotePreview } from "@/types/note";

const getPreviewKind = (contentType?: string | null, fileName?: string | null, title?: string) => {
  const type = contentType || "";
  const name = `${fileName || title || ""}`.toLowerCase();

  if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name)) return "image";
  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  return "download";
};

export function PreviewPageClient() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const { notes, loading, download } = useNotes();
  const { toast } = useToast();
  const note = notes.find((item) => item.id === id) || notes[0];
  const [preview, setPreview] = useState<NotePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const previewNote = preview?.note || note;
  const previewKind = useMemo(() => getPreviewKind(previewNote?.content_type, previewNote?.file_name, previewNote?.title), [previewNote]);

  const loadPreview = useCallback(async () => {
    if (!note?.id) return;

    try {
      setPreviewLoading(true);
      setPreviewError("");
      setPreview(await getPreviewUrl(note.id));
    } catch (error) {
      const message = getApiError(error);
      setPreview(null);
      setPreviewError(message);
      toast({ type: "error", title: "Preview unavailable", description: message });
    } finally {
      setPreviewLoading(false);
    }
  }, [note?.id, toast]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  const handleDownload = async () => {
    if (!note) return;
    try {
      await download(note.id);
    } catch (error) {
      toast({ type: "error", title: "Download failed", description: getApiError(error) });
    }
  };

  const openPreviewInNewTab = () => {
    if (!preview?.previewUrl) return;
    window.open(preview.previewUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.section variants={fadeUp} className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Preview</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">{previewNote?.title || "File preview"}</h1>
              <p className="mt-2 text-sm text-slate-400">Private previews use temporary signed access and expire after a few minutes.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" disabled={!preview?.previewUrl} onClick={openPreviewInNewTab}>
                <ExternalLink size={17} />
                Open
              </Button>
              <Button disabled={!note} onClick={handleDownload}>
                <Download size={17} />
                Download
              </Button>
            </div>
          </motion.section>

          <motion.div variants={fadeUp} className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <Card className="min-h-[560px] overflow-hidden">
              <CardContent className="min-h-[560px] p-0">
                {loading || previewLoading ? (
                  <div className="grid min-h-[560px] place-items-center text-slate-500">
                    <div className="flex items-center gap-3">
                      <Loader2 size={18} className="animate-spin" />
                      Loading secure preview...
                    </div>
                  </div>
                ) : previewError ? (
                  <div className="grid min-h-[560px] place-items-center p-6 text-center">
                    <div>
                      <span className="mx-auto grid h-16 w-16 place-items-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300">
                        <FileText size={28} />
                      </span>
                      <h2 className="mt-5 text-xl font-semibold text-white">Preview unavailable</h2>
                      <p className="mt-2 max-w-md text-sm text-slate-500">{previewError}</p>
                      <Button className="mt-5" onClick={loadPreview}>
                        <RefreshCw size={16} />
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : preview?.previewUrl && previewKind === "image" ? (
                  <div className="grid min-h-[560px] place-items-center bg-slate-950 p-4">
                    <img src={preview.previewUrl} alt={previewNote?.title || "File preview"} className="max-h-[520px] max-w-full rounded-md object-contain" />
                  </div>
                ) : preview?.previewUrl && previewKind === "pdf" ? (
                  <iframe title={previewNote?.title || "PDF preview"} src={preview.previewUrl} className="h-[560px] w-full border-0 bg-slate-950" />
                ) : preview?.previewUrl && previewNote ? (
                  <div className="grid min-h-[560px] place-items-center p-6 text-center">
                    <div>
                      <span className="mx-auto grid h-20 w-20 place-items-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300">
                        <FileText size={34} />
                      </span>
                      <h2 className="mt-5 text-xl font-semibold text-white">{previewNote.title}</h2>
                      <p className="mt-2 max-w-md text-sm text-slate-500">This file type cannot be embedded here. Open it in a browser tab or download it with temporary signed access.</p>
                      <div className="mt-5 flex justify-center gap-2">
                        <Button variant="secondary" onClick={openPreviewInNewTab}>
                          <ExternalLink size={16} />
                          Open
                        </Button>
                        <Button onClick={handleDownload}>
                          <Download size={16} />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid min-h-[560px] place-items-center text-slate-500">No file selected.</div>
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
                      <dd className="truncate text-slate-300">{previewNote?.file_name || previewNote?.title || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Type</dt>
                      <dd className="truncate text-slate-300">{previewNote?.content_type || "Unknown"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Size</dt>
                      <dd className="text-slate-300">{previewNote ? formatBytes(Number(previewNote.file_size)) : "N/A"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Uploaded</dt>
                      <dd className="text-slate-300">{formatDate(previewNote?.created_at)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Access</dt>
                      <dd className="text-slate-300">{preview ? `${preview.expiresInSeconds / 60} min` : "N/A"}</dd>
                    </div>
                  </dl>
                </div>
                <Button variant="secondary" className="w-full" disabled={!preview?.previewUrl || previewLoading} onClick={loadPreview}>
                  {previewLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Refresh link
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
