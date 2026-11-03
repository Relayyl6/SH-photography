"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sliders,
  ChevronLeft,
  Check,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  HelpCircle,
  X,
  RefreshCw,
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { BookingFieldDoc } from "@/types/firebase";

export default function AdminFormBuilderPage() {
  const [fields, setFields] = useState<BookingFieldDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Add field modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState<BookingFieldDoc["type"]>("text");
  const [newRequired, setNewRequired] = useState(false);
  const [newPlaceholder, setNewPlaceholder] = useState("");

  const loadFields = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "bookingFields"));
      const loaded: BookingFieldDoc[] = [];
      snap.forEach((d) => {
        loaded.push(d.data() as BookingFieldDoc);
      });
      // Sort by order
      loaded.sort((a, b) => (a.order || 0) - (b.order || 0));
      setFields(loaded);
    } catch (err) {
      console.error("Failed to load booking fields:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const handleToggleActive = (id: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, published: !f.published } : f))
    );
  };

  const handleToggleRequired = (id: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === fields.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...fields];
    const item = reordered[index];
    if (!item) return;
    reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, item);

    // Update order property
    const updated = reordered.map((f, i) => ({ ...f, order: i + 1 }));
    setFields(updated);
  };

  const handleDeleteField = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete the field "${label}"?`)) return;
    try {
      await deleteDoc(doc(db, "bookingFields", id));
      setFields((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Failed to delete field:", err);
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newKey.trim()) return;

    const formattedKey = newKey
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]+/g, "_");

    const newField: BookingFieldDoc = {
      id: formattedKey,
      key: formattedKey,
      label: newLabel.trim(),
      type: newType,
      required: newRequired,
      published: true,
      appliesTo: "all",
      order: fields.length + 1,
      placeholder: newPlaceholder.trim() || undefined,
      updatedAt: Date.now(),
    };

    try {
      await setDoc(doc(db, "bookingFields", newField.id), newField);
      setFields((prev) => [...prev, newField]);
      setIsAddModalOpen(false);
      setNewLabel("");
      setNewKey("");
      setNewPlaceholder("");
      setNewRequired(false);
    } catch (err) {
      console.error("Failed to add field:", err);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        if (!f) continue;
        await setDoc(
          doc(db, "bookingFields", f.id),
          { ...f, order: i + 1, updatedAt: Date.now() },
          { merge: true }
        );
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving form fields:", err);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Banner */}
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
            Booking Form Questionnaire Builder
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Live database management for all {fields.length} inquiry questionnaire fields. Toggle active questions, adjust order, or add custom fields.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1c1b1a] hover:bg-[#33312e] text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#e8491c]" />
            <span>Add Custom Field</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-bold transition-all shadow-md shadow-[#e8491c]/20 disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Fields Saved to Live Database!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save All Fields</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fields List */}
      <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0eee8]">
          <h3 className="text-sm font-bold text-[#1c1b1a]">
            Active Questionnaire Fields ({fields.filter((f) => f.published).length} of {fields.length} active)
          </h3>
          <button
            onClick={loadFields}
            className="text-xs text-[#8a867f] hover:text-[#1c1b1a] flex items-center gap-1.5 transition-colors"
            title="Reload from Firestore"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#e8491c]/20 border-t-[#e8491c] rounded-full animate-spin" />
            <p className="text-xs text-[#7a766f]">Loading questionnaire schema from Firestore...</p>
          </div>
        ) : fields.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-700">No booking fields found</p>
            <p className="text-xs text-stone-500">Run seed or add a custom field using the button above.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {fields.map((f, i) => (
              <div
                key={f.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  f.published
                    ? "bg-[#faf9f6] border-[#f0eee8] hover:border-[#dedad0]"
                    : "bg-stone-50 border-stone-200 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Order & Reorder arrows */}
                  <div className="flex items-center gap-1">
                    <span className="w-6 h-6 rounded-full bg-[#1c1b1a] text-white flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleMove(i, "up")}
                        disabled={i === 0}
                        className="p-0.5 text-stone-400 hover:text-stone-800 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMove(i, "down")}
                        disabled={i === fields.length - 1}
                        className="p-0.5 text-stone-400 hover:text-stone-800 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#1c1b1a] flex items-center gap-2">
                      <span>{f.label}</span>
                      {f.required && (
                        <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded font-semibold">
                          Required
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-[#8a867f] font-mono mt-0.5">
                      key: <span className="text-stone-700 font-semibold">{f.id}</span> · type:{" "}
                      <span className="capitalize">{f.type}</span>
                      {f.placeholder ? ` · placeholder: "${f.placeholder}"` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Required toggle */}
                  <button
                    onClick={() => handleToggleRequired(f.id)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-colors ${
                      f.required
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-white text-stone-500 border-stone-200 hover:text-stone-800"
                    }`}
                    title="Toggle Required"
                  >
                    {f.required ? "Required" : "Optional"}
                  </button>

                  {/* Active/Inactive toggle */}
                  <button
                    onClick={() => handleToggleActive(f.id)}
                    className={`text-xs font-semibold px-3 py-1 rounded-xl border flex items-center gap-1.5 transition-colors ${
                      f.published
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-stone-100 text-stone-500 border-stone-200"
                    }`}
                  >
                    {f.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{f.published ? "Active" : "Hidden"}</span>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteField(f.id, f.label)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete Field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Field Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e6e4dc] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0eee8] mb-4">
              <h3 className="text-lg font-bold text-[#1c1b1a]">Add Questionnaire Question</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddField} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  Question / Field Label *
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => {
                    setNewLabel(e.target.value);
                    if (!newKey) {
                      setNewKey(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
                    }
                  }}
                  placeholder="e.g. Ceremony Venue Name"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  Field Key (ID) *
                </label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. ceremony_venue"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a] font-mono focus:ring-2 focus:ring-[#e8491c]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Input Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                  >
                    <option value="text">Text (Single Line)</option>
                    <option value="textarea">Textarea (Multi-line)</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone Number</option>
                    <option value="date">Date</option>
                    <option value="select">Dropdown Select</option>
                    <option value="checkbox">Checkbox Toggle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Requirement
                  </label>
                  <select
                    value={newRequired ? "true" : "false"}
                    onChange={(e) => setNewRequired(e.target.value === "true")}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                  >
                    <option value="false">Optional</option>
                    <option value="true">Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  Placeholder Text (Optional)
                </label>
                <input
                  type="text"
                  value={newPlaceholder}
                  onChange={(e) => setNewPlaceholder(e.target.value)}
                  placeholder="e.g. Victoria Baths, Manchester"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0eee8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#e6e4dc] text-xs font-semibold text-[#55524c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#e8491c] text-white text-xs font-bold hover:bg-[#d03d12]"
                >
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
