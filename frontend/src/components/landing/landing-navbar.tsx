import Link from "next/link";
import { FileText } from "lucide-react";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-900 bg-[#05070d]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-bold text-white">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-white text-slate-950">
            <FileText size={19} />
          </span>
          CloudNotes
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#preview" className="transition hover:text-white">Preview</a>
          <a href="#workflow" className="transition hover:text-white">Workflow</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden text-sm font-medium text-slate-300 transition hover:text-white sm:block">
            Sign in
          </Link>
          <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-white px-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
