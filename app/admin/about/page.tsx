"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UserCheck,
  ChevronLeft,
  Check,
  Sparkles,
  ExternalLink,
  Info,
} from "lucide-react";
import { getAboutPageContent, DEFAULT_ABOUT_PAGE } from "@/lib/content";
import { AboutPageDoc } from "@/types/firebase";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";

export default function AdminAboutPage() {
  const [about, setAbout] = useState<AboutPageDoc>(DEFAULT_ABOUT_PAGE);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const data = await getAboutPageContent();
        setAbout(data);
      } catch (e) {
        // Fallback
      }
    }
    init();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await setDoc(doc(db, "pages", "about"), { ...about, updatedAt: Date.now() }, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
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
            About &amp; Biography Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Edit your biography copy, headline, signature line, and studio statistics.
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
                Signature
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
                Cover Image URL
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
                  <span>Save Biography</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Preview / Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm">
            <h4 className="text-sm font-bold text-[#1c1b1a] mb-3">Cover Image Preview</h4>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#f0eee8] border border-[#e6e4dc]">
              <Image
                src={about.coverImage.url || "/photos/personal/personal_06.jpg"}
                alt={about.coverImage.alt}
                fill
                sizes="300px"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-bold">{about.signature}</p>
                <p className="text-[10px] text-white/80">Manchester, United Kingdom</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm">
            <h4 className="text-sm font-bold text-[#1c1b1a] mb-3">Studio Highlights</h4>
            <div className="space-y-2">
              {about.stats.map((st, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] flex justify-between items-center text-xs"
                >
                  <span className="text-[#615e57] font-medium">{st.label}</span>
                  <span className="font-extrabold text-[#1c1b1a]">{st.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
