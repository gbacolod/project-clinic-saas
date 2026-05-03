"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Priority = "emergency" | "urgent" | "regular" | "follow_up";
type PatientMode = "search" | "create";

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  phone?: string | null;
  email?: string | null;
};

type QueueEntry = {
  id: string;
  priority?: Priority;
  queuedAt: string;
  status: string;
  patient: Patient;
  triage?: {
    priority: Priority;
    chiefComplaint?: string | null;
  } | null;
};

type PatientForm = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
};

type TriageForm = {
  nurseId: string;
  chiefComplaint: string;
  priority: Priority;
  notes: string;
};

type VitalsForm = {
  temperatureC: string;
  bloodPressure: string;
  heartRateBpm: string;
  respiratoryRateBpm: string;
  oxygenSaturationPercent: string;
  weightKg: string;
};

const priorityOptions: Array<{ value: Priority; label: string; styles: string }> = [
  { value: "emergency", label: "Emergency", styles: "border-red-300 bg-red-50 text-red-800" },
  { value: "urgent", label: "Urgent", styles: "border-amber-300 bg-amber-50 text-amber-800" },
  { value: "regular", label: "Regular", styles: "border-sky-300 bg-sky-50 text-sky-800" },
  { value: "follow_up", label: "Follow-up", styles: "border-emerald-300 bg-emerald-50 text-emerald-800" },
];

const priorityRank: Record<Priority, number> = {
  emergency: 0,
  urgent: 1,
  regular: 2,
  follow_up: 3,
};

const initialPatientForm: PatientForm = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  address: "",
};

const initialTriageForm: TriageForm = {
  nurseId: "",
  chiefComplaint: "",
  priority: "regular",
  notes: "",
};

const initialVitalsForm: VitalsForm = {
  temperatureC: "",
  bloodPressure: "",
  heartRateBpm: "",
  respiratoryRateBpm: "",
  oxygenSaturationPercent: "",
  weightKg: "",
};

export function NurseWorkflow() {
  const [patientMode, setPatientMode] = useState<PatientMode>("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientForm, setPatientForm] = useState<PatientForm>(initialPatientForm);
  const [triageForm, setTriageForm] = useState<TriageForm>(initialTriageForm);
  const [vitalsForm, setVitalsForm] = useState<VitalsForm>(initialVitalsForm);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activePriority = useMemo(
    () => priorityOptions.find((option) => option.value === triageForm.priority) ?? priorityOptions[2],
    [triageForm.priority],
  );

  useEffect(() => {
    void refreshQueue();
  }, []);

  async function searchPatients(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSearching(true);

    try {
      const query = new URLSearchParams({
        search: searchTerm.trim(),
        limit: "8",
      });
      const results = await apiRequest<Patient[]>(`/api/patients?${query.toString()}`);
      setPatients(results);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSearching(false);
    }
  }

  async function refreshQueue() {
    try {
      const query = new URLSearchParams({
        status: "waiting",
        limit: "50",
      });
      const entries = await apiRequest<QueueEntry[]>(`/api/queue?${query.toString()}`);
      setQueue(sortQueue(entries));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function submitCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (patientMode === "search" && !selectedPatient) {
      setError("Select a patient or create a new record.");
      return;
    }

    if (patientMode === "create" && (!patientForm.firstName.trim() || !patientForm.lastName.trim())) {
      setError("First name and last name are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("/api/nurse-workflow/check-ins", {
        method: "POST",
        body: JSON.stringify(buildCheckInPayload()),
      });

      setMessage("Patient added to queue.");
      setSelectedPatient(null);
      setPatientForm(initialPatientForm);
      setTriageForm(initialTriageForm);
      setVitalsForm(initialVitalsForm);
      await refreshQueue();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function buildCheckInPayload() {
    const patientPayload =
      patientMode === "search" && selectedPatient
        ? { patientId: selectedPatient.id }
        : {
            patient: {
              firstName: patientForm.firstName.trim(),
              lastName: patientForm.lastName.trim(),
              dateOfBirth: patientForm.dateOfBirth || undefined,
              phone: patientForm.phone.trim() || undefined,
              email: patientForm.email.trim() || undefined,
              address: patientForm.address.trim() || undefined,
            },
          };

    return {
      ...patientPayload,
      nurseId: triageForm.nurseId.trim() || undefined,
      chiefComplaint: triageForm.chiefComplaint.trim(),
      priority: triageForm.priority,
      notes: triageForm.notes.trim() || undefined,
      vitals: buildVitalsPayload(),
    };
  }

  function buildVitalsPayload() {
    return removeEmptyValues({
      temperatureC: toOptionalNumber(vitalsForm.temperatureC),
      bloodPressure: vitalsForm.bloodPressure.trim() || undefined,
      heartRateBpm: toOptionalNumber(vitalsForm.heartRateBpm),
      respiratoryRateBpm: toOptionalNumber(vitalsForm.respiratoryRateBpm),
      oxygenSaturationPercent: toOptionalNumber(vitalsForm.oxygenSaturationPercent),
      weightKg: toOptionalNumber(vitalsForm.weightKg),
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Clinic SaaS</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">Nurse Intake</h1>
          </div>
          <button
            className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            type="button"
            onClick={() => void refreshQueue()}
          >
            Refresh queue
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[1fr_1.15fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Patient</h2>
            <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1 text-sm font-medium">
              {(["search", "create"] as PatientMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`rounded-md px-3 py-1.5 capitalize transition ${
                    patientMode === mode ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
                  }`}
                  onClick={() => {
                    setPatientMode(mode);
                    setSelectedPatient(null);
                    setMessage("");
                    setError("");
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {patientMode === "search" ? (
            <div className="mt-5 space-y-4">
              <form className="flex gap-2" onSubmit={searchPatients}>
                <label className="sr-only" htmlFor="patient-search">
                  Patient search
                </label>
                <input
                  required
                  className={inputClassName}
                  id="patient-search"
                  minLength={2}
                  placeholder="Name, phone, email"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <button className={primaryButtonClassName} disabled={isSearching} type="submit">
                  {isSearching ? "Searching" : "Search"}
                </button>
              </form>

              <div className="space-y-2">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedPatient?.id === patient.id
                        ? "border-teal-400 bg-teal-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <span className="block text-sm font-semibold">
                      {patient.lastName}, {patient.firstName}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {[patient.phone, patient.email].filter(Boolean).join(" / ") || "No contact on file"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="First name"
                  required
                  value={patientForm.firstName}
                  onChange={(value) => setPatientForm((current) => ({ ...current, firstName: value }))}
                />
                <Input
                  label="Last name"
                  required
                  value={patientForm.lastName}
                  onChange={(value) => setPatientForm((current) => ({ ...current, lastName: value }))}
                />
              </div>
              <Input
                label="Date of birth"
                type="date"
                value={patientForm.dateOfBirth}
                onChange={(value) => setPatientForm((current) => ({ ...current, dateOfBirth: value }))}
              />
              <Input
                label="Phone"
                value={patientForm.phone}
                onChange={(value) => setPatientForm((current) => ({ ...current, phone: value }))}
              />
              <Input
                label="Email"
                type="email"
                value={patientForm.email}
                onChange={(value) => setPatientForm((current) => ({ ...current, email: value }))}
              />
              <Input
                label="Address"
                value={patientForm.address}
                onChange={(value) => setPatientForm((current) => ({ ...current, address: value }))}
              />
            </div>
          )}
        </section>

        <form className="rounded-lg border border-slate-200 bg-white p-5" onSubmit={submitCheckIn}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Triage</h2>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${activePriority.styles}`}>
              {activePriority.label}
            </span>
          </div>

          <div className="mt-5 grid gap-4">
            <Input
              label="Nurse ID"
              value={triageForm.nurseId}
              onChange={(value) => setTriageForm((current) => ({ ...current, nurseId: value }))}
            />
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Chief complaint
              <textarea
                required
                className={`${inputClassName} min-h-24 resize-y py-3`}
                maxLength={255}
                value={triageForm.chiefComplaint}
                onChange={(event) =>
                  setTriageForm((current) => ({ ...current, chiefComplaint: event.target.value }))
                }
              />
            </label>

            <fieldset>
              <legend className="text-sm font-medium text-slate-700">Priority</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`min-h-11 rounded-lg border px-3 text-sm font-semibold transition ${
                      triageForm.priority === option.value
                        ? option.styles
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    onClick={() => setTriageForm((current) => ({ ...current, priority: option.value }))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <h3 className="text-sm font-medium text-slate-700">Vitals</h3>
              <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Input
                  label="Temp C"
                  type="number"
                  step="0.1"
                  value={vitalsForm.temperatureC}
                  onChange={(value) => setVitalsForm((current) => ({ ...current, temperatureC: value }))}
                />
                <Input
                  label="Blood pressure"
                  value={vitalsForm.bloodPressure}
                  onChange={(value) => setVitalsForm((current) => ({ ...current, bloodPressure: value }))}
                />
                <Input
                  label="Heart rate"
                  type="number"
                  value={vitalsForm.heartRateBpm}
                  onChange={(value) => setVitalsForm((current) => ({ ...current, heartRateBpm: value }))}
                />
                <Input
                  label="Resp. rate"
                  type="number"
                  value={vitalsForm.respiratoryRateBpm}
                  onChange={(value) => setVitalsForm((current) => ({ ...current, respiratoryRateBpm: value }))}
                />
                <Input
                  label="SpO2 %"
                  type="number"
                  value={vitalsForm.oxygenSaturationPercent}
                  onChange={(value) =>
                    setVitalsForm((current) => ({ ...current, oxygenSaturationPercent: value }))
                  }
                />
                <Input
                  label="Weight kg"
                  type="number"
                  step="0.1"
                  value={vitalsForm.weightKg}
                  onChange={(value) => setVitalsForm((current) => ({ ...current, weightKg: value }))}
                />
              </div>
            </div>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Notes
              <textarea
                className={`${inputClassName} min-h-20 resize-y py-3`}
                maxLength={2000}
                value={triageForm.notes}
                onChange={(event) => setTriageForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </label>

            {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
            {message ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{message}</p>
            ) : null}

            <button className={primaryButtonClassName} disabled={isSubmitting} type="submit">
              {isSubmitting ? "Adding" : "Add to queue"}
            </button>
          </div>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Waiting Queue</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {queue.length}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {queue.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 px-3 py-8 text-center text-sm text-slate-500">
                Queue is empty.
              </p>
            ) : (
              queue.map((entry) => {
                const priority = getQueuePriority(entry);
                const option = priorityOptions.find((item) => item.value === priority) ?? priorityOptions[2];

                return (
                  <article key={entry.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold">
                          {entry.patient.lastName}, {entry.patient.firstName}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">{formatArrival(entry.queuedAt)}</p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${option.styles}`}>
                        {option.label}
                      </span>
                    </div>
                    {entry.triage?.chiefComplaint ? (
                      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{entry.triage.chiefComplaint}</p>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Input({
  label,
  onChange,
  required,
  step,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  step?: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <input
        className={inputClassName}
        required={required}
        step={step}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
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

function sortQueue(entries: QueueEntry[]) {
  return [...entries].sort((left, right) => {
    const priorityDiff = priorityRank[getQueuePriority(left)] - priorityRank[getQueuePriority(right)];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return new Date(left.queuedAt).getTime() - new Date(right.queuedAt).getTime();
  });
}

function getQueuePriority(entry: QueueEntry): Priority {
  return entry.priority ?? entry.triage?.priority ?? "regular";
}

function formatArrival(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function toOptionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function removeEmptyValues(values: Record<string, string | number | undefined>) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== ""));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

const primaryButtonClassName =
  "h-11 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300";
