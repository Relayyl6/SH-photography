"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Plus,
  Upload,
  X,
  Camera,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { getPackages, DEFAULT_PACKAGES } from "@/lib/content";
import { PackageDoc, SessionDoc } from "@/types/firebase";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

export default function AdminSessionsPage() {
  const [packages, setPackages] = useState<PackageDoc[]>(DEFAULT_PACKAGES);
  const [editingPkg, setEditingPkg] = useState<PackageDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Session Type modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCategory, setNewCategory] = useState<"photography" | "class">("photography");
  const [newDescription, setNewDescription] = useState("");
  const [newTurnaround, setNewTurnaround] = useState("2-3 weeks");
  const [newInclusions, setNewInclusions] = useState(
    "Pre-shoot creative consultation\nHigh-resolution edited digital gallery\nPersonal print and digital usage rights"
  );
  const [newShowPrice, setNewShowPrice] = useState(false);
  const [newPriceLabel, setNewPriceLabel] = useState("");
  const [newCoverUrl, setNewCoverUrl] = useState("");
  const [newGalleryUrls, setNewGalleryUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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

  const handleNameChange = (val: string) => {
    setNewName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setNewSlug(slug);
  };

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

  const handleFileUpload = async (file: File, isCover: boolean) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image to Vercel Blob.");
      }

      const data = await res.json();
      if (data.url) {
        if (isCover) {
          setNewCoverUrl(data.url);
        } else {
          setNewGalleryUrls((prev) => [...prev, data.url]);
        }
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
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

  const handleCreateNewSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) return;

    setSaving(true);
    try {
      const inclusionsArray = newInclusions
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const newPkg: PackageDoc = {
        id: newSlug,
        name: newName.trim(),
        category: newCategory,
        sessionSlug: newSlug,
        description: newDescription.trim(),
        features: inclusionsArray,
        deliverables: ["Private online gallery", "High-resolution digital downloads"],
        turnaround: newTurnaround.trim(),
        show_price: newShowPrice,
        price_label: newShowPrice && newPriceLabel.trim() ? newPriceLabel.trim() : undefined,
        order: packages.length + 1,
        published: true,
        updatedAt: Date.now(),
      };

      const newSession: SessionDoc = {
        id: newSlug,
        name: newName.trim(),
        slug: newSlug,
        shortDescription: newDescription.trim(),
        description: newDescription.trim(),
        price: 0,
        showPrice: newShowPrice,
        priceLabel: newShowPrice && newPriceLabel.trim() ? newPriceLabel.trim() : undefined,
        currency: "GBP",
        depositAmount: 50,
        durationMinutes: 90,
        bufferMinutes: 30,
        included: inclusionsArray,
        notIncluded: ["Studio rental fees (if required)", "Travel outside Greater Manchester"],
        coverImage: newCoverUrl || `/photos/${newSlug}/${newSlug}_01.jpg`,
        gallery: newGalleryUrls.length > 0 ? newGalleryUrls : [newCoverUrl || `/photos/${newSlug}/${newSlug}_01.jpg`],
        location: "Manchester, United Kingdom",
        maxPeople: 6,
        addOns: [
          { name: "Extra 30 Minutes", price: 50 },
          { name: "Rush Delivery (48h)", price: 75 },
        ],
        bookingFieldIds: ["full_name", "email_address", "phone_number", "session_date", "session_notes"],
        published: true,
        order: packages.length + 1,
        minNoticeHours: 48,
        active: true,
        updatedAt: Date.now(),
      };

      // 1. Write to Firestore packages
      await setDoc(doc(db, "packages", newSlug), newPkg);
      // 2. Write to Firestore sessions
      await setDoc(doc(db, "sessions", newSlug), newSession);

      // 3. Write any uploaded gallery photos to portfolio collection
      for (let i = 0; i < newGalleryUrls.length; i++) {
        const photoUrl = newGalleryUrls[i];
        const photoId = `${newSlug}-${i + 1}`;
        await setDoc(doc(db, "portfolio", photoId), {
          id: photoId,
          url: photoUrl,
          path: photoUrl,
          thumbUrl: photoUrl,
          alt: `${newName} photography by SH Photography`,
          caption: `${newName} session`,
          category: [newSlug],
          order: i + 1,
          published: true,
          width: 1200,
          height: 1500,
          featured: i === 0,
          updatedAt: Date.now(),
        });
      }

      setPackages((prev) => [...prev, newPkg]);
      setIsAddModalOpen(false);

      // Reset form
      setNewName("");
      setNewSlug("");
      setNewDescription("");
      setNewTurnaround("2-3 weeks");
      setNewCoverUrl("");
      setNewGalleryUrls([]);
      setNewShowPrice(false);
      setNewPriceLabel("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error creating new session:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEditingPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    setSaving(true);
    try {
      const updated = { ...editingPkg, updatedAt: Date.now() };
      await setDoc(doc(db, "packages", editingPkg.id), updated, { merge: true });

      setPackages((prev) =>
        prev.map((p) => (p.id === editingPkg.id ? updated : p))
      );
      setEditingPkg(null);
    } catch (err) {
      console.error("Failed to update package:", err);
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
            Sessions &amp; Packages Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Edit fixed sessions or add brand new session types with custom photos and inclusions. Prices remain hidden by default unless you explicitly toggle price visibility on.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1c1b1a] hover:bg-[#33312e] text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#e8491c]" />
            <span>Add New Session Type</span>
          </button>

          <Link
            href="/services"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-[#2c2b29] text-xs font-bold transition-colors border border-[#e6e4dc]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#7a766f]" />
            <span>View Public Services</span>
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
                <span>Saved to Database!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save All Changes</span>
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

              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl font-bold text-[#1c1b1a] mb-2">{pkg.name}</h3>
                <Link
                  href={`/portfolio/${pkg.sessionSlug || pkg.id}`}
                  target="_blank"
                  className="text-xs text-stone-400 hover:text-stone-800 flex items-center gap-1 font-medium"
                >
                  Gallery <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

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

      {/* Add New Session Type Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-[#e6e4dc] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
              <div>
                <h3 className="text-xl font-bold text-[#1c1b1a]">Add New Session Type</h3>
                <p className="text-xs text-[#7a766f]">
                  Define a new photography session or class, upload photos, and configure inclusions.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSession} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Session Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial & Brand"
                    value={newName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="commercial-brand"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a] bg-stone-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as "photography" | "class")}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                  >
                    <option value="photography">Photography Session</option>
                    <option value="class">Class / Mentorship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#48453f] mb-1">
                    Turnaround Time
                  </label>
                  <input
                    type="text"
                    value={newTurnaround}
                    onChange={(e) => setNewTurnaround(e.target.value)}
                    placeholder="e.g. 1-2 weeks"
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  Summary / Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Tell clients what makes this session unique..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20"
                />
              </div>

              {/* Cover Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  Cover Photo (Vercel Blob Storage)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], true);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#e8491c]" />
                    {isUploading ? "Uploading..." : "Upload Cover Image"}
                  </button>

                  <input
                    type="text"
                    value={newCoverUrl}
                    onChange={(e) => setNewCoverUrl(e.target.value)}
                    placeholder="or paste image URL"
                    className="flex-1 px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                  />
                </div>
                {newCoverUrl && (
                  <p className="text-[11px] text-emerald-700 font-mono mt-1 truncate">
                    Cover: {newCoverUrl}
                  </p>
                )}
              </div>

              {/* Additional Gallery Photos Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  Gallery Photos ({newGalleryUrls.length} added)
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="file"
                    ref={galleryInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                    + Add Photo to Gallery
                  </button>
                </div>

                {newGalleryUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
                    {newGalleryUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-stone-200 text-[11px] text-stone-600 font-mono"
                      >
                        <span className="truncate max-w-[120px]">{url.split("/").pop()}</span>
                        <button
                          type="button"
                          onClick={() => setNewGalleryUrls((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 ml-1"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inclusions */}
              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  What&apos;s Included (One item per line)
                </label>
                <textarea
                  rows={3}
                  value={newInclusions}
                  onChange={(e) => setNewInclusions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                />
              </div>

              {/* Price Visibility */}
              <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800">
                    Show Price on Public Site? (Default is Hidden)
                  </span>
                  <input
                    type="checkbox"
                    checked={newShowPrice}
                    onChange={(e) => setNewShowPrice(e.target.checked)}
                    className="w-4 h-4 rounded text-[#e8491c] focus:ring-[#e8491c]"
                  />
                </div>
                {newShowPrice && (
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Price Label (e.g. &apos;From £250&apos;)
                    </label>
                    <input
                      type="text"
                      value={newPriceLabel}
                      onChange={(e) => setNewPriceLabel(e.target.value)}
                      placeholder="From £250"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
                    />
                  </div>
                )}
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
                  disabled={saving || isUploading}
                  className="px-5 py-2 rounded-xl bg-[#e8491c] text-white text-xs font-bold hover:bg-[#d03d12] disabled:opacity-50"
                >
                  {saving ? "Creating Session..." : "Create & Publish Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#e8491c] text-white text-xs font-bold hover:bg-[#d03d12] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Apply Updates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
