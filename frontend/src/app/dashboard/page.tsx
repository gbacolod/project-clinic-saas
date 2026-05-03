import Link from "next/link";
import { AppShell } from "../components/AppShell";

const stats = [
  { label: "Waiting", value: "12", tone: "text-amber-700 bg-amber-50" },
  { label: "In consultation", value: "4", tone: "text-indigo-700 bg-indigo-50" },
  { label: "Completed", value: "31", tone: "text-emerald-700 bg-emerald-50" },
  { label: "Emergency", value: "2", tone: "text-red-700 bg-red-50" },
];

const actions = [
  { href: "/patients/create", label: "Create patient" },
  { href: "/triage", label: "Open triage" },
  { href: "/queue", label: "View queue" },
  { href: "/consultation", label: "Doctor consult" },
];

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div className="grid gap-5">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className={`mt-4 inline-flex rounded-lg px-3 py-2 text-3xl font-semibold ${stat.tone}`}>{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Today</h2>
            <div className="mt-4 grid gap-3">
              {["Nurse triage queue review", "Doctor consultation handoff", "Daily queue report"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Open</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {actions.map((action) => (
                <Link key={action.href} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800" href={action.href}>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
