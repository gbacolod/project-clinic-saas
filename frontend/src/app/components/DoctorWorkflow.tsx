"use client";

import { FormEvent, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Priority = "emergency" | "urgent" | "regular" | "follow_up";

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  visits?: VisitHistory[];
};

type VisitHistory = {
  id: string;
  startedAt: string;
  endedAt?: string | null;
  diagnosis?: string | null;
  prescriptionNotes?: string | null;
};

type Triage = {
  id: string;
  priority: Priority;
  chiefComplaint?: string | null;
  notes?: string | null;
  vitals?: Record<string, unknown> | null;
  createdAt: string;
};

type QueueEntry = {
  id: string;
  priority: Priority;
  queuedAt: string;
  status: string;
  patient: Patient;
  triage?: Triage | null;
};

type Consultation = {
  queueEntry: QueueEntry;
  visit: {
    id: string;
    diagnosis?: string | null;
    prescriptionNotes?: string | null;
    notes?: string | null;
    startedAt: string;
    endedAt?: string | null;
  };
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

export function DoctorWorkflow() {
  const [doctorId, setDoctorId] = useState("");
  const [nextPatient, setNextPatient] = useState<QueueEntry | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeQueueEntry = consultation?.queueEntry ?? nextPatient;
  const patient = activeQueueEntry?.patient;
  const triage = activeQueueEntry?.triage;

  const vitals = useMemo(() => {
    if (!triage?.vitals) {
      return [];
    }

    return Object.entries(triage.vitals).filter(([, value]) => value !== undefined && value !== null && value !== "");
  }, [triage?.vitals]);

  async function getNextPatient() {
    setError("");
    setMessage("");
    setIsLoadingNext(true);

    try {
      const query = new URLSearchParams();
      if (doctorId.trim()) {
        query.set("doctorId", doctorId.trim());
      }

      const queryString = query.toString();
      const path = queryString
        ? `/api/doctor-workflow/next-patient?${queryString}`
        : "/api/doctor-workflow/next-patient";
      const queueEntry = await apiRequest<QueueEntry | null>(path);
      setNextPatient(queueEntry);
      setConsultation(null);
      setDiagnosis("");
      setPrescriptionNotes("");
      setNotes("");
      setMessage(queueEntry ? "" : "No waiting patients in queue.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoadingNext(false);
    }
  }

  async function startConsultation() {
    if (!nextPatient) {
      setError("Load the next patient first.");
      return;
    }

    setError("");
    setMessage("");
    setIsStarting(true);

    try {
      const result = await apiRequest<Consultation>("/api/doctor-workflow/consultations/start", {
        method: "POST",
        body: JSON.stringify({
          queueEntryId: nextPatient.id,
          doctorId: doctorId.trim() || undefined,
        }),
      });

      setConsultation(result);
      setNextPatient(null);
      setMessage("Consultation started.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsStarting(false);
    }
  }

  async function completeConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!consultation) {
      setError("Start a consultation first.");
      return;
    }

    setError("");
    setMessage("");
    setIsCompleting(true);

    try {
      await apiRequest(`/api/doctor-workflow/consultations/${consultation.visit.id}/complete`, {
        method: "PATCH",
        body: JSON.stringify({
          diagnosis: diagnosis.trim(),
          prescriptionNotes: prescriptionNotes.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      setMessage("Visit completed and queue updated.");
      setConsultation(null);
      setNextPatient(null);
      setDiagnosis("");
      setPrescriptionNotes("");
      setNotes("");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">Clinic SaaS</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">Doctor Consultation</h1>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <label className="sr-only" htmlFor="doctor-id">
              Doctor ID
            </label>
            <input
              className={inputClassName}
              id="doctor-id"
              placeholder="Doctor ID"
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
            />
            <button className={primaryButtonClassName} disabled={isLoadingNext} type="button" onClick={getNextPatient}>
              {isLoadingNext ? "Loading" : "Get next"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[0.95fr_1.05fr_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Patient Details</h2>
            {activeQueueEntry ? (
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyles[activeQueueEntry.priority]}`}>
                {priorityLabels[activeQueueEntry.priority]}
              </span>
            ) : null}
          </div>

          {patient ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-slate-500">Patient</p>
                <h3 className="mt-1 text-xl font-semibold">
                  {patient.lastName}, {patient.firstName}
                </h3>
              </div>
              <Detail label="Date of birth" value={patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "Not recorded"} />
              <Detail label="Phone" value={patient.phone || "Not recorded"} />
              <Detail label="Email" value={patient.email || "Not recorded"} />
              <Detail label="Address" value={patient.address || "Not recorded"} />
              <Detail label="Arrival" value={formatDateTime(activeQueueEntry.queuedAt)} />
            </div>
          ) : (
            <EmptyState text="Use Get next to load the next waiting patient." />
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Triage Data</h2>

          {triage ? (
            <div className="mt-5 space-y-4">
              <Detail label="Chief complaint" value={triage.chiefComplaint || "Not recorded"} />
              <Detail label="Triage time" value={formatDateTime(triage.createdAt)} />
              <Detail label="Triage notes" value={triage.notes || "Not recorded"} />

              <div>
                <p className="text-sm font-medium text-slate-500">Vitals</p>
                {vitals.length > 0 ? (
                  <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                    {vitals.map(([key, value]) => (
                      <div key={key} className="rounded-lg border border-slate-200 px-3 py-2">
                        <dt className="text-xs font-medium capitalize text-slate-500">{formatVitalsLabel(key)}</dt>
                        <dd className="mt-1 text-sm font-semibold text-slate-900">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-2 rounded-lg border border-dashed border-slate-300 px-3 py-5 text-sm text-slate-500">
                    No vitals recorded.
                  </p>
                )}
              </div>

              {!consultation ? (
                <button
                  className={primaryButtonClassName}
                  disabled={isStarting || !activeQueueEntry}
                  type="button"
                  onClick={startConsultation}
                >
                  {isStarting ? "Starting" : "Start consultation"}
                </button>
              ) : (
                <p className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">
                  Consultation in progress.
                </p>
              )}
            </div>
          ) : (
            <EmptyState text="Triage data appears when a patient is selected." />
          )}
        </section>

        <form className="rounded-lg border border-slate-200 bg-white p-5" onSubmit={completeConsultation}>
          <h2 className="text-lg font-semibold">Visit Completion</h2>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Diagnosis
              <textarea
                required
                className={`${inputClassName} min-h-28 resize-y py-3`}
                disabled={!consultation}
                maxLength={1000}
                minLength={2}
                value={diagnosis}
                onChange={(event) => setDiagnosis(event.target.value)}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Prescription notes
              <textarea
                required
                className={`${inputClassName} min-h-28 resize-y py-3`}
                disabled={!consultation}
                maxLength={2000}
                minLength={2}
                value={prescriptionNotes}
                onChange={(event) => setPrescriptionNotes(event.target.value)}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Follow-up notes
              <textarea
                className={`${inputClassName} min-h-20 resize-y py-3`}
                disabled={!consultation}
                maxLength={4000}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>

            {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
            {message ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{message}</p>
            ) : null}

            <button className={primaryButtonClassName} disabled={!consultation || isCompleting} type="submit">
              {isCompleting ? "Completing" : "Complete visit"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="mt-5 rounded-lg border border-dashed border-slate-300 px-3 py-8 text-center text-sm text-slate-500">
      {text}
    </p>
  );
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    throw new Error(message ?? `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatVitalsLabel(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase());
}

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100";

const primaryButtonClassName =
  "h-11 rounded-lg bg-indigo-700 px-4 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-300";
