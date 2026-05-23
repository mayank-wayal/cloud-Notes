import { Activity, FileText, Search, UploadCloud } from "lucide-react";

const files = ["Research outline.pdf", "Sprint notes.md", "Cloud diagram.png"];

export function DashboardMockup() {
  return (
    <div className="premium-card relative overflow-hidden rounded-2xl p-4">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
      <div className="grid min-h-[420px] gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 lg:block">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-slate-950">
              <FileText size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">CloudNotes</p>
              <p className="text-xs text-slate-500">Personal</p>
            </div>
          </div>
          {["Dashboard", "Notes", "Upload", "Settings"].map((item, index) => (
            <div key={item} className={`mb-2 rounded-2xl px-3 py-2 text-sm ${index === 0 ? "bg-slate-900 text-white" : "text-slate-500"}`}>
              {item}
            </div>
          ))}
        </aside>
        <section className="rounded-2xl border border-slate-800/80 bg-[#0B0F19]/80 p-4">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Workspace</p>
              <h3 className="text-xl font-bold text-white">Notes command center</h3>
            </div>
            <div className="hidden h-10 w-64 items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-500 sm:flex">
              <Search size={15} />
              Search notes
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["42", "Total notes"],
              ["8.6 GB", "Storage used"],
              ["Today", "Latest upload"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-semibold text-white">Recent files</p>
                <UploadCloud size={17} className="text-indigo-300" />
              </div>
              {files.map((file) => (
                <div key={file} className="mb-3 flex items-center justify-between rounded-2xl bg-slate-900/70 px-3 py-3 last:mb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-800 text-slate-300">
                      <FileText size={15} />
                    </span>
                    <span className="truncate text-sm text-slate-300">{file}</span>
                  </div>
                  <span className="text-xs text-slate-500">2m ago</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-4 flex items-center gap-2 text-white">
                <Activity size={17} />
                Activity
              </div>
              {["Uploaded sprint notes", "Created archive", "Shared preview"].map((item) => (
                <div key={item} className="mb-4 border-l border-slate-800 pl-3 text-sm text-slate-400 last:mb-0">
                  {item}
                  <p className="mt-1 text-xs text-slate-600">Just now</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
