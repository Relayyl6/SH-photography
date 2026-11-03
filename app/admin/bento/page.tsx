"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  RefreshCw,
  Check,
  ChevronLeft,
  X,
  Search,
  Sliders,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import {
  getBentoSlots,
  getPortfolioImages,
} from "@/lib/content";
import { BentoHomeDoc, BentoSlot, PortfolioImageDoc } from "@/types/firebase";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";

interface SlotConfig {
  slotId: string;
  category: string;
  title: string;
  badge: string;
  aspect: string;
  dimensionsNote: string;
}

const FIXED_SLOTS: SlotConfig[] = [
  {
    slotId: "1",
    category: "weddings",
    title: "Weddings",
    badge: "Photography",
    aspect: "aspect-[4/3] sm:aspect-[16/10]",
    dimensionsNote: "Large 2x2 Feature",
  },
  {
    slotId: "2",
    category: "portraits",
    title: "Beauty & Portraits",
    badge: "Portraits",
    aspect: "aspect-[3/4]",
    dimensionsNote: "Tall Portrait 1x2",
  },
  {
    slotId: "3",
    category: "family",
    title: "Family",
    badge: "Warmth",
    aspect: "aspect-square",
    dimensionsNote: "Compact Square 1x1",
  },
  {
    slotId: "4",
    category: "events",
    title: "Events",
    badge: "Atmosphere",
    aspect: "aspect-square",
    dimensionsNote: "Compact Square 1x1",
  },
  {
    slotId: "5",
    category: "behind-the-scenes",
    title: "Behind the Scenes",
    badge: "On Set",
    aspect: "aspect-[16/9]",
    dimensionsNote: "Wide Landscape 2x1",
  },
  {
    slotId: "6",
    category: "birthday",
    title: "Birthdays",
    badge: "Celebration",
    aspect: "aspect-square",
    dimensionsNote: "Compact Square 1x1",
  },
  {
    slotId: "7",
    category: "personal",
    title: "Personal Branding",
    badge: "Identity",
    aspect: "aspect-square",
    dimensionsNote: "Compact Square 1x1",
  },
  {
    slotId: "8",
    category: "sports",
    title: "Sports & Athletics",
    badge: "Action",
    aspect: "aspect-[16/9]",
    dimensionsNote: "Wide Landscape 2x1",
  },
  {
    slotId: "9",
    category: "behind-the-scenes",
    title: "Photography Classes & Retouching",
    badge: "Education",
    aspect: "aspect-[16/9]",
    dimensionsNote: "Wide Landscape 2x1",
  },
];

export default function AdminBentoPage() {
  const [bento, setBento] = useState<BentoHomeDoc>({ slots: [], published: true, updatedAt: 0 });
  const [allImages, setAllImages] = useState<PortfolioImageDoc[]>([]);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [bentoData, imgs] = await Promise.all([
          getBentoSlots(),
          getPortfolioImages(),
        ]);
        if (bentoData?.slots) setBento(bentoData);
        if (imgs) setAllImages(imgs);
      } catch (err) {
        console.error("Failed to load bento data from DB:", err);
      }
    }
    init();
  }, []);

  const imgMap = new Map<string, PortfolioImageDoc>();
  allImages.forEach((img) => {
    imgMap.set(img.id, img);
    const base = img.url.split("/").pop()?.replace(/\.[^/.]+$/, "");
    if (base) imgMap.set(base, img);
  });

  const activeSlot = FIXED_SLOTS.find((s) => s.slotId === activeSlotId);
  const activeBentoSlot = bento.slots.find((s) => s.slotId === activeSlotId);

  // Filter images for swap modal
  const eligibleImages = allImages.filter((img) => {
    if (!activeSlot) return true;
    const matchesCategory =
      img.category.includes(activeSlot.category) ||
      (activeSlot.category === "birthday" && img.category.includes("birthdays"));
    const matchesQuery =
      searchQuery === "" ||
      img.alt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleSelectImageForSlot = (imageId: string) => {
    if (!activeSlotId) return;

    const targetImg = allImages.find((img) => img.id === imageId || img.url === imageId);
    const resolvedUrl = targetImg ? targetImg.url : (imageId.startsWith("/") || imageId.startsWith("http") ? imageId : undefined);

    let found = false;
    const updatedSlots = bento.slots.map((s) => {
      if (s.slotId === activeSlotId) {
        found = true;
        return {
          ...s,
          label: activeSlot?.title || s.label,
          portfolioImageId: imageId,
          ...(resolvedUrl ? { customImageUrl: resolvedUrl } : {}),
        };
      }
      return s;
    });

    if (!found) {
      updatedSlots.push({
        slotId: activeSlotId,
        portfolioImageId: imageId,
        label: activeSlot?.title || `Slot ${activeSlotId}`,
        ...(resolvedUrl ? { customImageUrl: resolvedUrl } : {}),
      });
    }

    setBento({
      ...bento,
      slots: updatedSlots,
      updatedAt: Date.now(),
    });

    setActiveSlotId(null);
  };

  const handleToggleRotation = (slotId: string) => {
    const updatedSlots = bento.slots.map((s) => {
      if (s.slotId === slotId) {
        const currentlyEnabled = Boolean(s.rotation?.enabled);
        return {
          ...s,
          rotation: {
            enabled: !currentlyEnabled,
            pool: s.rotation?.pool || [s.portfolioImageId],
            intervalMode: s.rotation?.intervalMode || "daily",
          },
        };
      }
      return s;
    });

    setBento({
      ...bento,
      slots: updatedSlots,
      updatedAt: Date.now(),
    });
  };

  const handleResetToDefaults = async () => {
    if (confirm("Reload Bento slots from the database?")) {
      const bentoData = await getBentoSlots();
      if (bentoData?.slots) setBento(bentoData);
    }
  };

  const handleSaveBento = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: "bento",
          id: "home",
          data: bento,
        }),
      });

      if (!res.ok) {
        await setDoc(doc(db, "bento", "home"), bento, { merge: true });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving bento configuration:", err);
      try {
        await setDoc(doc(db, "bento", "home"), bento, { merge: true });
        setSaveSuccess(true);
      } catch (clientErr) {
        console.error("Client SDK bento save error:", clientErr);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
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
            Home Bento Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            The 9 grid positions are locked to preserve the design contract. Choose which portfolio photograph displays in each slot, or toggle automatic photo rotation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#faf9f6] hover:bg-[#ebe9e1] text-[#7a766f] hover:text-[#1c1b1a] text-xs font-bold transition-colors border border-[#e6e4dc]"
            title="Reset slots to recommended alignment (Behind the Scenes on #5, Birthdays on #6, Classes on #9)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Alignment</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-[#2c2b29] text-xs font-bold transition-colors border border-[#e6e4dc]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#7a766f]" />
            <span>Preview Site</span>
          </Link>

          <button
            onClick={handleSaveBento}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-bold transition-all shadow-md shadow-[#e8491c]/20 disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved to Firestore!</span>
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

      {/* 9 Bento Slots Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FIXED_SLOTS.map((slot) => {
          const currentBentoSlot = bento.slots.find((s) => s.slotId === slot.slotId);
          const currentImgId = currentBentoSlot?.portfolioImageId || "";
          const img = imgMap.get(currentImgId);
          const displaySrc = img ? img.url : `/photos/${slot.category}/${slot.category}_01.jpg`;
          const isRotationOn = Boolean(currentBentoSlot?.rotation?.enabled);

          return (
            <div
              key={slot.slotId}
              className="bg-white rounded-3xl p-5 border border-[#e8e6df] shadow-sm flex flex-col justify-between group hover:border-[#dedad0] transition-colors"
            >
              <div>
                {/* Slot Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1c1b1a] text-white flex items-center justify-center font-bold text-[11px]">
                      {slot.slotId}
                    </span>
                    <span className="text-xs font-bold text-[#1c1b1a]">{slot.title}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#e8491c] bg-[#fff2ed] px-2.5 py-0.5 rounded-full border border-[#fbdcd0]">
                    {slot.badge}
                  </span>
                </div>

                {/* Picture Preview */}
                <div className={`relative ${slot.aspect} rounded-2xl overflow-hidden bg-[#f0eee8] border border-[#e6e4dc] mb-3 group/img`}>
                  <Image
                    src={displaySrc}
                    alt={slot.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover/img:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                  {/* Corner Overlay info */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                    <span className="font-mono bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md truncate max-w-[140px]">
                      {currentImgId || "Default Asset"}
                    </span>
                    <span className="text-[10px] text-white/80">{slot.dimensionsNote}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-2 pt-2 border-t border-[#f0eee8]">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleToggleRotation(slot.slotId)}
                    className={`text-[11px] font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-colors ${
                      isRotationOn
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "text-[#8a867f] hover:bg-[#f5f4ef]"
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${isRotationOn ? "animate-spin text-emerald-600" : ""}`} />
                    <span>Auto-Rotate {isRotationOn ? "ON" : "OFF"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveSlotId(slot.slotId);
                      setSearchQuery("");
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-[#1c1b1a] text-xs font-bold transition-colors border border-[#e6e4dc] shadow-sm"
                  >
                    Swap Photo
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Swap Picture Modal Drawer */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#e6e4dc] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#f0eee8] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e8491c]">
                  Slot #{activeSlot.slotId} Picker
                </span>
                <h3 className="text-lg font-bold text-[#1c1b1a]">Select Photo for {activeSlot.title}</h3>
                <p className="text-xs text-[#7a766f]">
                  Showing curated portfolio photos in category: <span className="font-semibold text-[#1c1b1a]">{activeSlot.category}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveSlotId(null)}
                className="p-2 rounded-xl text-[#8a867f] hover:bg-[#f5f4ef] hover:text-[#1c1b1a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-[#f0eee8] bg-[#faf9f6]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#9d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter photos by filename or caption..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#e6e4dc] bg-white text-xs text-[#1c1b1a] placeholder:text-[#aaa59c] focus:outline-none focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c]"
                />
              </div>
            </div>

            {/* Photos Grid */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {eligibleImages.length === 0 ? (
                <div className="col-span-full py-12 text-center text-[#8a867f] text-xs">
                  No matching images found for &quot;{searchQuery}&quot;.
                </div>
              ) : (
                eligibleImages.map((img) => {
                  const isCurrent = activeBentoSlot?.portfolioImageId === img.id;
                  return (
                    <button
                      key={img.id}
                      onClick={() => handleSelectImageForSlot(img.id)}
                      className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border transition-all text-left ${
                        isCurrent
                          ? "ring-3 ring-[#e8491c] border-[#e8491c]"
                          : "border-[#e6e4dc] hover:border-[#1c1b1a]"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        sizes="200px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                      {isCurrent && (
                        <div className="absolute top-2 right-2 bg-[#e8491c] text-white p-1 rounded-full shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <p className="text-[10px] font-bold truncate">{img.id}</p>
                        <p className="text-[9px] text-white/70 truncate">{img.alt}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#f0eee8] bg-[#faf9f6] flex items-center justify-between text-xs">
              <span className="text-[#8a867f]">Found {eligibleImages.length} available photos</span>
              <button
                onClick={() => setActiveSlotId(null)}
                className="px-4 py-2 rounded-xl border border-[#e6e4dc] bg-white text-xs font-semibold text-[#55524c] hover:bg-[#f5f4ef]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
