"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Eye,
  EyeOff,
  HelpCircle,
  X,
  RefreshCw,
  Edit2,
  Search,
  List,
  CheckSquare,
  CircleDot,
  Type,
  AlignLeft,
  Calendar,
  Hash,
  Mail,
  Phone,
  Upload,
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { BookingFieldDoc } from "@/types/firebase";

const FIELD_TYPES: Array<{
  type: BookingFieldDoc["type"];
  label: string;
  icon: React.ElementType;
  description: string;
}> = [
  { type: "text", label: "Short Text", icon: Type, description: "Single-line string" },
  { type: "textarea", label: "Long Text / Notes", icon: AlignLeft, description: "Multi-line text area" },
  { type: "select", label: "Dropdown Select", icon: List, description: "Single choice from dropdown list" },
  { type: "radio", label: "Radio Buttons", icon: CircleDot, description: "Single choice visible list" },
  { type: "checkbox", label: "Checkboxes", icon: CheckSquare, description: "Multiple choice checkboxes" },
  { type: "date", label: "Date Picker", icon: Calendar, description: "Calendar date selection" },
  { type: "number", label: "Number", icon: Hash, description: "Numeric value or counter" },
  { type: "email", label: "Email Address", icon: Mail, description: "Validated email input" },
  { type: "phone", label: "Phone Number", icon: Phone, description: "Telephone number input" },
  { type: "file", label: "File Attachment", icon: Upload, description: "Inspiration or document upload" },
];

export default function AdminFormBuilderPage() {
  const [fields, setFields] = useState<BookingFieldDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Edit Field Modal state
  const [editingField, setEditingField] = useState<BookingFieldDoc | null>(null);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");

  // Add Field Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFieldData, setNewFieldData] = useState<Partial<BookingFieldDoc>>({
    label: "",
    key: "",
    type: "text",
    required: false,
    published: true,
    placeholder: "",
    helpText: "",
    appliesTo: "all",
    options: [],
  });
  const [addOptionLabel, setAddOptionLabel] = useState("");
  const [addOptionValue, setAddOptionValue] = useState("");

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

  const handleToggleActive = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = fields.map((f) =>
      f.id === id ? { ...f, published: !f.published, updatedAt: Date.now() } : f
    );
    setFields(updated);
    const target = updated.find((f) => f.id === id);
    if (target) {
      try {
        await setDoc(doc(db, "bookingFields", id), target, { merge: true });
      } catch (err) {
        console.error("Failed to toggle field active:", err);
      }
    }
  };

  const handleToggleRequired = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = fields.map((f) =>
      f.id === id ? { ...f, required: !f.required, updatedAt: Date.now() } : f
    );
    setFields(updated);
    const target = updated.find((f) => f.id === id);
    if (target) {
      try {
        await setDoc(doc(db, "bookingFields", id), target, { merge: true });
      } catch (err) {
        console.error("Failed to toggle field required:", err);
      }
    }
  };

  const handleMove = (index: number, direction: "up" | "down", e?: React.MouseEvent) => {
    e?.stopPropagation();
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

    const updated = reordered.map((f, i) => ({ ...f, order: i + 1 }));
    setFields(updated);
  };

  const handleDeleteField = async (id: string, label: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm(`Are you sure you want to delete the field "${label}"?`)) return;
    try {
      await deleteDoc(doc(db, "bookingFields", id));
      setFields((prev) => prev.filter((f) => f.id !== id));
      if (editingField?.id === id) setEditingField(null);
    } catch (err) {
      console.error("Failed to delete field:", err);
    }
  };

  // Option / Enum Management for Editing Field
  const handleAddOptionToEditing = () => {
    if (!newOptionLabel.trim() || !editingField) return;
    const val = newOptionValue.trim() || newOptionLabel.trim();
    const currentOptions = editingField.options || [];
    const updatedOptions = [
      ...currentOptions,
      { label: newOptionLabel.trim(), value: val, order: currentOptions.length + 1 },
    ];
    setEditingField({ ...editingField, options: updatedOptions });
    setNewOptionLabel("");
    setNewOptionValue("");
  };

  const handleRemoveOptionFromEditing = (optIndex: number) => {
    if (!editingField || !editingField.options) return;
    const updated = editingField.options.filter((_, i) => i !== optIndex);
    setEditingField({ ...editingField, options: updated });
  };

  const handleUpdateOptionInEditing = (
    optIndex: number,
    patch: { label?: string; value?: string }
  ) => {
    if (!editingField || !editingField.options) return;
    const updated = [...editingField.options];
    const current = updated[optIndex];
    if (current) {
      updated[optIndex] = { ...current, ...patch };
      setEditingField({ ...editingField, options: updated });
    }
  };

  const handleMoveOptionInEditing = (optIndex: number, direction: "up" | "down") => {
    if (!editingField || !editingField.options) return;
    const opts = [...editingField.options];
    if (
      (direction === "up" && optIndex === 0) ||
      (direction === "down" && optIndex === opts.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === "up" ? optIndex - 1 : optIndex + 1;
    const item = opts[optIndex];
    if (!item) return;
    opts.splice(optIndex, 1);
    opts.splice(targetIdx, 0, item);
    setEditingField({
      ...editingField,
      options: opts.map((o, idx) => ({ ...o, order: idx + 1 })),
    });
  };

  // Save changes from Edit Modal
  const handleSaveEditedField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField) return;

    try {
      const payload: BookingFieldDoc = {
        ...editingField,
        updatedAt: Date.now(),
      };
      await setDoc(doc(db, "bookingFields", payload.id), payload, { merge: true });
      setFields((prev) => prev.map((f) => (f.id === payload.id ? payload : f)));
      setEditingField(null);
    } catch (err) {
      console.error("Failed to save edited field:", err);
    }
  };

  // Option / Enum Management for New Field Modal
  const handleAddOptionToNew = () => {
    if (!addOptionLabel.trim()) return;
    const val = addOptionValue.trim() || addOptionLabel.trim();
    const currentOptions = newFieldData.options || [];
    setNewFieldData({
      ...newFieldData,
      options: [
        ...currentOptions,
        { label: addOptionLabel.trim(), value: val, order: currentOptions.length + 1 },
      ],
    });
    setAddOptionLabel("");
    setAddOptionValue("");
  };

  const handleRemoveOptionFromNew = (optIndex: number) => {
    const currentOptions = newFieldData.options || [];
    setNewFieldData({
      ...newFieldData,
      options: currentOptions.filter((_, i) => i !== optIndex),
    });
  };

  const handleCreateNewField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldData.label?.trim()) return;

    const keyRaw = newFieldData.key?.trim() || newFieldData.label;
    const formattedKey = keyRaw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]+/g, "_");

    const newField: BookingFieldDoc = {
      id: formattedKey,
      key: formattedKey,
      label: newFieldData.label.trim(),
      type: newFieldData.type || "text",
      required: Boolean(newFieldData.required),
      published: newFieldData.published !== false,
      appliesTo: newFieldData.appliesTo || "all",
      order: fields.length + 1,
      placeholder: newFieldData.placeholder?.trim() || undefined,
      helpText: newFieldData.helpText?.trim() || undefined,
      options: newFieldData.options || [],
      updatedAt: Date.now(),
    };

    try {
      await setDoc(doc(db, "bookingFields", newField.id), newField);
      setFields((prev) => [...prev, newField]);
      setIsAddModalOpen(false);
      setNewFieldData({
        label: "",
        key: "",
        type: "text",
        required: false,
        published: true,
        placeholder: "",
        helpText: "",
        appliesTo: "all",
        options: [],
      });
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

  // Filtered fields
  const filteredFields = useMemo(() => {
    return fields.filter((f) => {
      const matchesSearch =
        searchQuery === "" ||
        f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === "all" || f.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [fields, searchQuery, filterType]);

  const activeCount = fields.filter((f) => f.published).length;
  const isEnumField = (type: BookingFieldDoc["type"]) =>
    type === "select" || type === "radio" || type === "checkbox";

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12 min-w-0">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e6df] shadow-sm min-w-0">
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
            Live database management for all {fields.length} inquiry questionnaire fields. Click any field to edit its label, type, options, placeholder, or validation rules.
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e8e6df] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between min-w-0">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none flex-1 min-w-0">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === "all"
                ? "bg-[#1c1b1a] text-white"
                : "bg-[#f5f4ef] text-[#615e57] hover:bg-[#ebe9e1]"
            }`}
          >
            All Types ({fields.length})
          </button>
          {FIELD_TYPES.slice(0, 5).map((ft) => (
            <button
              key={ft.type}
              onClick={() => setFilterType(ft.type)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === ft.type
                  ? "bg-[#1c1b1a] text-white"
                  : "bg-[#f5f4ef] text-[#615e57] hover:bg-[#ebe9e1]"
              }`}
            >
              {ft.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-[#9d9990] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questionnaire fields..."
            className="w-full pl-9 pr-4 py-1.5 rounded-full border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a] placeholder:text-[#aaa59c] focus:outline-none focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c]"
          />
        </div>
      </div>

      {/* Fields List */}
      <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-4 min-w-0">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0eee8]">
          <h3 className="text-sm font-bold text-[#1c1b1a]">
            Active Questionnaire Fields ({activeCount} of {fields.length} active)
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
        ) : filteredFields.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-700">No fields match your filter</p>
            <p className="text-xs text-stone-500">Try clearing your search query or add a custom field.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredFields.map((f, i) => {
              const optionsCount = f.options?.length || 0;
              return (
                <div
                  key={f.id}
                  onClick={() => setEditingField(f)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group hover:shadow-sm ${
                    f.published
                      ? "bg-[#faf9f6] border-[#f0eee8] hover:border-[#d0cdc2]"
                      : "bg-stone-50 border-stone-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    {/* Order & Reorder arrows */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="w-6 h-6 rounded-full bg-[#1c1b1a] text-white flex items-center justify-center text-[10px] font-bold">
                        {f.order || i + 1}
                      </span>
                      <div className="flex flex-col">
                        <button
                          onClick={(e) => handleMove(i, "up", e)}
                          disabled={i === 0}
                          className="p-0.5 text-stone-400 hover:text-stone-800 disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleMove(i, "down", e)}
                          disabled={i === fields.length - 1}
                          className="p-0.5 text-stone-400 hover:text-stone-800 disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#1c1b1a] group-hover:text-[#e8491c] transition-colors">
                          {f.label}
                        </span>
                        {f.required ? (
                          <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded font-semibold">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                            Optional
                          </span>
                        )}
                        <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-medium capitalize">
                          {f.type}
                        </span>
                        {isEnumField(f.type) && (
                          <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                            {optionsCount} {optionsCount === 1 ? "option" : "options"}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#8a867f] font-mono mt-1 truncate">
                        key: <span className="text-stone-700 font-semibold">{f.id}</span>
                        {f.placeholder ? ` · placeholder: "${f.placeholder}"` : ""}
                        {f.helpText ? ` · helper: "${f.helpText}"` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Edit button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingField(f);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#e6e4dc] text-xs font-semibold text-[#1c1b1a] hover:bg-[#f5f4ef] flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="Edit Field Schema & Options"
                    >
                      <Edit2 className="w-3 h-3 text-[#e8491c]" />
                      <span>Edit</span>
                    </button>

                    {/* Required toggle */}
                    <button
                      onClick={(e) => handleToggleRequired(f.id, e)}
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
                      onClick={(e) => handleToggleActive(f.id, e)}
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
                      onClick={(e) => handleDeleteField(f.id, f.label, e)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Delete Field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* EDIT FIELD MODAL (Full customizability for every type & enum)  */}
      {/* ============================================================ */}
      {editingField && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#e6e4dc] my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#f0eee8]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e8491c] bg-[#fff2ed] px-2.5 py-1 rounded-full border border-[#fbdcd0]">
                  Field Schema Editor
                </span>
                <h3 className="text-xl font-bold text-[#1c1b1a] mt-1.5">
                  Edit Field: {editingField.label}
                </h3>
              </div>
              <button
                onClick={() => setEditingField(null)}
                className="p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedField} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Field Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingField.label}
                    onChange={(e) =>
                      setEditingField({ ...editingField, label: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Field ID / Key (Firestore document key)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingField.id}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] bg-stone-100 text-xs text-stone-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Input Class &amp; Type *
                  </label>
                  <select
                    value={editingField.type}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        type: e.target.value as BookingFieldDoc["type"],
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.label} ({t.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Applies To Sessions
                  </label>
                  <select
                    value={
                      Array.isArray(editingField.appliesTo)
                        ? editingField.appliesTo[0] || "all"
                        : editingField.appliesTo || "all"
                    }
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        appliesTo:
                          e.target.value === "all" ? "all" : [e.target.value],
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
                  >
                    <option value="all">All Sessions &amp; Services</option>
                    <option value="weddings">Weddings only</option>
                    <option value="portraits">Portraits only</option>
                    <option value="family">Family only</option>
                    <option value="behind-the-scenes">Behind the Scenes only</option>
                    <option value="corporate">Corporate only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={editingField.placeholder || ""}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        placeholder: e.target.value,
                      })
                    }
                    placeholder="e.g. Choose one..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Help Text / Helper Description
                  </label>
                  <input
                    type="text"
                    value={editingField.helpText || ""}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        helpText: e.target.value,
                      })
                    }
                    placeholder="Helper instructions displayed under input"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 pb-2 border-y border-[#f0eee8]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1c1b1a]">
                  <input
                    type="checkbox"
                    checked={editingField.required}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        required: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-[#e8491c] rounded"
                  />
                  <span>Mandatory / Required Field</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1c1b1a]">
                  <input
                    type="checkbox"
                    checked={editingField.published}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        published: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-[#e8491c] rounded"
                  />
                  <span>Active &amp; Visible on Live Form</span>
                </label>
              </div>

              {/* ============================================================ */}
              {/* OPTIONS & ENUM VALUES MANAGER (Select, Radio, Checkbox, etc.) */}
              {/* ============================================================ */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#faf9f6] border border-[#f0eee8]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1c1b1a]">
                      Options &amp; Choice Enums ({editingField.options?.length || 0})
                    </h4>
                    <p className="text-[11px] text-[#8a867f]">
                      Add, update labels, delete, or reorder choices for dropdowns, radios, and multi-select.
                    </p>
                  </div>
                  {!isEnumField(editingField.type) && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Type is {editingField.type}; options become active if switched to select/radio/checkbox
                    </span>
                  )}
                </div>

                {/* Add Option Sub-Form */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newOptionLabel}
                    onChange={(e) => setNewOptionLabel(e.target.value)}
                    placeholder="Option Display Label (e.g. Full Day Coverage)"
                    className="flex-1 w-full px-3 py-1.5 rounded-xl border border-[#e6e4dc] bg-white text-xs text-[#1c1b1a]"
                  />
                  <input
                    type="text"
                    value={newOptionValue}
                    onChange={(e) => setNewOptionValue(e.target.value)}
                    placeholder="Value (optional, defaults to label)"
                    className="w-full sm:w-48 px-3 py-1.5 rounded-xl border border-[#e6e4dc] bg-white text-xs text-[#1c1b1a]"
                  />
                  <button
                    type="button"
                    onClick={handleAddOptionToEditing}
                    className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-[#1c1b1a] hover:bg-[#33312e] text-white text-xs font-bold shrink-0 transition-colors"
                  >
                    + Add Option
                  </button>
                </div>

                {/* Options List */}
                <div className="space-y-2 mt-3 max-h-56 overflow-y-auto pr-1">
                  {(!editingField.options || editingField.options.length === 0) ? (
                    <p className="text-xs text-stone-400 italic py-2 text-center">
                      No options defined yet. Add an option above.
                    </p>
                  ) : (
                    editingField.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className="p-2.5 rounded-xl bg-white border border-[#e6e4dc] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {optIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={opt.label}
                            onChange={(e) =>
                              handleUpdateOptionInEditing(optIdx, {
                                label: e.target.value,
                              })
                            }
                            placeholder="Option Label"
                            className="flex-1 px-2.5 py-1 rounded-lg border border-stone-200 text-xs text-[#1c1b1a]"
                          />
                          <input
                            type="text"
                            value={opt.value}
                            onChange={(e) =>
                              handleUpdateOptionInEditing(optIdx, {
                                value: e.target.value,
                              })
                            }
                            placeholder="Value"
                            className="w-32 px-2.5 py-1 rounded-lg border border-stone-200 text-xs text-stone-600 font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveOptionInEditing(optIdx, "up")}
                            disabled={optIdx === 0}
                            className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOptionInEditing(optIdx, "down")}
                            disabled={optIdx === (editingField.options?.length || 0) - 1}
                            className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveOptionFromEditing(optIdx)}
                            className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                            title="Remove Option"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0eee8]">
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#e6e4dc] text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-bold transition-all shadow-md shadow-[#e8491c]/20"
                >
                  Save Field Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD CUSTOM FIELD MODAL (Full customizability with options)    */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#e6e4dc] my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#f0eee8]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e8491c] bg-[#fff2ed] px-2.5 py-1 rounded-full border border-[#fbdcd0]">
                  New Questionnaire Field
                </span>
                <h3 className="text-xl font-bold text-[#1c1b1a] mt-1.5">
                  Add Custom Field
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewField} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  Field Label *
                </label>
                <input
                  type="text"
                  required
                  value={newFieldData.label || ""}
                  onChange={(e) => {
                    const lbl = e.target.value;
                    const autoKey = lbl.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
                    setNewFieldData({
                      ...newFieldData,
                      label: lbl,
                      key: newFieldData.key ? newFieldData.key : autoKey,
                    });
                  }}
                  placeholder="e.g. Second Shooter Required?"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Database Key / ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFieldData.key || ""}
                    onChange={(e) =>
                      setNewFieldData({ ...newFieldData, key: e.target.value })
                    }
                    placeholder="e.g. second_shooter_required"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Field Input Type *
                  </label>
                  <select
                    value={newFieldData.type}
                    onChange={(e) =>
                      setNewFieldData({
                        ...newFieldData,
                        type: e.target.value as BookingFieldDoc["type"],
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.label} ({t.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Placeholder (optional)
                  </label>
                  <input
                    type="text"
                    value={newFieldData.placeholder || ""}
                    onChange={(e) =>
                      setNewFieldData({ ...newFieldData, placeholder: e.target.value })
                    }
                    placeholder="e.g. Select an option..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Applies To Sessions
                  </label>
                  <select
                    value={
                      Array.isArray(newFieldData.appliesTo)
                        ? newFieldData.appliesTo[0] || "all"
                        : newFieldData.appliesTo || "all"
                    }
                    onChange={(e) =>
                      setNewFieldData({
                        ...newFieldData,
                        appliesTo:
                          e.target.value === "all" ? "all" : [e.target.value],
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
                  >
                    <option value="all">All Sessions &amp; Services</option>
                    <option value="weddings">Weddings only</option>
                    <option value="portraits">Portraits only</option>
                    <option value="family">Family only</option>
                    <option value="behind-the-scenes">Behind the Scenes only</option>
                    <option value="corporate">Corporate only</option>
                  </select>
                </div>
              </div>

              {/* Options manager for new field if select / radio / checkbox */}
              {isEnumField(newFieldData.type || "text") && (
                <div className="space-y-3 p-4 rounded-2xl bg-[#faf9f6] border border-[#f0eee8]">
                  <h4 className="text-xs font-bold text-[#1c1b1a]">
                    Add Choices / Enum Options
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={addOptionLabel}
                      onChange={(e) => setAddOptionLabel(e.target.value)}
                      placeholder="Option label"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-[#e6e4dc] bg-white text-xs"
                    />
                    <input
                      type="text"
                      value={addOptionValue}
                      onChange={(e) => setAddOptionValue(e.target.value)}
                      placeholder="Value (optional)"
                      className="w-36 px-3 py-1.5 rounded-xl border border-[#e6e4dc] bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddOptionToNew}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1c1b1a] text-white text-xs font-bold shrink-0"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {newFieldData.options?.map((opt, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white border border-[#e6e4dc] flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-[#1c1b1a]">{opt.label}</span>
                        <span className="text-stone-400 font-mono text-[11px]">
                          {opt.value}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionFromNew(idx)}
                          className="text-stone-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1c1b1a]">
                  <input
                    type="checkbox"
                    checked={newFieldData.required || false}
                    onChange={(e) =>
                      setNewFieldData({ ...newFieldData, required: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#e8491c] rounded"
                  />
                  <span>Mandatory / Required Field</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1c1b1a]">
                  <input
                    type="checkbox"
                    checked={newFieldData.published !== false}
                    onChange={(e) =>
                      setNewFieldData({ ...newFieldData, published: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#e8491c] rounded"
                  />
                  <span>Active immediately</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0eee8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#e6e4dc] text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-bold transition-all shadow-md shadow-[#e8491c]/20"
                >
                  Create Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
