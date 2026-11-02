"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sliders, ChevronLeft, Check, Sparkles, Plus, Trash2 } from "lucide-react";

interface FieldItem {
  id: string;
  label: string;
  key: string;
  type: string;
  required: boolean;
}

const DEFAULT_FIELDS: FieldItem[] = [
  { id: "1", label: "Full Name", key: "name", type: "text", required: true },
  { id: "2", label: "Email Address", key: "email", type: "email", required: true },
  { id: "3", label: "Phone Number", key: "phone", type: "phone", required: true },
  { id: "4", label: "Preferred Shoot Date", key: "date", type: "date", required: true },
  { id: "5", label: "Location or Venue", key: "location", type: "text", required: false },
  { id: "6", label: "Creative Notes & Requests", key: "notes", type: "textarea", required: false },
];

export default function AdminFormBuilderPage() {
  const [fields, setFields] = useState<FieldItem[]>(DEFAULT_FIELDS);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e6df] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin"
              className="text-xs font-semibold text-[#8a867f] hover:text-[#1c1b1a] inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c1b1a]">
            Booking Form Builder
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Configure the questionnaire questions asked to clients when booking shoots on the public website.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-bold transition-all shadow-md shadow-[#e8491c]/20"
        >
          {saved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <span>{saved ? "Fields Saved!" : "Save Form Fields"}</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#1c1b1a]">Active Form Fields</h3>
        <div className="space-y-3">
          {fields.map((f, i) => (
            <div
              key={f.id}
              className="p-4 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1c1b1a] text-white flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs font-bold text-[#1c1b1a]">{f.label}</p>
                  <p className="text-[11px] text-[#8a867f] font-mono">
                    key: {f.key} · type: {f.type} · {f.required ? "Required" : "Optional"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
