"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { apiRequest, getErrorMessage } from "../lib/api";

type ReportSummary = {
  patients: {
    total: number;
  };
  queue: {
    waiting: number;
    inConsultation: number;
    completed: number;
  };
  triage: {
    emergency: number;
    urgent: number;
    regular: number;
    followUp: number;
  };
  visits: {
    total: number;
  };
};

const emptySummary: ReportSummary = {
  patients: { total: 0 },
  queue: { waiting: 0, inConsultation: 0, completed: 0 },
  triage: { emergency: 0, urgent: 0, regular: 0, followUp: 0 },
  visits: { total: 0 },
};

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportSummary>(emptySummary);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadSummary();
  }, []);

  async function loadSummary() {
    setError("");
    setIsLoading(true);

    try {
      const query = new URLSearchParams();
      if (from) {
        query.set("from", from);
      }
      if (to) {
        query.set("to", to);
      }

      const path = query.toString() ? `/api/reports/summary?${query.toString()}` : "/api/reports/summary";
      setSummary(await apiRequest<ReportSummary>(path));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadSummary();
  }

  return (
    <AppShell title="Reports">
      <div className="grid gap-5">
        <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-[1fr_1fr_auto]" onSubmit={submitFilters}>
          <Input label="From" type="date" value={from} onChange={setFrom} />
          <Input label="To" type="date" value={to} onChange={setTo} />
          <button className="h-11 self-end rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:bg-slate-300" disabled={isLoading} type="submit">
            {isLoading ? "Loading" : "Run report"}
          </button>
        </form>

        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total patients" value={summary.patients.total} />
          <Metric label="Waiting queue" value={summary.queue.waiting} />
          <Metric label="In consultation" value={summary.queue.inConsultation} />
          <Metric label="Visits" value={summary.visits.total} />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Queue</h2>
            <ReportRows
              rows={[
                ["Waiting", summary.queue.waiting],
                ["In consultation", summary.queue.inConsultation],
                ["Completed", summary.queue.completed],
              ]}
            />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Triage Priority</h2>
            <ReportRows
              rows={[
                ["Emergency", summary.triage.emergency],
                ["Urgent", summary.triage.urgent],
                ["Regular", summary.triage.regular],
                ["Follow-up", summary.triage.followUp],
              ]}
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p>
    </article>
  );
}

function ReportRows({ rows }: { rows: Array<[string, number]> }) {
  return (
    <div className="mt-4 divide-y divide-slate-200">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between py-3">
          <span className="text-sm font-medium text-slate-600">{label}</span>
          <span className="text-sm font-semibold text-slate-950">{value}</span>
        </div>
      ))}
    </div>
  );
}

function Input({
  label,
  onChange,
  type,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type: string;
  value: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <input className={inputClassName} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100";
