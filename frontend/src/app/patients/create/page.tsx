"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { apiRequest, getErrorMessage } from "../../lib/api";

type PatientForm = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
};

const initialForm: PatientForm = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  address: "",
};

export default function CreatePatientPage() {
  const [form, setForm] = useState<PatientForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submitPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await apiRequest("/api/patients", {
        method: "POST",
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          dateOfBirth: form.dateOfBirth || undefined,
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          address: form.address.trim() || undefined,
        }),
      });
      setForm(initialForm);
      setMessage("Patient created.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell title="Create Patient">
      <form className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5" onSubmit={submitPatient}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="First name" required value={form.firstName} onChange={(value) => setForm((current) => ({ ...current, firstName: value }))} />
          <Input label="Last name" required value={form.lastName} onChange={(value) => setForm((current) => ({ ...current, lastName: value }))} />
          <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={(value) => setForm((current) => ({ ...current, dateOfBirth: value }))} />
          <Input label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
          <Input label="Address" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} />
        </div>

        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
        {message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{message}</p> : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button className={buttonClassName} disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving" : "Save patient"}
          </button>
          <Link className="rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100" href="/patients">
            Back to patients
          </Link>
        </div>
      </form>
    </AppShell>
  );
}

function Input({
  label,
  onChange,
  required,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <input className={inputClassName} required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

const buttonClassName =
  "h-11 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300";
