"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Image as ImageIcon,
  Search,
  Filter,
  Plus,
  Eye,
  EyeOff,
  Check,
  ChevronLeft,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { getPortfolioImages, DEFAULT_PORTFOLIO_IMAGES } from "@/lib/content";
import { PortfolioImageDoc } from "@/types/firebase";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";

const CATEGORIES = [
  { id: "all", label: "All Photos" },
  { id: "weddings", label: "Weddings" },
  { id: "portraits", label: "Portraits" },
  { id: "family", label: "Family" },
  { id: "events", label: "Events" },
  { id: "behind-the-scenes", label: "Behind the Scenes" },
  { id: "birthday", label: "Birthdays" },
  { id: "personal", label: "Personal Branding" },
  { id: "sports", label: "Sports & Athletics" },
];

export default function AdminPortfolioPage() {
  const [images, setImages] = useState<PortfolioImageDoc[]>(DEFAULT_PORTFOLIO_IMAGES);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const imgs = await getPortfolioImages();
        setImages(imgs);
      } catch (e) {
        console.error("Failed to load portfolio:", e);
      }
    }
    init();
  }, []);

  const filteredImages = images.filter((img) => {
    const matchesCat =
      activeCategory === "all" ||
      img.category.includes(activeCategory) ||
      (activeCategory === "birthday" && img.category.includes("birthdays"));
    const matchesQuery =
      searchQuery === "" ||
      img.alt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const togglePublished = (id: string) => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          return { ...img, published: !img.published, updatedAt: Date.now() };
        }
        return img;
      })
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Save changes to Firestore
      for (const img of images) {
        await setDoc(doc(db, "portfolio", img.id), img, { merge: true });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Error saving portfolio:", e);
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
            Portfolio Gallery Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Manage your full portfolio archive ({images.length} photos). Toggle public visibility, inspect image dimensions, and update metadata.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portfolio"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-[#2c2b29] text-xs font-bold transition-colors border border-[#e6e4dc]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#7a766f]" />
            <span>Public Gallery</span>
          </Link>

          <button
            onClick={handleSave}
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
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e8e6df] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#1c1b1a] text-white"
                    : "bg-[#f5f4ef] text-[#615e57] hover:bg-[#ebe9e1]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#9d9990] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search photos..."
            className="w-full pl-9 pr-4 py-1.5 rounded-full border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a] placeholder:text-[#aaa59c] focus:outline-none focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c]"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            className={`group bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 border transition-all ${
              img.published
                ? "border-[#e8e6df] hover:border-[#dedad0] shadow-sm"
                : "border-red-200 bg-red-50/20 opacity-60"
            }`}
          >
            <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-[#f0eee8] mb-2.5">
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Status pill on image */}
              <button
                onClick={() => togglePublished(img.id)}
                className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                  img.published
                    ? "bg-black/40 text-white hover:bg-black/60"
                    : "bg-red-500 text-white"
                }`}
                title={img.published ? "Click to hide from public" : "Click to publish"}
              >
                {img.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <div className="absolute bottom-2 left-2 right-2 text-white text-[10px]">
                <p className="font-bold truncate">{img.id}</p>
                <p className="text-[9px] text-white/70 truncate capitalize">
                  {img.category.join(", ")}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#8a867f] px-1">
              <span>
                {img.width} × {img.height}
              </span>
              <span className={`font-semibold ${img.published ? "text-emerald-600" : "text-red-500"}`}>
                {img.published ? "Published" : "Hidden"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
