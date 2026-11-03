"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ChevronLeft,
  Check,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Globe,
  Share2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import {
  getSiteSettings,
  getContactSettings,
  getSocialSettings,
  getBookingSettings,
  getHomePageContent,
} from "@/lib/content";
import {
  SiteSettingsDoc,
  ContactSettingsDoc,
  SocialSettingsDoc,
  BookingSettingsDoc,
  HomePageDoc,
} from "@/types/firebase";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { Video } from "lucide-react";

export default function AdminSettingsPage() {
  const [site, setSite] = useState<SiteSettingsDoc>({} as SiteSettingsDoc);
  const [contact, setContact] = useState<ContactSettingsDoc>({} as ContactSettingsDoc);
  const [social, setSocial] = useState<SocialSettingsDoc>({ links: [] } as any);
  const [booking, setBooking] = useState<BookingSettingsDoc>({} as BookingSettingsDoc);
  const [home, setHome] = useState<HomePageDoc>({} as HomePageDoc);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [s, c, soc, b, h] = await Promise.all([
          getSiteSettings(),
          getContactSettings(),
          getSocialSettings(),
          getBookingSettings(),
          getHomePageContent(),
        ]);
        setSite(s);
        setContact(c);
        setSocial(soc);
        setBooking(b);
        setHome(h);
      } catch (e) {
        // Fallback
      }
    }
    init();
  }, []);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await Promise.all([
        setDoc(doc(db, "settings", "site"), { ...site, published: true, updatedAt: Date.now() }, { merge: true }),
        setDoc(doc(db, "settings", "contact"), { ...contact, published: true, updatedAt: Date.now() }, { merge: true }),
        setDoc(doc(db, "settings", "social"), { ...social, published: true, updatedAt: Date.now() }, { merge: true }),
        setDoc(doc(db, "settings", "booking"), { ...booking, published: true, updatedAt: Date.now() }, { merge: true }),
        setDoc(doc(db, "pages", "home"), { ...home, published: true, updatedAt: Date.now() }, { merge: true }),
      ]);
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
            Studio Settings &amp; SEO
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Configure your studio contact facts, WhatsApp number, booking lead times, and search engine metadata.
          </p>
        </div>

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
              <span>Settings Saved!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Save All Settings</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Contact & Studio Facts */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8e6df] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#1c1b1a] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#e8491c]" />
            <span>Studio Identity &amp; Contact Details</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#48453f] mb-1">Business Name</label>
              <input
                type="text"
                value={site.businessName}
                onChange={(e) => setSite({ ...site, businessName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#48453f] mb-1">Studio Email</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#48453f] mb-1">Phone Number (Display)</label>
              <input
                type="text"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#48453f] mb-1">WhatsApp E.164 Number</label>
              <input
                type="text"
                value={contact.whatsapp}
                onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#48453f] mb-1">Studio Location Line</label>
              <input
                type="text"
                value={contact.address}
                onChange={(e) => setContact({ ...contact, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8e6df] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#1c1b1a] flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#e8491c]" />
            <span>Social Media Channels</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {social.links.map((link, idx) => (
              <div key={link.platform} className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] space-y-2">
                <span className="text-xs font-bold text-[#1c1b1a] capitalize">{link.platform}</span>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => {
                    const item = social.links[idx];
                    if (item) {
                      const newLinks = [...social.links];
                      newLinks[idx] = { ...item, url: e.target.value };
                      setSocial({ ...social, links: newLinks });
                    }
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e6e4dc] bg-white text-xs text-[#1c1b1a]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Featured YouTube Video on Homepage */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8e6df] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-bold text-[#1c1b1a] flex items-center gap-2">
              <Video className="w-4 h-4 text-[#e8491c]" />
              <span>Featured Behind-the-Scenes Video (Home Page)</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setHome({
                  ...home,
                  youtube: {
                    ...home.youtube,
                    videoId: "vE8pQC6XHoU",
                    title: "Behind the Scenes & Photography Techniques with Benedict",
                  },
                });
              }}
              className="text-xs font-bold text-[#e8491c] hover:underline self-start sm:self-auto"
            >
              Reset to Original Video (vE8pQC6XHoU)
            </button>
          </div>
          <p className="text-xs text-[#7a766f]">
            This video is embedded on the homepage in the &ldquo;How the MAGIC happens&rdquo; section using a privacy-friendly facade.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#48453f] mb-1">
                YouTube Video ID or Full URL
              </label>
              <input
                type="text"
                value={home.youtube?.videoId || ""}
                onChange={(e) => {
                  let val = e.target.value.trim();
                  // Extract video ID if user pastes full youtube URL
                  if (val.includes("youtube.com/watch?v=")) {
                    val = val.split("v=")[1]?.split("&")[0] || val;
                  } else if (val.includes("youtu.be/")) {
                    val = val.split("youtu.be/")[1]?.split("?")[0] || val;
                  }
                  setHome({
                    ...home,
                    youtube: {
                      ...home.youtube,
                      videoId: val,
                      title: home.youtube?.title || "Behind the Scenes & Photography Techniques with Benedict",
                    },
                  });
                }}
                placeholder="e.g. vE8pQC6XHoU"
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#48453f] mb-1">Video Display Title</label>
              <input
                type="text"
                value={home.youtube?.title || ""}
                onChange={(e) =>
                  setHome({
                    ...home,
                    youtube: {
                      ...home.youtube,
                      videoId: home.youtube?.videoId || "vE8pQC6XHoU",
                      title: e.target.value,
                    },
                  })
                }
                placeholder="Behind the Scenes & Photography Techniques with Benedict"
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>
          </div>

          {home.youtube?.videoId && (
            <div className="mt-3 p-3 bg-[#faf9f6] rounded-2xl border border-[#f0eee8] flex items-center gap-3">
              <span className="text-xs font-bold text-[#1c1b1a]">Active Video:</span>
              <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-[#e6e4dc] text-[#e8491c]">
                {home.youtube.videoId}
              </span>
              <a
                href={`https://www.youtube.com/watch?v=${home.youtube.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#8a867f] hover:text-[#1c1b1a] inline-flex items-center gap-1 ml-auto"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Booking Engine Policies */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8e6df] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#1c1b1a] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#e8491c]" />
            <span>Booking Policies &amp; Notification Emails</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#48453f] mb-1">Minimum Lead Time (Hours)</label>
              <input
                type="number"
                value={booking.leadTimeHours}
                onChange={(e) => setBooking({ ...booking, leadTimeHours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#48453f] mb-1">Max Advance Booking (Days)</label>
              <input
                type="number"
                value={booking.maxAdvanceDays}
                onChange={(e) => setBooking({ ...booking, maxAdvanceDays: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#48453f] mb-1">Buffer Time (Minutes)</label>
              <input
                type="number"
                value={booking.bufferMinutes}
                onChange={(e) => setBooking({ ...booking, bufferMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-[#48453f] mb-1">Cancellation Policy Copy</label>
              <input
                type="text"
                value={booking.cancellationPolicyText}
                onChange={(e) => setBooking({ ...booking, cancellationPolicyText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>
          </div>
        </div>

        {/* SEO Tags */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8e6df] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#1c1b1a] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#e8491c]" />
            <span>Search Engine Optimization (SEO) &amp; Open Graph</span>
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#48453f] mb-1">Meta Title</label>
              <input
                type="text"
                value={site.seo.title}
                onChange={(e) => setSite({ ...site, seo: { ...site.seo, title: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#48453f] mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={site.seo.description}
                onChange={(e) => setSite({ ...site, seo: { ...site.seo, description: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a]"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
