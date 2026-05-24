"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, FileText, FolderOpen, LayoutDashboard, LogOut, Menu, PenLine, Search, Settings, Sparkles, UploadCloud, X } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Notes", icon: FolderOpen, href: "/notes" },
  { label: "Write", icon: PenLine, href: "/editor" },
  { label: "Upload", icon: UploadCloud, href: "/upload" },
  { label: "Settings", icon: Settings, href: "/settings" }
];

type DashboardSidebarProps = {
  mobile?: boolean;
  pathname: string;
  userName?: string;
  userEmail?: string;
  onNavigate: () => void;
  onClose: () => void;
};

const DashboardSidebar = memo(function DashboardSidebar({ mobile = false, pathname, userName, userEmail, onNavigate, onClose }: DashboardSidebarProps) {
  return (
    <motion.aside
      initial={mobile ? { x: -280, opacity: 0 } : false}
      animate={mobile ? { x: 0, opacity: 1 } : undefined}
      exit={mobile ? { x: -280, opacity: 0 } : undefined}
      transition={{ duration: 0.28 }}
      className={cn(
        "bg-slate-950/42 px-4 py-5 backdrop-blur-2xl",
        mobile ? "fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800/50 lg:hidden" : "hidden lg:block"
      )}
    >
      <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/[0.06]">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-white to-slate-300 text-slate-950 shadow-lg shadow-indigo-950/20">
            <FileText size={21} />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-white">CloudNotes</p>
            <p className="truncate text-xs text-slate-500">Personal workspace</p>
          </div>
        </Link>
        {mobile ? (
          <button className="grid h-9 w-9 place-items-center rounded-md text-slate-400 hover:bg-slate-900 hover:text-white" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className="mb-4 rounded-2xl border border-slate-800/40 bg-slate-900/25 px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-200">{userName || "Workspace"}</p>
            <p className="truncate text-xs text-slate-500">{userEmail || "Private library"}</p>
          </div>
          <ChevronDown size={16} className="text-slate-500" />
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex h-11 w-full items-center gap-3 overflow-hidden rounded-2xl px-3 text-sm transition duration-200",
                active ? "bg-white/[0.08] text-white shadow-lg shadow-slate-950/20" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              {active ? <motion.span layoutId="sidebar-active" className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-indigo-400" /> : null}
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.06] p-4">
        <Sparkles className="text-indigo-300" size={18} />
        <p className="mt-3 text-sm font-medium text-white">Private sync</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Secure uploads and signed downloads through your existing API.</p>
      </div>
    </motion.aside>
  );
});

type DashboardHeaderProps = {
  userName?: string;
  onOpenSidebar: () => void;
  onLogout: () => void;
};

const DashboardHeader = memo(function DashboardHeader({ userName, onOpenSidebar, onLogout }: DashboardHeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = query.trim();
    if (nextQuery) router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
  };

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      const wantsSearch = event.key === "/" || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k");

      if (!isTyping && wantsSearch) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0B1020]/62 backdrop-blur-2xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-800/60 bg-slate-950/70 text-slate-400 lg:hidden" onClick={onOpenSidebar} aria-label="Open sidebar">
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Workspace</p>
          <h1 className="truncate text-base font-semibold text-white sm:text-lg">CloudNotes for {userName || "you"}</h1>
        </div>

        <form onSubmit={handleSearch} className="hidden h-12 w-full max-w-xl items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-950/60 px-4 text-sm text-slate-500 shadow-2xl shadow-slate-950/20 transition focus-within:border-indigo-400/60 md:flex">
          <Search size={16} />
          <input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-slate-200 outline-none placeholder:text-slate-500" placeholder="Search notes, files, and activity" />
        </form>

        <div className="flex items-center gap-2">
          <button className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-800/60 bg-slate-950/60 text-slate-400 transition hover:-translate-y-0.5 hover:text-white" aria-label="Notifications">
            <Bell size={17} />
          </button>
          <Button variant="secondary" onClick={onLogout} className="h-11 rounded-2xl px-3">
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
});

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname() || "";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);

  return (
    <main className="dashboard-shell min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <DashboardSidebar pathname={pathname} userName={user?.name} userEmail={user?.email} onNavigate={closeSidebar} onClose={closeSidebar} />
      {isSidebarOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={closeSidebar} />
          <DashboardSidebar mobile pathname={pathname} userName={user?.name} userEmail={user?.email} onNavigate={closeSidebar} onClose={closeSidebar} />
        </>
      ) : null}

      <section className="min-w-0">
        <DashboardHeader userName={user?.name} onOpenSidebar={openSidebar} onLogout={logout} />

        {children}
      </section>
    </main>
  );
}
