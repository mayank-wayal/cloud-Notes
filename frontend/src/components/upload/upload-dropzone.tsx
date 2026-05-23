"use client";

import { motion } from "framer-motion";
import { CheckCircle2, FileUp, Loader2, UploadCloud } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBytes } from "@/lib/utils";

type UploadDropzoneProps = {
  onUpload: (input: { title: string; file: File; onProgress?: (progress: number) => void }) => Promise<void>;
};

export function UploadDropzone({ onUpload }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    setComplete(false);
    setLoading(true);
    try {
      await onUpload({ title, file, onProgress: setProgress });
      setComplete(true);
      setTitle("");
      setFile(null);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <motion.label
        whileHover={{ y: -2 }}
        className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-950/60 px-6 py-10 text-center transition hover:border-slate-500 hover:bg-slate-950"
      >
        <span className="grid h-14 w-14 place-items-center rounded-md border border-slate-800 bg-slate-900 text-slate-300">
          <FileUp size={24} />
        </span>
        <h2 className="mt-5 text-xl font-semibold text-white">Drop files here or browse</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Upload lecture notes, PDFs, documents, images, and archives into your private CloudNotes library.</p>
        <input ref={inputRef} type="file" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] || null)} />
      </motion.label>

      {file ? (
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{file.name}</p>
              <p className="mt-1 text-sm text-slate-500">{formatBytes(file.size)}</p>
            </div>
            {complete ? <CheckCircle2 className="text-emerald-400" size={20} /> : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give this upload a title" required />
        <Button className="h-11" disabled={!file || loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={17} />}
          Upload file
        </Button>
      </div>

      {loading ? (
        <div className="h-2 overflow-hidden rounded-full bg-slate-900">
          <motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
        </div>
      ) : null}
    </form>
  );
}
