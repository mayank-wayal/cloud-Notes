import Link from "next/link";
import { ArrowRight, CheckCircle2, Cloud, FileSearch, FolderKanban, LockKeyhole, Sparkles, UploadCloud } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { DashboardMockup } from "./dashboard-mockup";
import { LandingNavbar } from "./landing-navbar";

const features = [
  { title: "Private file storage", text: "Keep uploads protected while metadata stays fast and searchable.", icon: LockKeyhole },
  { title: "Organized library", text: "Scan notes by file type, timestamp, tags, and categories.", icon: FolderKanban },
  { title: "Instant search", text: "Find the right document from a clean command-style search flow.", icon: FileSearch },
  { title: "Smooth uploads", text: "Progress states, previews, and feedback built for daily use.", icon: UploadCloud }
];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <LandingNavbar />

      <section className="accent-ring relative px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="mx-auto mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm text-slate-300">
              <Sparkles size={15} className="text-indigo-300" />
              Premium cloud notes for focused teams and students
            </p>
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Store every note in a workspace that feels effortless.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              CloudNotes brings private uploads, fast search, and a refined dashboard together in a calm modern product experience.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
                Start free
                <ArrowRight size={17} />
              </Link>
              <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/70 px-6 text-sm font-semibold text-slate-200 transition hover:bg-slate-900">
                Open dashboard
              </Link>
            </div>
          </Reveal>

          <Reveal className="mt-16" delay={0.08}>
            <DashboardMockup />
          </Reveal>
        </div>
      </section>

      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-12 max-w-2xl">
            <p className="text-sm font-medium text-indigo-300">Features</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">Everything needed for a serious notes library.</h2>
            <p className="mt-4 text-slate-400">Clean primitives, thoughtful defaults, and no clutter fighting for attention.</p>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 0.04}>
                <div className="premium-card h-full rounded-2xl p-6 transition duration-200 hover:-translate-y-1 hover:border-slate-700">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-indigo-300">
                    <feature.icon size={20} />
                  </span>
                  <h3 className="mt-6 font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{feature.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="premium-card rounded-2xl p-8">
              <p className="text-sm font-medium text-indigo-300">Upload workflow</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">Drag, preview, upload, done.</h2>
              <p className="mt-4 text-slate-400">The upload flow is designed to feel direct: choose a file, watch progress, and get clear success/error feedback.</p>
              <div className="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 p-8 text-center">
                <UploadCloud className="mx-auto text-indigo-300" size={32} />
                <p className="mt-4 font-semibold text-white">Drop lecture-notes.pdf here</p>
                <p className="mt-2 text-sm text-slate-500">25 MB maximum per file</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="premium-card rounded-2xl p-8">
              <p className="text-sm font-medium text-indigo-300">Organization</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">A library that stays readable.</h2>
              <div className="mt-8 space-y-3">
                {["Research", "Product", "Study", "Archive"].map((tag) => (
                  <div key={tag} className="flex items-center justify-between rounded-2xl bg-slate-950/70 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-indigo-300" size={18} />
                      <span className="font-medium text-slate-200">{tag}</span>
                    </div>
                    <span className="text-sm text-slate-500">Synced</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="preview" className="px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Cloud className="mx-auto text-indigo-300" size={34} />
          <h2 className="mt-5 text-4xl font-bold tracking-tight text-white">Cloud sync without a noisy interface.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">A focused dashboard for upload, search, preview, and retrieval, built on your existing backend integrations.</p>
        </Reveal>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
          {["CloudNotes feels like a real workspace, not a folder dump.", "The search and upload flow gets out of the way.", "It has the calm polish we expect from modern SaaS."].map((quote) => (
            <Reveal key={quote}>
              <figure className="premium-card rounded-2xl p-6">
                <blockquote className="text-sm leading-6 text-slate-300">"{quote}"</blockquote>
                <figcaption className="mt-5 text-sm text-slate-500">CloudNotes beta user</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 text-center sm:p-12">
          <p className="text-sm font-medium text-indigo-300">Simple pricing preview</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">Start with your private workspace.</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">Use the current backend plan and expand pricing later without redesigning the product surface.</p>
          <Link href="/register" className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
            Create account
          </Link>
        </Reveal>
      </section>

      <footer className="border-t border-slate-900 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>CloudNotes</p>
          <p>Private notes. Clean dashboard. Secure downloads.</p>
        </div>
      </footer>
    </main>
  );
}
