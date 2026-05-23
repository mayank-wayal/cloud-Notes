import { FileText, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_460px]">
      <section className="hidden min-h-screen flex-col justify-between border-r border-slate-900/80 px-10 py-10 lg:flex">
        <div className="flex items-center gap-3 text-lg font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-slate-950">
            <FileText size={21} />
          </span>
          CloudNotes
        </div>

        <div className="max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-sm text-slate-300">
            <Sparkles size={15} />
            Private notes, cleanly organized
          </p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
            A calmer way to manage notes, files, and secure downloads.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
            Upload files into private storage, keep metadata readable, and move through your dashboard without visual noise.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm text-slate-400">
          {[
            ["Private links", LockKeyhole],
            ["JWT sessions", ShieldCheck],
            ["Fast uploads", FileText]
          ].map(([label, Icon]) => (
            <div key={label as string} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <Icon className="mb-3 text-slate-300" size={18} />
              {label as string}
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-950/80 p-7 shadow-soft backdrop-blur">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3 text-lg font-bold">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-slate-950">
                <FileText size={21} />
              </span>
              CloudNotes
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
