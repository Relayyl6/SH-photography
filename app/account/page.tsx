"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, isAdminEmail } from "@/lib/auth/auth-context";
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
  MessageCircle,
  User as UserIcon,
  AlertTriangle,
  Printer,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";

interface PendingChangeRequest {
  requestedSlot?: {
    date: string;
    start: string;
    end: string;
  };
  requestedLocation?: string;
  requestedPhone?: string;
  requestedNotes?: string;
  requestedAt?: number;
}

interface BookingRecord {
  id: string;
  sessionId: string;
  sessionSnapshot?: {
    name: string;
    price?: number | string;
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
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled" | "reschedule_requested";
  pendingChangeRequest?: PendingChangeRequest | null;
  createdAt?: string | number;
  source?: string;
}

export default function CustomerAccountPage() {
  const { user, isOwner, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  // Request Change modal state
  const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSubmitted, setEditSubmitted] = useState(false);
  const [editFeedback, setEditFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user) {
      if (isOwner || isAdminEmail(user.email)) {
        router.replace("/admin");
      }
    }
  }, [user, isOwner, authLoading, router]);

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

    // Fetch user bookings from Firestore via API route
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

  const openRequestChangeModal = (b: BookingRecord) => {
    setEditingBooking(b);
    setEditDate(b.pendingChangeRequest?.requestedSlot?.date || b.slot?.date || "");
    setEditStartTime(b.pendingChangeRequest?.requestedSlot?.start || b.slot?.start || "");
    setEditEndTime(b.pendingChangeRequest?.requestedSlot?.end || b.slot?.end || "");
    setEditPhone(b.pendingChangeRequest?.requestedPhone || b.customer?.phone || "");
    setEditLocation(b.pendingChangeRequest?.requestedLocation || b.answers?.location || b.answers?.venue || "");
    setEditNotes(b.pendingChangeRequest?.requestedNotes || b.answers?.notes || b.answers?.vision || "");
    setEditSubmitted(false);
    setEditFeedback(null);
  };

  const handleRequestChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking || !user) return;
    setIsSavingEdit(true);
    setEditFeedback(null);

    try {
      const res = await fetch("/api/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_change",
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
        throw new Error(result.error || "Failed to submit change request");
      }

      setEditSubmitted(true);
      setEditFeedback({
        type: "success",
        text: "Your change request has been sent to Benedict! Your session is marked as Reschedule Pending Approval until confirmed.",
      });

      // Reload bookings in background
      loadBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit change request";
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

  const handlePrintBooking = (b: BookingRecord) => {
    const sessionName = b.sessionSnapshot?.name || "Custom Photography Session";
    const date = b.slot?.date || "Date Pending";
    const time = `${b.slot?.start || "Flexible"} – ${b.slot?.end || "Flexible"}`;
    const location = b.answers?.location || b.answers?.venue || "Manchester, UK (Studio / Location)";
    const multiDay = (b as any).isDoubleDate || b.answers?.isDoubleDate
      ? `Multi-Day Coverage: ${(b as any).multiDayCount || "2 Days"} (Secondary: ${(b as any).secondaryDate || b.answers?.secondaryDate || "Held"})`
      : "";
    const extraInfo = (b as any).extraInfo || b.answers?.extraInfo || "";
    const notes = b.answers?.notes || b.answers?.vision || "";

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SH Photography - Booking #${b.id.substring(0, 8)}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1c1917; max-width: 650px; margin: 0 auto; }
            .header { border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
            .badge-confirmed { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
            h1 { margin: 0 0 6px 0; font-size: 26px; }
            .ref { color: #ea580c; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
            .section { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 18px; margin-bottom: 18px; }
            .section h3 { margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #78716c; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .label { color: #78716c; font-weight: 500; }
            .val { font-weight: 600; text-align: right; }
            .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e7e5e4; text-align: center; font-size: 12px; color: #a8a29e; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="ref">SH Photography • Booking Summary</div>
              <h1>${sessionName}</h1>
              <p style="margin: 0; color: #78716c; font-size: 13px;">Ref: #${b.id.substring(0, 8)} • Placed: ${new Date(Number(b.createdAt) || Date.now()).toLocaleDateString()}</p>
            </div>
            <span class="badge ${b.status === "confirmed" ? "badge-confirmed" : ""}">
              Status: ${b.status === "reschedule_requested" ? "Reschedule Pending" : b.status.toUpperCase()}
            </span>
          </div>

          <div class="section">
            <h3>Schedule & Location</h3>
            <div class="row"><span class="label">Primary Shoot Date:</span><span class="val">${date}</span></div>
            <div class="row"><span class="label">Time Window:</span><span class="val">${time}</span></div>
            ${multiDay ? `<div class="row"><span class="label">Multi-Day Details:</span><span class="val" style="color: #6b21a8;">${multiDay}</span></div>` : ""}
            <div class="row"><span class="label">Venue / Location:</span><span class="val">${location}</span></div>
          </div>

          <div class="section">
            <h3>Customer Contact</h3>
            <div class="row"><span class="label">Full Name:</span><span class="val">${b.customer?.name || "Client"}</span></div>
            <div class="row"><span class="label">Email:</span><span class="val">${b.customer?.email || ""}</span></div>
            <div class="row"><span class="label">Day-of Phone:</span><span class="val">${b.customer?.phone || "Not provided"}</span></div>
          </div>

          ${
            extraInfo || notes
              ? `<div class="section">
                  <h3>Notes & Special Requests</h3>
                  ${notes ? `<p style="margin: 0 0 8px 0; font-size: 13px; font-style: italic;">“${notes}”</p>` : ""}
                  ${extraInfo ? `<p style="margin: 0; font-size: 13px; color: #44403c;"><strong>Additional details:</strong> ${extraInfo}</p>` : ""}
                </div>`
              : ""
          }

          <div class="footer">
            Benedict Henry • SH Photography • Manchester, United Kingdom • ${siteConfig.phoneDisplay}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
    }
  };

  const getWhatsAppLink = (b: BookingRecord, customDate?: string, customTime?: string) => {
    const date = customDate || b.pendingChangeRequest?.requestedSlot?.date || b.slot?.date || "upcoming shoot";
    const time = customTime || b.pendingChangeRequest?.requestedSlot?.start || b.slot?.start || "";
    const session = b.sessionSnapshot?.name || "photography session";
    const msg = `Hi Benedict, I requested a reschedule for my booking #${b.id.substring(0, 8)} (${session}) to ${date}${time ? ` at ${time}` : ""}. Could you please check your dashboard to confirm?`;
    return `https://wa.me/${siteConfig.whatsappE164}?text=${encodeURIComponent(msg)}`;
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
              View confirmed shoots, request rescheduling with Benedict, export to calendar, and manage notes.
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
              const isReschedulePending = b.status === "reschedule_requested";

              const statusBadge = isReschedulePending ? (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider border bg-amber-50 text-amber-900 border-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Reschedule Pending Approval
                </span>
              ) : (
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider border ${
                    (
                      {
                        pending: "bg-amber-100 text-amber-800 border-amber-200",
                        confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
                        completed: "bg-stone-100 text-stone-800 border-stone-200",
                        cancelled: "bg-rose-100 text-rose-800 border-rose-200",
                        rescheduled: "bg-blue-100 text-blue-800 border-blue-200",
                        reschedule_requested: "bg-amber-100 text-amber-800 border-amber-300",
                      } as Record<string, string>
                    )[b.status] || "bg-stone-100 text-stone-800 border-stone-200"
                  }`}
                >
                  {b.status}
                </span>
              );

              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                    isReschedulePending ? "border-amber-300 ring-1 ring-amber-200" : "border-stone-200"
                  }`}
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
                      {statusBadge}
                    </div>

                    {/* Pending Reschedule Alert Box if applicable */}
                    {isReschedulePending && b.pendingChangeRequest && (
                      <div className="mb-4 p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                        <div className="font-bold flex items-center gap-1.5 text-amber-800">
                          <Clock className="w-3.5 h-3.5" /> Requested Reschedule Slot:
                        </div>
                        <p className="font-medium text-stone-900">
                          📅 {b.pendingChangeRequest.requestedSlot?.date} &nbsp;•&nbsp; ⏰ {b.pendingChangeRequest.requestedSlot?.start} – {b.pendingChangeRequest.requestedSlot?.end}
                        </p>
                        <p className="text-[11px] text-amber-700">
                          Awaiting confirmation from Benedict. Your previous slot remains reserved until approved.
                        </p>
                        <div className="pt-1">
                          <a
                            href={getWhatsAppLink(b)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold text-[11px]"
                          >
                            <MessageCircle className="w-3 h-3" /> Ping Benedict on WhatsApp regarding this change &rarr;
                          </a>
                        </div>
                      </div>
                    )}

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

                      {((b as any).isDoubleDate || b.answers?.isDoubleDate) && (
                        <div className="flex items-center gap-2.5 text-purple-900 font-medium">
                          <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>Double Date / Multi-Day: {(b as any).secondaryDate || b.answers?.secondaryDate || "Pending confirmation"}</span>
                        </div>
                      )}

                      {((b as any).extraInfo || b.answers?.extraInfo) && (
                        <div className="flex items-start gap-2.5">
                          <FileText className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                          <span className="text-stone-600 italic line-clamp-2">Extra: “{(b as any).extraInfo || b.answers?.extraInfo}”</span>
                        </div>
                      )}

                      {b.answers?.notes && (
                        <div className="flex items-start gap-2.5">
                          <FileText className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                          <span className="text-stone-500 italic line-clamp-2">“{b.answers.notes}”</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => downloadIcs(b)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Calendar (.ics)
                      </button>

                      <button
                        onClick={() => handlePrintBooking(b)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-stone-500" /> Print Summary
                      </button>
                    </div>

                    <button
                      onClick={() => openRequestChangeModal(b)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Request Change
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
            <h4 className="font-serif text-lg text-stone-900">Need immediate assistance or direct consultation?</h4>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-xl">
              You can also chat directly with Benedict via WhatsApp or phone for last-minute location changes, weather
              contingencies, or custom shoot requirements.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/447350156054"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Benedict
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

      {/* Request Change Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C25E00]">
                  Approval Workflow
                </span>
                <h3 className="font-serif text-lg text-stone-900">
                  Request Reschedule & Changes
                </h3>
                <p className="text-xs text-stone-500">
                  Submit requested changes for Benedict&apos;s review. Your booking remains active until approved.
                </p>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSubmitted ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl text-stone-900">Change Request Submitted!</h4>
                <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                  Benedict has received an email notification with your requested new shoot date and notes. The booking
                  is now marked as <strong>Reschedule Pending Approval</strong>.
                </p>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-left text-xs space-y-2">
                  <p className="font-semibold text-emerald-950">Recommended: Notify Benedict on WhatsApp</p>
                  <p className="text-emerald-800 text-[11px]">
                    To expedite your confirmation, send a quick pre-filled message to Benedict directly:
                  </p>
                  <a
                    href={getWhatsAppLink(editingBooking, editDate, editStartTime)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" /> Send Pre-Filled WhatsApp Note
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setEditingBooking(null);
                      loadBookings();
                    }}
                    className="px-6 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition"
                  >
                    Done & Return to Portal
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestChangeSubmit} className="p-6 space-y-4">
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
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Requested Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C25E00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Requested Start Time *
                    </label>
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
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Venue / Shoot Location
                  </label>
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
                    Reason for Reschedule / Notes for Benedict
                  </label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Let Benedict know why you'd like to reschedule or any new outfits/requests..."
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C25E00] resize-none"
                  />
                </div>

                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                  <p>
                    <strong>Note:</strong> Once submitted, Benedict will review your requested time and confirm
                    availability. You can also message him on WhatsApp immediately after submitting.
                  </p>
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
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting Request...
                      </>
                    ) : (
                      "Request Change"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
