"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, Eye, EyeOff, Loader2, Pin, Plus, Save, SplitSquareHorizontal, Tag, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyboardEvent, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { MarkdownPreview } from "@/components/editor/markdown-preview";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { fadeUp, staggerContainer } from "@/components/layout/motion-shell";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { useNotes } from "@/hooks/use-notes";
import { getApiError } from "@/services/api";
import type { Note } from "@/types/note";

const starterContent = `# Untitled idea

Write in markdown. Capture the rough thought first, then shape it.

- Use bullets for structure
- Add **emphasis** when it helps
- Keep files and notes in one CloudNotes workspace`;

const getTagList = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);

export function EditorPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams?.get("id");
  const { isAuthenticated, isReady } = useAuth();
  const { get, create, update } = useNotes({ loadOnMount: false });
  const { toast } = useToast();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("Untitled note");
  const [content, setContent] = useState(starterContent);
  const [tags, setTags] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [showPreview, setShowPreview] = useState(true);
  const lastSavedRef = useRef("");
  const loadedExisting = Boolean(note?.id);
  const previewContent = useDeferredValue(content);

  const payload = useMemo(
    () => ({
      title,
      content,
      tags: getTagList(tags),
      isPinned
    }),
    [content, isPinned, tags, title]
  );

  const payloadKey = useMemo(() => JSON.stringify(payload), [payload]);

  const loadNote = useCallback(async () => {
    if (!isReady || !isAuthenticated) return;

    if (!id) {
      setIsLoading(false);
      lastSavedRef.current = "";
      return;
    }

    try {
      setIsLoading(true);
      const nextNote = await get(id);

      if (nextNote.note_type !== "note") {
        toast({ type: "error", title: "Editor unavailable", description: "Uploaded files open in preview, not the text editor." });
        router.replace(`/preview?id=${nextNote.id}`);
        return;
      }

      setNote(nextNote);
      setTitle(nextNote.title);
      setContent(nextNote.content || "");
      setTags((nextNote.tags || []).join(", "));
      setIsPinned(Boolean(nextNote.is_pinned));
      lastSavedRef.current = JSON.stringify({
        title: nextNote.title,
        content: nextNote.content || "",
        tags: nextNote.tags || [],
        isPinned: Boolean(nextNote.is_pinned)
      });
    } catch (error) {
      toast({ type: "error", title: "Could not load note", description: getApiError(error) });
    } finally {
      setIsLoading(false);
    }
  }, [get, id, isAuthenticated, isReady, router, toast]);

  useEffect(() => {
    void loadNote();
  }, [loadNote]);

  const save = useCallback(
    async (quiet = false) => {
      if (payloadKey === lastSavedRef.current) return note;

      try {
        setIsSaving(true);
        setSaveState("idle");
        const saved = loadedExisting && note ? await update(note.id, payload) : await create(payload);
        setNote(saved);
        lastSavedRef.current = JSON.stringify({
          title: saved.title,
          content: saved.content || "",
          tags: saved.tags || [],
          isPinned: Boolean(saved.is_pinned)
        });
        setSaveState("saved");

        if (!loadedExisting) {
          router.replace(`/editor?id=${saved.id}`);
        }

        if (!quiet) toast({ type: "success", title: "Note saved" });
        return saved;
      } catch (error) {
        setSaveState("error");
        if (!quiet) toast({ type: "error", title: "Save failed", description: getApiError(error) });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [create, loadedExisting, note, payload, payloadKey, router, toast, update]
  );

  useEffect(() => {
    if (!isReady || !isAuthenticated || isLoading || isSaving || payloadKey === lastSavedRef.current) return;
    const timeout = window.setTimeout(() => void save(true), 1400);
    return () => window.clearTimeout(timeout);
  }, [isAuthenticated, isLoading, isReady, isSaving, payloadKey, save]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void save();
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.header variants={fadeUp} className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/notes" className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-800/70 bg-slate-950/60 text-slate-400 transition hover:text-white" aria-label="Back to notes">
                <ArrowLeft size={17} />
              </Link>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-300">Editor</p>
                <h1 className="truncate text-2xl font-bold tracking-tight text-white">{loadedExisting ? "Edit note" : "New note"}</h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-400">
                {isSaving ? <Loader2 size={15} className="animate-spin" /> : saveState === "saved" ? <Check size={15} className="text-emerald-300" /> : <Save size={15} />}
                {isSaving ? "Saving" : saveState === "saved" ? "Saved" : saveState === "error" ? "Unsaved" : "Autosave on"}
              </span>
              <Button variant="secondary" onClick={() => setShowPreview((current) => !current)}>
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPreview ? "Hide preview" : "Show preview"}
              </Button>
              <Button onClick={() => void save()}>
                <Save size={16} />
                Save
              </Button>
            </div>
          </motion.header>

          {isLoading ? (
            <div className="grid min-h-[620px] place-items-center rounded-lg border border-slate-800 bg-slate-950/50 text-slate-500">
              <div className="flex items-center gap-3">
                <Loader2 size={18} className="animate-spin" />
                Loading editor...
              </div>
            </div>
          ) : (
            <motion.section variants={fadeUp} className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="space-y-4">
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/55 p-4">
                  <p className="text-sm font-semibold text-white">Metadata</p>
                  <label className="mt-4 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Tags</label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 text-slate-500">
                    <Tag size={15} />
                    <input value={tags} onChange={(event) => setTags(event.target.value)} onKeyDown={handleKeyDown} className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none" placeholder="work, ideas" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPinned((current) => !current)}
                    className="mt-4 flex h-11 w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-300 transition hover:bg-slate-900"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Pin size={15} />
                      Pin note
                    </span>
                    <span className={isPinned ? "text-emerald-300" : "text-slate-600"}>{isPinned ? "On" : "Off"}</span>
                  </button>
                </div>
                <div className="rounded-lg border border-indigo-400/10 bg-indigo-500/[0.05] p-4">
                  <SplitSquareHorizontal className="text-indigo-200" size={18} />
                  <p className="mt-3 text-sm font-medium text-white">Markdown shortcuts</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">Use headings, lists, bold text, inline code, quotes, and links. Press Ctrl/⌘ + S to save.</p>
                </div>
                <Link href="/upload" className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 text-sm font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white">
                  <UploadCloud size={16} />
                  Upload a file
                </Link>
              </aside>

              <div className={showPreview ? "grid min-h-[680px] gap-4 lg:grid-cols-2" : "min-h-[680px]"}>
                <section className="overflow-hidden rounded-lg border border-slate-800/70 bg-slate-950/60">
                  <div className="border-b border-slate-800/70 p-4">
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent text-3xl font-bold tracking-tight text-white outline-none placeholder:text-slate-700"
                      placeholder="Untitled note"
                      maxLength={120}
                    />
                  </div>
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[590px] w-full resize-none bg-transparent p-5 font-mono text-sm leading-7 text-slate-200 outline-none placeholder:text-slate-700"
                    placeholder="Start writing..."
                    spellCheck
                  />
                </section>

                {showPreview ? (
                  <section className="overflow-hidden rounded-lg border border-slate-800/70 bg-slate-950/55">
                    <div className="border-b border-slate-800/70 px-5 py-4">
                      <p className="text-sm font-semibold text-white">Live preview</p>
                    </div>
                    <div className="h-[626px] overflow-auto p-6">
                      <MarkdownPreview content={previewContent} />
                    </div>
                  </section>
                ) : null}
              </div>
            </motion.section>
          )}
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
