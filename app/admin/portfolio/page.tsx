"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Image as ImageIcon,
  Search,
  Plus,
  Eye,
  EyeOff,
  Check,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  Upload,
  X,
  Camera,
  Trash2,
} from "lucide-react";
import { getPortfolioImages, DEFAULT_PORTFOLIO_IMAGES } from "@/lib/content";
import { PortfolioImageDoc } from "@/types/firebase";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { uploadImageFile } from "@/lib/upload";

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

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("weddings");
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDeleteImage = async (id: string) => {
    if (!confirm(`Delete image "${id}" from portfolio?`)) return;
    try {
      await deleteDoc(doc(db, "portfolio", id));
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error("Failed to delete image:", err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    if (!uploadAlt) {
      setUploadAlt(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("Please select an image file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const downloadUrl = await uploadImageFile(selectedFile, `portfolio/${uploadCategory}`);
      const newId = `img_${uploadCategory}_${Date.now()}`;

      const newImageDoc: PortfolioImageDoc = {
        id: newId,
        url: downloadUrl,
        path: downloadUrl,
        thumbUrl: downloadUrl,
        alt: uploadAlt.trim() || `${uploadCategory} photography by SH Photography`,
        caption: uploadCaption.trim() || undefined,
        category: [uploadCategory],
        order: images.length + 1,
        published: true,
        width: 1200,
        height: 1500,
        featured: false,
        updatedAt: Date.now(),
      };

      await setDoc(doc(db, "portfolio", newId), newImageDoc);

      setImages((prev) => [newImageDoc, ...prev]);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setFilePreview(null);
      setUploadAlt("");
      setUploadCaption("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
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
            Upload new photos into any session category ({images.length} total photos). Toggle public visibility, inspect dimensions, and update metadata.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1c1b1a] hover:bg-[#33312e] text-white text-xs font-bold transition-all shadow-sm"
          >
            <Camera className="w-4 h-4 text-[#e8491c]" />
            <span>Upload New Photo</span>
          </button>

          <Link
            href="/portfolio"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-[#2c2b29] text-xs font-bold transition-colors border border-[#e6e4dc]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#7a766f]" />
            <span>Public Gallery</span>
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
                <span>Save Visibility</span>
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

              {/* Action buttons on image */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <button
                  onClick={() => togglePublished(img.id)}
                  className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                    img.published
                      ? "bg-black/50 text-white hover:bg-black/70"
                      : "bg-red-500 text-white"
                  }`}
                  title={img.published ? "Click to hide from public" : "Click to publish"}
                >
                  {img.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="p-1.5 rounded-full bg-black/50 text-white hover:bg-red-600 transition-colors"
                  title="Delete Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="absolute bottom-2 left-2 right-2 text-white text-[10px]">
                <p className="font-bold truncate">{img.alt || img.id}</p>
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

      {/* Upload Photo Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e6e4dc] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0eee8] mb-4">
              <h3 className="text-lg font-bold text-[#1c1b1a]">Upload Photo to Portfolio</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {uploadError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  {uploadError}
                </p>
              )}

              {/* File selector zone */}
              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1.5">
                  Select Image File *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                {filePreview ? (
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                    <Image src={filePreview} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 px-3 py-1 bg-black/70 text-white text-xs font-semibold rounded-xl hover:bg-black/90"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[4/3] rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#e8491c] flex flex-col items-center justify-center gap-2 cursor-pointer bg-stone-50/50 hover:bg-orange-50/30 transition-colors p-4 text-center"
                  >
                    <Upload className="w-8 h-8 text-stone-400" />
                    <p className="text-xs font-bold text-stone-700">Click to choose a photo</p>
                    <p className="text-[11px] text-stone-500">JPG, PNG, WebP up to 15MB</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  Session / Category *
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                >
                  <option value="weddings">Weddings</option>
                  <option value="portraits">Portraits</option>
                  <option value="family">Family</option>
                  <option value="events">Events</option>
                  <option value="behind-the-scenes">Behind the Scenes</option>
                  <option value="birthday">Birthdays</option>
                  <option value="personal">Personal Branding</option>
                  <option value="sports">Sports &amp; Athletics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  Alt Text / Title *
                </label>
                <input
                  type="text"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="e.g. Manchester Victoria Baths Wedding"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="e.g. Natural editorial light during bridal portraits"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#e6e4dc] text-xs text-[#1c1b1a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0eee8]">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#e6e4dc] text-xs font-semibold text-[#55524c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-5 py-2 rounded-xl bg-[#e8491c] text-white text-xs font-bold hover:bg-[#d03d12] disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload &amp; Publish</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
