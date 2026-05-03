"use client";

import { useState } from "react";
import { DoctorWorkflow } from "./DoctorWorkflow";
import { NurseWorkflow } from "./NurseWorkflow";

type Workspace = "nurse" | "doctor";

const workspaceOptions: Array<{ value: Workspace; label: string }> = [
  { value: "nurse", label: "Nurse Intake" },
  { value: "doctor", label: "Doctor Consultation" },
];

export function ClinicWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace>("nurse");

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
          <span className="text-sm font-semibold text-slate-700">Clinical Workspace</span>
          <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1 text-sm font-medium">
            {workspaceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`rounded-md px-3 py-1.5 transition ${
                  workspace === option.value
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-950"
                }`}
                onClick={() => setWorkspace(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {workspace === "nurse" ? <NurseWorkflow /> : <DoctorWorkflow />}
    </div>
  );
}
