"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UserCheck,
  ChevronLeft,
  Check,
  Sparkles,
  ExternalLink,
  Info,
  Upload,
  Plus,
  Trash2,
  Camera,
} from "lucide-react";
import { getAboutPageContent } from "@/lib/content";
import { AboutPageDoc } from "@/types/firebase";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { uploadImageFile } from "@/lib/upload";

const INITIAL_ABOUT_PAGE: AboutPageDoc = {
  heading: "Get to Know Me",
  body: "",
  coverImage: {
    url: "/photos/personal/personal_01.jpg",
    path: "/photos/personal/personal_01.jpg",
    alt: "Benedict Henry",
  },
  stats: [],
  signature: "Benedict Henry",
  published: true,
  updatedAt: 0,
};

export default function AdminAboutPage() {
  const [about, setAbout] = useState<AboutPageDoc>(INITIAL_ABOUT_PAGE);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      try {
        const data = await getAboutPageContent();
        if (data && data.heading) {
          setAbout(data);
        }
      } catch (e) {
        console.error("Failed to load about page:", e);
      }
    }
    init();
  }, []);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);
    try {
      const downloadUrl = await uploadImageFile(file, "about");
      setAbout((prev) => ({
        ...prev,
        coverImage: {
          ...prev.coverImage,
          url: downloadUrl,
        },
      }));
    } catch (err: any) {
      console.error("Image upload failed:", err);
      setUploadError(err.message || "Failed to upload image. Please try another file.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleStatChange = (index: number, field: "label" | "value", text: string) => {
    setAbout((prev) => {
      const stats = [...prev.stats];
      const target = stats[index];
      if (target) {
        stats[index] = {
          label: field === "label" ? text : target.label,
          value: field === "value" ? text : target.value,
          order: target.order || index + 1,
        };
      }
      return { ...prev, stats };
    });
  };

  const handleAddStat = () => {
    setAbout((prev) => ({
      ...prev,
      stats: [
        ...prev.stats,
        { label: "New Highlight", value: "100+", order: prev.stats.length + 1 },
      ],
    }));
  };

  const handleRemoveStat = (index: number) => {
    setAbout((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await setDoc(
        doc(db, "pages", "about"),
        { ...about, published: true, updatedAt: Date.now() },
        { merge: true }
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving about page:", err);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

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
            About &amp; Biography Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Edit your biography copy, headline, signature line, cover photo, and studio highlight figures shown on the public About page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-[#2c2b29] text-xs font-bold transition-colors border border-[#e6e4dc]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#7a766f]" />
            <span>Public About Page</span>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biography Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8e6df] shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#48453f] mb-1.5">
              Page Heading
            </label>
            <input
              type="text"
              value={about.heading}
              onChange={(e) => setAbout({ ...about, heading: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#e6e4dc] bg-[#faf9f6] text-sm text-[#1c1b1a] font-semibold focus:outline-none focus:ring-2 focus:ring-[#e8491c]/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#48453f]">
                Biography Body (Paragraphs)
              </label>
              <span className="text-[11px] text-[#8a867f] font-medium flex items-center gap-1">
                <Info className="w-3 h-3 text-[#e8491c]" />
                <span>Separate paragraphs with empty line</span>
              </span>
            </div>
            <textarea
              rows={12}
              value={about.body}
              onChange={(e) => setAbout({ ...about, body: e.target.value })}
              className="w-full p-4 rounded-2xl border border-[#e6e4dc] bg-[#faf9f6] text-xs sm:text-sm text-[#1c1b1a] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#e8491c]/20 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#48453f] mb-1.5">
                Signature Name
              </label>
              <input
                type="text"
                value={about.signature}
                onChange={(e) => setAbout({ ...about, signature: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#48453f] mb-1.5">
                Cover Image URL (Direct link or upload above)
              </label>
              <input
                type="text"
                value={about.coverImage.url}
                onChange={(e) =>
                  setAbout({
                    ...about,
                    coverImage: { ...about.coverImage, url: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#f0eee8] flex justify-end">
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-bold transition-all shadow-md shadow-[#e8491c]/20 disabled:opacity-50"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved to Public Site!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Biography &amp; Highlights</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Preview / Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Cover Image Upload Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-[#1c1b1a]">Cover Image</h4>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1c1b1a] hover:bg-[#33312e] text-white text-xs font-bold transition-all"
              >
                {uploadingImage ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-[#e8491c]" />
                )}
                <span>{uploadingImage ? "Uploading..." : "Replace Image"}</span>
              </button>
            </div>

            {uploadError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl mb-3 border border-red-200">
                {uploadError}
              </p>
            )}

            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#f0eee8] border border-[#e6e4dc]">
              <Image
                src={about.coverImage.url || "/photos/personal/personal_01.jpg"}
                alt={about.coverImage.alt || "Benedict Henry"}
                fill
                sizes="300px"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-bold">{about.signature || "Benedict Henry"}</p>
                <p className="text-[10px] text-white/80">Manchester, United Kingdom</p>
              </div>
            </div>
            <p className="text-[11px] text-[#8a867f] mt-2">
              Click &quot;Replace Image&quot; to pick any photo from your computer. It uploads instantly and replaces the cover image on the public About page.
            </p>
          </div>

          {/* Studio Highlights (Figures) - Fully Editable */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-[#1c1b1a]">Studio Highlights (Stats)</h4>
                <p className="text-[11px] text-[#7a766f]">Figures rendered on the public website</p>
              </div>
              <button
                type="button"
                onClick={handleAddStat}
                className="p-1.5 rounded-xl bg-orange-50 text-[#e8491c] hover:bg-orange-100 transition-colors border border-orange-200"
                title="Add Highlight Stat"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {about.stats.map((st, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] flex items-center gap-2 text-xs"
                >
                  <input
                    type="text"
                    value={st.label}
                    onChange={(e) => handleStatChange(i, "label", e.target.value)}
                    placeholder="Highlight label"
                    className="flex-1 bg-white border border-[#e6e4dc] px-2.5 py-1.5 rounded-xl text-xs text-[#48453f] font-medium"
                  />
                  <input
                    type="text"
                    value={st.value}
                    onChange={(e) => handleStatChange(i, "value", e.target.value)}
                    placeholder="e.g. 150+"
                    className="w-20 bg-white border border-[#e6e4dc] px-2.5 py-1.5 rounded-xl text-xs text-[#1c1b1a] font-bold text-center"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStat(i)}
                    className="p-1 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                    title="Remove Stat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddStat}
              className="mt-3 w-full py-2 rounded-xl border border-dashed border-[#d0cdcb] text-xs font-semibold text-[#7a766f] hover:text-[#1c1b1a] hover:border-[#1c1b1a] transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Figure</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
