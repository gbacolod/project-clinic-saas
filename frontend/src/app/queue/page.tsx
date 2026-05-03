"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { apiRequest, getErrorMessage } from "../lib/api";

type Priority = "emergency" | "urgent" | "regular" | "follow_up";

type QueueEntry = {
  id: string;
  priority?: Priority;
  status: string;
  queuedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  patient: {
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
  triage?: {
    priority: Priority;
    chiefComplaint?: string | null;
  } | null;
};

const columns = [
  { status: "waiting", label: "Waiting" },
  { status: "in_consultation", label: "In Consultation" },
  { status: "completed", label: "Completed" },
];

const priorityRank: Record<Priority, number> = {
  emergency: 0,
  urgent: 1,
  regular: 2,
  follow_up: 3,
};

const priorityStyles: Record<Priority, string> = {
  emergency: "border-red-300 bg-red-50 text-red-800",
  urgent: "border-amber-300 bg-amber-50 text-amber-800",
  regular: "border-sky-300 bg-sky-50 text-sky-800",
  follow_up: "border-emerald-300 bg-emerald-50 text-emerald-800",
};

const priorityLabels: Record<Priority, string> = {
  emergency: "Emergency",
  urgent: "Urgent",
  regular: "Regular",
  follow_up: "Follow-up",
};

export default function QueuePage() {
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadQueue();
  }, []);

  async function loadQueue() {
    setError("");
    setIsLoading(true);

    try {
      const queueEntries = await apiRequest<QueueEntry[]>("/api/queue?limit=100");
      setEntries(sortQueue(queueEntries));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell title="Queue Board">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-500">{entries.length} queue entries</p>
          <button className={buttonClassName} disabled={isLoading} type="button" onClick={() => void loadQueue()}>
            {isLoading ? "Refreshing" : "Refresh"}
          </button>
        </div>

        {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {columns.map((column) => {
            const columnEntries = entries.filter((entry) => entry.status === column.status);

            return (
              <div key={column.status} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">{column.label}</h2>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{columnEntries.length}</span>
                </div>
                <div className="mt-3 grid gap-3">
                  {columnEntries.map((entry) => (
                    <QueueCard key={entry.id} entry={entry} />
                  ))}
                  {columnEntries.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-8 text-center text-sm text-slate-500">
                      Empty
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}

function QueueCard({ entry }: { entry: QueueEntry }) {
  const priority = getPriority(entry);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">
            {entry.patient.lastName}, {entry.patient.firstName}
          </h3>
          <p className="mt-1 text-xs text-slate-500">{formatDateTime(entry.queuedAt)}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyles[priority]}`}>
          {priorityLabels[priority]}
        </span>
      </div>
      {entry.triage?.chiefComplaint ? <p className="mt-3 text-sm leading-6 text-slate-600">{entry.triage.chiefComplaint}</p> : null}
      {entry.patient.phone ? <p className="mt-2 text-xs font-medium text-slate-500">{entry.patient.phone}</p> : null}
    </article>
  );
}

function sortQueue(entries: QueueEntry[]) {
  return [...entries].sort((left, right) => {
    const priorityDiff = priorityRank[getPriority(left)] - priorityRank[getPriority(right)];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return new Date(left.queuedAt).getTime() - new Date(right.queuedAt).getTime();
  });
}

function getPriority(entry: QueueEntry): Priority {
  return entry.priority ?? entry.triage?.priority ?? "regular";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

const buttonClassName =
  "h-11 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300";
