"use client";

import { motion } from "framer-motion";
import { CheckCircle2, FileUp, Loader2, UploadCloud } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatBytes } from "@/lib/utils";

type UploadPanelProps = {
  onUpload: (input: { title: string; file: File; onProgress?: (progress: number) => void }) => Promise<void>;
};

const acceptedFileTypes = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md,.png,.jpg,.jpeg,.gif,.webp,.zip";

export function UploadPanel({ onUpload }: UploadPanelProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      await onUpload({ title, file, onProgress: setProgress });
      setTitle("");
      setFile(null);
      setProgress(0);
      if (fileInput.current) fileInput.current.value = "";
    } catch {
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="overflow-hidden">
        <CardHeader className="border-b-0 pb-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-300">Upload</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Drop a new note into your cloud library</h2>
              <p className="mt-2 text-sm text-slate-500">A focused upload flow with preview, progress, and secure backend storage.</p>
            </div>
            <span className="hidden h-12 w-12 place-items-center rounded-2xl border border-indigo-300/20 bg-indigo-500/10 text-indigo-200 sm:grid">
              <UploadCloud size={18} />
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <label
              onDragEnter={() => setDragging(true)}
              onDragLeave={() => setDragging(false)}
              onDrop={() => setDragging(false)}
              className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center transition duration-200 ${
                dragging ? "border-indigo-300/70 bg-indigo-500/10" : "border-slate-700/70 bg-slate-950/45 hover:border-indigo-300/40 hover:bg-indigo-500/[0.05]"
              }`}
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] text-indigo-200 ring-1 ring-white/10">
                <FileUp size={24} />
              </span>
              <span className="mt-5 font-semibold text-white">{file ? file.name : "Choose a file or drag it here"}</span>
              <span className="mt-2 text-sm text-slate-500">{file ? formatBytes(file.size) : "PDFs, docs, images, archives, and notes"}</span>
              <input ref={fileInput} type="file" accept={acceptedFileTypes} className="sr-only" onChange={(event) => setFile(event.target.files?.[0] || null)} required />
            </label>

            <div className="rounded-2xl border border-slate-800/50 bg-slate-950/50 p-4">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Note title" maxLength={120} required />
              <div className="mt-4 rounded-2xl bg-slate-900/45 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-800 text-slate-300">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : file ? <CheckCircle2 size={18} /> : <UploadCloud size={18} />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">{file ? file.name : "No file selected"}</p>
                    <p className="text-xs text-slate-500">{loading ? `${progress}% uploaded` : "Ready when you are"}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-950">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-blue-400" animate={{ width: `${loading ? progress : file ? 100 : 0}%` }} transition={{ duration: 0.18 }} />
                </div>
              </div>
              <Button disabled={loading || !file} className="mt-4 h-12 w-full">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={17} />}
                Upload note
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
