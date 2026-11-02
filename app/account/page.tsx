"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Edit3,
  Download,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  LogOut,
  Camera,
  RefreshCw,
  X,
  Phone,
  Mail,
  User as UserIcon,
} from "lucide-react";

interface BookingRecord {
  id: string;
  sessionId: string;
  sessionSnapshot?: {
    name: string;
    price?: number;
    durationMinutes?: number;
  };
  slot?: {
    date: string;
    start: string;
    end: string;
  };
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  answers?: Record<string, string>;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  createdAt?: string;
  source?: string;
}

export default function CustomerAccountPage() {
  const { user, isOwner, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  // Edit modal state
  const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editFeedback, setEditFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Sync guest bookings from localStorage and fetch customer bookings
  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);

    // Check localStorage for guest bookings to claim
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sh_guest_bookings");
        if (stored) {
          const guestBookings = JSON.parse(stored);
          if (Array.isArray(guestBookings) && guestBookings.length > 0) {
            setClaimStatus("Syncing your past guest bookings to your account...");
            const res = await fetch("/api/bookings/claim", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                claimTokens: guestBookings.map((b: { claimToken?: string }) => b.claimToken).filter(Boolean),
                customerUid: user.uid,
                customerEmail: user.email,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.claimedCount > 0) {
                setClaimStatus(`Successfully linked ${data.claimedCount} booking(s) to your account!`);
                localStorage.removeItem("sh_guest_bookings");
              } else {
                setClaimStatus(null);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to auto-claim guest bookings:", err);
      }
    }

    // Fetch user bookings from Firestore via API route or client query
    try {
      const res = await fetch(`/api/bookings/user?uid=${user.uid}&email=${encodeURIComponent(user.email || "")}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const openEditModal = (b: BookingRecord) => {
    setEditingBooking(b);
    setEditDate(b.slot?.date || "");
    setEditStartTime(b.slot?.start || "");
    setEditEndTime(b.slot?.end || "");
    setEditPhone(b.customer?.phone || "");
    setEditLocation(b.answers?.location || b.answers?.venue || "");
    setEditNotes(b.answers?.notes || b.answers?.vision || "");
    setEditFeedback(null);
  };

  const saveBookingEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking || !user) return;
    setIsSavingEdit(true);
    setEditFeedback(null);

    try {
      const res = await fetch("/api/bookings/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: editingBooking.id,
          userUid: user.uid,
          userEmail: user.email,
          slot: {
            date: editDate,
            start: editStartTime,
            end: editEndTime || editStartTime,
          },
          customer: {
            phone: editPhone,
          },
          answers: {
            ...editingBooking.answers,
            location: editLocation,
            venue: editLocation,
            notes: editNotes,
            vision: editNotes,
          },
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to update booking");
      }

      setEditFeedback({ type: "success", text: "Booking updated successfully!" });
      setTimeout(() => {
        setEditingBooking(null);
        loadBookings();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update booking";
      setEditFeedback({ type: "error", text: msg });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const downloadIcs = (b: BookingRecord) => {
    const sessionName = b.sessionSnapshot?.name || "Photography Session";
    const date = b.slot?.date || new Date().toISOString().split("T")[0] || "2026-01-01";
    const startTime = (b.slot?.start || "10:00").replace(":", "");
    const endTime = (b.slot?.end || "12:00").replace(":", "");
    const formattedDate = date.replace(/-/g, "");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SH Photography//Booking//EN",
      "BEGIN:VEVENT",
      `SUMMARY:SH Photography: ${sessionName}`,
      `DESCRIPTION:Session with Benedict Henry (SH Photography). Location: ${b.answers?.location || "Manchester, UK"}`,
      `DTSTART:${formattedDate}T${startTime}00Z`,
      `DTEND:${formattedDate}T${endTime}00Z`,
      `LOCATION:${b.answers?.location || "Manchester, United Kingdom"}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sh-photography-${b.id.substring(0, 7)}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-600">
          <RefreshCw className="w-5 h-5 animate-spin text-[#C25E00]" />
          <span className="font-sans text-sm tracking-wide">Loading your account...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 selection:bg-[#C25E00] selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-sm tracking-wider">
              SH
            </div>
            <span className="font-serif tracking-widest text-sm uppercase text-stone-900 group-hover:text-[#C25E00] transition-colors">
              SH Photography
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isOwner && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-stone-900 text-white hover:bg-stone-800 transition"
              >
                Owner Studio &rarr;
              </Link>
            )}

            <div className="flex items-center gap-2 text-xs font-medium text-stone-600 bg-stone-100 px-3 py-1.5 rounded-full">
              <UserIcon className="w-3.5 h-3.5 text-stone-500" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{user?.email}</span>
            </div>

            <button
              onClick={() => signOut()}
              className="p-1.5 text-stone-500 hover:text-stone-900 transition rounded-lg hover:bg-stone-100"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Banner notification if guest bookings claimed */}
        {claimStatus && (
          <div className="mb-8 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#C25E00] shrink-0" />
              <span>{claimStatus}</span>
            </div>
            <button
              onClick={() => setClaimStatus(null)}
              className="text-stone-500 hover:text-stone-800 text-xs font-semibold uppercase"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium mb-3">
              <Camera className="w-3.5 h-3.5 text-[#C25E00]" /> Client Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-stone-900">Your Bookings & Sessions</h1>
            <p className="text-stone-500 text-sm mt-1">
              View upcoming photography sessions, reschedule or update your shoot notes, and export to calendar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadBookings()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-stone-300 hover:bg-stone-50 transition text-stone-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#C25E00] text-white hover:bg-[#a34f00] transition shadow-sm"
            >
              Book New Session <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#C25E00] mx-auto mb-3" />
            <p className="text-stone-500 text-sm">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/90 p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-[#C25E00] flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-xl text-stone-900 mb-2">No active bookings yet</h3>
            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
              When you reserve a portrait, wedding, family, or event shoot, all your session details, location, and
              custom notes will appear right here.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-sm font-semibold transition"
            >
              Explore Sessions & Book <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((b) => {
              const statusColors = {
                pending: "bg-amber-100 text-amber-800 border-amber-200",
                confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
                completed: "bg-stone-100 text-stone-800 border-stone-200",
                cancelled: "bg-rose-100 text-rose-800 border-rose-200",
                rescheduled: "bg-blue-100 text-blue-800 border-blue-200",
              }[b.status] || "bg-stone-100 text-stone-800 border-stone-200";

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                          Booking #{b.id.substring(0, 8)}
                        </span>
                        <h3 className="font-serif text-2xl text-stone-900 mt-0.5">
                          {b.sessionSnapshot?.name || "Custom Session"}
                        </h3>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider border ${statusColors}`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-sm text-stone-600 mb-6 border-y border-stone-100 py-4">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                        <span className="font-medium text-stone-800">
                          {b.slot?.date
                            ? new Date(b.slot.date).toLocaleDateString("en-GB", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Date TBD"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                        <span>
                          {b.slot?.start || "Flexible time"}
                          {b.slot?.end ? ` – ${b.slot.end}` : ""}
                          {b.sessionSnapshot?.durationMinutes && ` (${b.sessionSnapshot.durationMinutes} mins)`}
                        </span>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                        <span className="text-stone-700">
                          {b.answers?.location || b.answers?.venue || "Manchester, UK (or confirmed with studio)"}
                        </span>
                      </div>

                      {b.answers?.notes && (
                        <div className="flex items-start gap-2.5">
                          <FileText className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                          <span className="text-stone-500 italic line-clamp-2">“{b.answers.notes}”</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => downloadIcs(b)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Add to Calendar (.ics)
                    </button>

                    <button
                      onClick={() => openEditModal(b)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Customer Support Info */}
        <div className="mt-16 bg-[#F5EFE6] border border-stone-200/80 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h4 className="font-serif text-lg text-stone-900">Need immediate assistance or direct changes?</h4>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-xl">
              You can also chat directly with Benedict via WhatsApp or phone for last-minute location changes, weather
              contingencies, or custom requests.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/447404192667"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
            >
              WhatsApp Benedict
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-white transition"
            >
              Contact Form
            </Link>
          </div>
        </div>
      </main>

      {/* Edit Booking Details Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div>
                <h3 className="font-serif text-lg text-stone-900">
                  Edit Booking: {editingBooking.sessionSnapshot?.name || "Session"}
                </h3>
                <p className="text-xs text-stone-500">Update your preferred date, timing, location, or notes.</p>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveBookingEdit} className="p-6 space-y-4">
              {editFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    editFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {editFeedback.type === "success" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{editFeedback.text}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Shoot Date</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C25E00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C25E00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Contact Phone (for day-of communication)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+44 7..."
                    className="w-full text-xs pl-8 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C25E00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Venue / Shoot Location</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Castlefield, Manchester or Studio address"
                    className="w-full text-xs pl-8 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C25E00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Vision, Wardrobe & Special Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Tell Benedict any specific shots, outfits, or details you want to cover..."
                  className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C25E00] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#C25E00] text-white text-xs font-semibold hover:bg-[#a34f00] disabled:opacity-50 transition shadow-sm"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
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
