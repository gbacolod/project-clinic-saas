"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { apiRequest, getErrorMessage } from "../lib/api";

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  phone?: string | null;
  email?: string | null;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadPatients();
  }, []);

  async function loadPatients(searchTerm = search) {
    setError("");
    setIsLoading(true);

    try {
      const query = new URLSearchParams({ limit: "50" });
      if (searchTerm.trim()) {
        query.set("search", searchTerm.trim());
      }

      setPatients(await apiRequest<Patient[]>(`/api/patients?${query.toString()}`));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadPatients();
  }

  return (
    <AppShell title="Patients">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form className="flex flex-1 gap-2" onSubmit={submitSearch}>
            <input
              className={inputClassName}
              placeholder="Search name, phone, email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className={buttonClassName} disabled={isLoading} type="submit">
              {isLoading ? "Searching" : "Search"}
            </button>
          </form>
          <Link className="rounded-lg bg-teal-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-teal-800" href="/patients/create">
            New patient
          </Link>
        </div>

        {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}

        <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Date of birth</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {patient.lastName}, {patient.firstName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "Not recorded"}</td>
                  <td className="px-4 py-3 text-slate-600">{patient.phone || "Not recorded"}</td>
                  <td className="px-4 py-3 text-slate-600">{patient.email || "Not recorded"}</td>
                </tr>
              ))}
              {patients.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-slate-500" colSpan={4}>
                    No patients found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

const inputClassName =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

const buttonClassName =
  "h-11 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300";
