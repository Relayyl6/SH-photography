"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Layers,
  ChevronLeft,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Edit3,
  DollarSign,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { getPackages, DEFAULT_PACKAGES } from "@/lib/content";
import { PackageDoc } from "@/types/firebase";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";

export default function AdminSessionsPage() {
  const [packages, setPackages] = useState<PackageDoc[]>(DEFAULT_PACKAGES);
  const [editingPkg, setEditingPkg] = useState<PackageDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const pkgs = await getPackages();
        setPackages(pkgs);
      } catch (e) {
        console.error("Failed to load packages:", e);
      }
    }
    init();
  }, []);

  const handleToggleShowPrice = (id: string) => {
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, show_price: !p.show_price, updatedAt: Date.now() };
        }
        return p;
      })
    );
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      for (const p of packages) {
        await setDoc(doc(db, "packages", p.id), p, { merge: true });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Error saving packages:", e);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEditingPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    setPackages((prev) =>
      prev.map((p) => (p.id === editingPkg.id ? { ...editingPkg, updatedAt: Date.now() } : p))
    );
    setEditingPkg(null);
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
            Sessions &amp; Packages Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Edit what is included in each session package. Per customer specification, prices remain hidden by default unless you explicitly toggle price visibility on.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/services"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-[#2c2b29] text-xs font-bold transition-colors border border-[#e6e4dc]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#7a766f]" />
            <span>Public Services Page</span>
          </Link>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-bold transition-all shadow-md shadow-[#e8491c]/20 disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save All Packages</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm flex flex-col justify-between hover:border-[#dedad0] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e8491c] bg-[#fff2ed] px-2.5 py-0.5 rounded-full border border-[#fbdcd0]">
                  {pkg.category === "class" ? "Education / Class" : "Photography Session"}
                </span>
                <span className="text-xs text-[#8a867f]">Turnaround: {pkg.turnaround}</span>
              </div>

              <h3 className="text-xl font-bold text-[#1c1b1a] mb-2">{pkg.name}</h3>
              <p className="text-xs text-[#7a766f] mb-4 leading-relaxed">{pkg.description}</p>

              {/* What's included preview */}
              <div className="space-y-1.5 mb-5 p-3.5 rounded-2xl bg-[#faf9f6] border border-[#f0eee8]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9d9990] mb-1">
                  What&apos;s Included ({pkg.features.length} items):
                </p>
                {pkg.features.slice(0, 3).map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#48453f]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{feat}</span>
                  </div>
                ))}
                {pkg.features.length > 3 && (
                  <p className="text-[11px] text-[#8a867f] font-medium pt-1">
                    +{pkg.features.length - 3} more items
                  </p>
                )}
              </div>
            </div>

            {/* Price Visibility Rule & Edit Trigger */}
            <div className="pt-4 border-t border-[#f0eee8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleShowPrice(pkg.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
                    pkg.show_price
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-[#f5f4ef] text-[#7a766f] border-[#e6e4dc]"
                  }`}
                  title="Toggle price display"
                >
                  {pkg.show_price ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>Price: {pkg.show_price ? (pkg.price_label || "Shown") : "Hidden (Default)"}</span>
                </button>
              </div>

              <button
                onClick={() => setEditingPkg({ ...pkg })}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1c1b1a] text-white text-xs font-bold hover:bg-[#33312e] transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Package</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Package Modal */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[#e6e4dc] animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-[#1c1b1a] mb-1">Edit {editingPkg.name}</h3>
            <p className="text-xs text-[#7a766f] mb-4">
              Update description, turnaround time, inclusions, or price visibility flag.
            </p>

            <form onSubmit={handleUpdateEditingPackage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  Package Name
                </label>
                <input
                  type="text"
                  value={editingPkg.name}
                  onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  Summary / Description
                </label>
                <textarea
                  rows={3}
                  value={editingPkg.description}
                  onChange={(e) => setEditingPkg({ ...editingPkg, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Turnaround Time
                  </label>
                  <input
                    type="text"
                    value={editingPkg.turnaround}
                    onChange={(e) => setEditingPkg({ ...editingPkg, turnaround: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Price Visibility
                  </label>
                  <select
                    value={editingPkg.show_price ? "true" : "false"}
                    onChange={(e) =>
                      setEditingPkg({ ...editingPkg, show_price: e.target.value === "true" })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                  >
                    <option value="false">Hidden (Default)</option>
                    <option value="true">Visible</option>
                  </select>
                </div>
              </div>

              {editingPkg.show_price && (
                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Custom Price Label (Optional text, e.g. &apos;From £350&apos;)
                  </label>
                  <input
                    type="text"
                    value={editingPkg.price_label || ""}
                    onChange={(e) => setEditingPkg({ ...editingPkg, price_label: e.target.value })}
                    placeholder="e.g. From £350"
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  Inclusions (One per line)
                </label>
                <textarea
                  rows={4}
                  value={editingPkg.features.join("\n")}
                  onChange={(e) =>
                    setEditingPkg({
                      ...editingPkg,
                      features: e.target.value.split("\n").filter((l) => l.trim() !== ""),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0eee8]">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="px-4 py-2 rounded-xl border border-[#e6e4dc] text-xs font-semibold text-[#55524c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#e8491c] text-white text-xs font-bold hover:bg-[#d03d12]"
                >
                  Apply Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
