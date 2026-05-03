"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients", label: "Patients" },
  { href: "/patients/create", label: "New Patient" },
  { href: "/triage", label: "Triage" },
  { href: "/queue", label: "Queue" },
  { href: "/consultation", label: "Consultation" },
  { href: "/reports", label: "Reports" },
];

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link className="text-lg font-semibold text-slate-950" href="/dashboard">
            Clinic SaaS
          </Link>
          <Link className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 lg:hidden" href="/login">
            Sign out
          </Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-5 pb-4 lg:grid lg:overflow-visible">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
                href={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-5 py-4 lg:block">
          <Link className="block rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700" href="/login">
            Sign out
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="border-b border-slate-200 bg-white px-5 py-5">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-5">{children}</main>
      </div>
    </div>
  );
}
