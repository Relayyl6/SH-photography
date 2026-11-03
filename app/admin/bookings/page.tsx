"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CalendarCheck2,
  ChevronLeft,
  Search,
  Clock,
  Mail,
  Calendar,
  AlertTriangle,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  CheckCircle,
  Printer,
} from "lucide-react";
import { BookingDoc } from "@/types/firebase";
import { db } from "@/lib/firebase/config";
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";
import { siteConfig } from "@/lib/site-config";
import { getBookings, DEFAULT_BOOKINGS } from "@/lib/content";

export default function AdminBookingsPage() {
  const searchParams = useSearchParams();
  const urlBookingId = searchParams.get("id");

  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingDoc | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [newNote, setNewNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function loadBookings() {
    setLoading(true);
    try {
      const loaded = await getBookings();
      setBookings(loaded);
      if (urlBookingId) {
        const found = loaded.find((b) => b.id === urlBookingId);
        if (found) setSelectedBooking(found);
      }
    } catch (err) {
      console.error("Failed to load bookings from Firestore:", err);
      setBookings(DEFAULT_BOOKINGS);
      if (urlBookingId) {
        const found = DEFAULT_BOOKINGS.find((b) => b.id === urlBookingId);
        if (found) setSelectedBooking(found);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (urlBookingId && bookings.length > 0) {
      const found = bookings.find((b) => b.id === urlBookingId);
      if (found) setSelectedBooking(found);
    }
  }, [urlBookingId, bookings]);

  const pendingReschedulesCount = bookings.filter(
    (b) => b.status === "reschedule_requested" || Boolean(b.pendingChangeRequest)
  ).length;

  const filtered = bookings.filter((b) => {
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "reschedule_requested"
        ? b.status === "reschedule_requested" || Boolean(b.pendingChangeRequest)
        : b.status === filterStatus;

    const matchesSearch =
      search === "" ||
      b.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.email.toLowerCase().includes(search.toLowerCase()) ||
      b.sessionSnapshot.name.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Call the server API to change status or approve/decline reschedule with server-side conflict detection
  const handleUpdateStatus = async (bookingId: string, targetStatus: BookingDoc["status"]) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_status",
          bookingId,
          newStatus: targetStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Cannot change status.");
        setActionLoading(false);
        return;
      }

      setActionSuccess(`Status updated to ${targetStatus}.`);
      await loadBookings();
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: targetStatus } : null));
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Approve a pending change/reschedule request with collision check
  const handleApproveReschedule = async (bookingId: string) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_change",
          bookingId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Cannot approve reschedule: slot is already booked.");
        setActionLoading(false);
        return;
      }

      setActionSuccess("Reschedule approved! The new date is locked in and the client has been notified.");
      await loadBookings();
      setSelectedBooking(null);
    } catch (err: any) {
      setActionError(err.message || "Failed to approve reschedule.");
    } finally {
      setActionLoading(false);
    }
  };

  // Decline a pending reschedule request
  const handleDeclineReschedule = async (bookingId: string) => {
    const ownerNote = prompt("Optional message to client explaining why this date is unavailable:") || undefined;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decline_change",
          bookingId,
          ownerMessage: ownerNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Cannot decline reschedule.");
        setActionLoading(false);
        return;
      }

      setActionSuccess("Reschedule request declined. Original shoot date remains locked in.");
      await loadBookings();
      setSelectedBooking(null);
    } catch (err: any) {
      setActionError(err.message || "Failed to decline reschedule.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedBooking || !newNote.trim()) return;

    const noteItem = {
      text: newNote.trim(),
      by: "Benedict Henry",
      at: Date.now(),
    };

    const updated = bookings.map((b) => {
      if (b.id === selectedBooking.id) {
        return {
          ...b,
          ownerNotes: [...(b.ownerNotes || []), noteItem],
        };
      }
      return b;
    });

    setBookings(updated);
    setSelectedBooking({
      ...selectedBooking,
      ownerNotes: [...(selectedBooking.ownerNotes || []), noteItem],
    });
    setNewNote("");

    try {
      await updateDoc(doc(db, "bookings", selectedBooking.id), {
        ownerNotes: [...(selectedBooking.ownerNotes || []), noteItem],
      });
    } catch (err) {
      console.warn("Error persisting note:", err);
    }
  };

  const getClientWhatsappUrl = (booking: BookingDoc) => {
    const rawPhone = booking.customer?.phone || "";
    const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
    const name = booking.customer?.name || "Client";
    const ref = booking.id.substring(0, 8);
    const msg = encodeURIComponent(
      `Hi ${name}, this is Benedict from SH Photography regarding your booking #${ref} (${booking.sessionSnapshot?.name}).`
    );
    return `https://wa.me/${cleanPhone || siteConfig.whatsappE164}?text=${msg}`;
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
            Bookings &amp; Inquiries Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Live pipeline synced from Firebase. Review client requests, manage reschedule approvals, confirm shoot dates, and add private studio notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadBookings}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#faf9f6] hover:bg-[#ebe9e1] text-[#2c2b29] text-xs font-bold transition-colors border border-[#e6e4dc]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#7a766f] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/book"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-[#2c2b29] text-xs font-bold transition-colors border border-[#e6e4dc]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#7a766f]" />
            <span>Public Booking Form</span>
          </Link>
        </div>
      </div>

      {/* Action feedback banners */}
      {actionError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-600 hover:text-red-900 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e8e6df] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Bookings" },
            {
              id: "reschedule_requested",
              label: `Reschedule Requests ${pendingReschedulesCount > 0 ? `(${pendingReschedulesCount})` : ""}`,
              highlight: pendingReschedulesCount > 0,
            },
            { id: "pending", label: "Pending" },
            { id: "confirmed", label: "Confirmed" },
            { id: "completed", label: "Completed" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? "bg-[#1c1b1a] text-white shadow-sm"
                  : tab.highlight
                  ? "bg-amber-100 text-amber-900 hover:bg-amber-200 font-bold"
                  : "bg-[#f5f4ef] text-[#615e57] hover:bg-[#ebe9e1]"
              }`}
            >
              {tab.highlight && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#9d9990] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, email, ref..."
            className="w-full pl-9 pr-4 py-1.5 rounded-full border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a] placeholder:text-[#aaa59c] focus:outline-none focus:ring-2 focus:ring-[#e8491c]/20"
          />
        </div>
      </div>

      {/* Bookings Table / Cards */}
      <div className="bg-white rounded-3xl border border-[#e8e6df] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#e8491c]" />
            <p className="text-xs text-[#8a867f]">Loading bookings pipeline from Firestore...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <CalendarCheck2 className="w-8 h-8 mx-auto text-[#aaa59c]" />
            <p className="text-sm font-semibold text-[#1c1b1a]">No bookings found</p>
            <p className="text-xs text-[#8a867f]">No reservations match the active filter or search term.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f0eee8]">
            {filtered.map((booking) => {
              const isReschedulePending =
                booking.status === "reschedule_requested" || Boolean(booking.pendingChangeRequest);

              const statusBadgeColor = isReschedulePending
                ? "bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse"
                : booking.status === "confirmed"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : booking.status === "pending"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : booking.status === "completed"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-red-50 text-red-700 border-red-200";

              return (
                <div
                  key={booking.id}
                  onClick={() => {
                    setSelectedBooking(booking);
                    setActionError(null);
                    setActionSuccess(null);
                  }}
                  className="p-4 sm:p-6 hover:bg-[#faf9f6] cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#f5f4ef] text-[#1c1b1a] flex items-center justify-center font-bold text-xs shrink-0 border border-[#e6e4dc]">
                      {booking.customer?.name?.substring(0, 2).toUpperCase() || "BK"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#1c1b1a]">{booking.customer?.name || "Anonymous Client"}</h4>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${statusBadgeColor}`}
                        >
                          {isReschedulePending ? "Reschedule Requested" : booking.status}
                        </span>
                        {Boolean(booking.isDoubleDate || booking.answers?.isDoubleDate) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            Double Date
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#e8491c] mt-0.5">
                        {booking.sessionSnapshot?.name || booking.sessionId}
                      </p>

                      {/* If reschedule requested, show comparison preview */}
                      {isReschedulePending && booking.pendingChangeRequest?.requestedSlot && (
                        <div className="mt-2 text-xs bg-rose-50/80 p-2.5 rounded-xl border border-rose-200 text-rose-900 space-y-1">
                          <p className="font-semibold text-[11px] flex items-center gap-1 text-rose-700">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Client requested reschedule to:
                          </p>
                          <p className="font-bold">
                            📅 {booking.pendingChangeRequest.requestedSlot.date} ({booking.pendingChangeRequest.requestedSlot.start} – {booking.pendingChangeRequest.requestedSlot.end})
                          </p>
                          <p className="text-[11px] text-rose-700 line-through">
                            Previous confirmed: {booking.slot?.date} ({booking.slot?.start} – {booking.slot?.end})
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#7a766f] mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#9d9990]" />
                          <span>{booking.slot?.date || "No date set"}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#9d9990]" />
                          <span>
                            {booking.slot?.start || "10:00"} – {booking.slot?.end || "11:30"}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-[#9d9990]" />
                          <span>{booking.customer?.email}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(booking);
                        setActionError(null);
                        setActionSuccess(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-xs font-bold text-[#1c1b1a] transition-colors border border-[#e6e4dc]"
                    >
                      {isReschedulePending ? "Review Changes &rarr;" : "View Details"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Detail Drawer Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-booking-modal,
              #printable-booking-modal * {
                visibility: visible !important;
              }
              #printable-booking-modal {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                max-height: none !important;
                height: auto !important;
                overflow: visible !important;
                box-shadow: none !important;
                border: none !important;
                padding: 20px !important;
                margin: 0 !important;
              }
              .print-hide {
                display: none !important;
              }
            }
          `}</style>

          <div
            id="printable-booking-modal"
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-[#e6e4dc] animate-in zoom-in-95 duration-200 space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#f0eee8]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e8491c]">
                  Booking Reference: {selectedBooking.id}
                </span>
                <h3 className="text-xl font-bold text-[#1c1b1a]">{selectedBooking.customer?.name}</h3>
                <p className="text-xs text-[#7a766f]">{selectedBooking.sessionSnapshot?.name}</p>
              </div>
              <div className="flex items-center gap-1.5 print-hide">
                <button
                  type="button"
                  onClick={() => window.print()}
                  title="Print Full Booking Details"
                  className="px-3 py-1.5 rounded-xl text-[#615e57] hover:text-[#1c1b1a] hover:bg-[#f5f4ef] border border-[#e6e4dc] transition-colors inline-flex items-center gap-1 text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 rounded-xl text-[#8a867f] hover:bg-[#f5f4ef]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* In-drawer action alerts */}
            {actionError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* ⚠️ RESCHEDULE REQUEST ACTION CARD */}
            {(selectedBooking.status === "reschedule_requested" || Boolean(selectedBooking.pendingChangeRequest)) && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-200 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h4 className="text-sm font-bold text-rose-950">Reschedule Requested by Client</h4>
                </div>

                <div className="text-xs space-y-2 bg-white/80 p-3.5 rounded-xl border border-rose-200/60">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Current Slot (Blocked):</p>
                      <p className="font-semibold text-gray-700 line-through">
                        {selectedBooking.slot?.date} ({selectedBooking.slot?.start} – {selectedBooking.slot?.end})
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-rose-700">Requested Slot (Held):</p>
                      <p className="font-bold text-rose-950">
                        {selectedBooking.pendingChangeRequest?.requestedSlot?.date} ({selectedBooking.pendingChangeRequest?.requestedSlot?.start} – {selectedBooking.pendingChangeRequest?.requestedSlot?.end})
                      </p>
                    </div>
                  </div>

                  {selectedBooking.pendingChangeRequest?.requestedLocation && (
                    <p className="text-gray-800">
                      <strong>Requested Location:</strong> {selectedBooking.pendingChangeRequest.requestedLocation}
                    </p>
                  )}
                  {selectedBooking.pendingChangeRequest?.requestedPhone && (
                    <p className="text-gray-800">
                      <strong>Updated Phone:</strong> {selectedBooking.pendingChangeRequest.requestedPhone}
                    </p>
                  )}
                  {selectedBooking.pendingChangeRequest?.requestedNotes && (
                    <p className="text-gray-800 italic">
                      &ldquo;{selectedBooking.pendingChangeRequest.requestedNotes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleApproveReschedule(selectedBooking.id)}
                    className="flex-1 min-w-[130px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-60 shadow-sm"
                  >
                    {actionLoading ? "Checking..." : "✓ Approve Reschedule"}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleDeclineReschedule(selectedBooking.id)}
                    className="flex-1 min-w-[130px] px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-60 shadow-sm"
                  >
                    ✕ Decline Request
                  </button>
                  <a
                    href={getClientWhatsappUrl(selectedBooking)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Client</span>
                  </a>
                </div>
              </div>
            )}

            {/* Standard Status Change Buttons */}
            <div>
              <p className="text-xs font-bold text-[#48453f] mb-2">Change Status:</p>
              <div className="flex flex-wrap gap-2">
                {(["pending", "confirmed", "completed", "cancelled"] as const).map((st) => (
                  <button
                    key={st}
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedBooking.id, st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                      selectedBooking.status === st
                        ? "bg-[#1c1b1a] text-white shadow-sm"
                        : "bg-[#f5f4ef] text-[#615e57] hover:bg-[#ebe9e1]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] space-y-2 text-xs">
              <p className="font-bold text-[#1c1b1a] mb-1">Customer Information:</p>
              <p className="text-[#615e57]">
                <strong>Email:</strong> {selectedBooking.customer?.email}
              </p>
              <p className="text-[#615e57]">
                <strong>Phone:</strong> {selectedBooking.customer?.phone || "Not provided"}
              </p>
              <p className="text-[#615e57]">
                <strong>Primary Slot:</strong> {selectedBooking.slot?.date} ({selectedBooking.slot?.start} – {selectedBooking.slot?.end})
              </p>

              {/* Double Date specification */}
              {Boolean(selectedBooking.isDoubleDate || selectedBooking.answers?.isDoubleDate) && (
                <div className="pt-2 border-t border-[#f0eee8] text-purple-900 font-medium">
                  <strong>Multiple / Double Dates:</strong> Yes
                  <br />
                  <span>
                    Secondary Date: {String(selectedBooking.secondaryDate || selectedBooking.answers?.secondaryDate || "To be confirmed with client")}
                  </span>
                </div>
              )}

              {/* Extra Info / Unaccounted details */}
              {Boolean(selectedBooking.extraInfo || selectedBooking.answers?.extraInfo) && (
                <div className="pt-2 border-t border-[#f0eee8] text-gray-800">
                  <p className="font-bold text-[#1c1b1a]">Additional Details &amp; Custom Requests:</p>
                  <p className="mt-0.5 bg-sand/40 p-2.5 rounded-lg border border-[#e8e6df] whitespace-pre-wrap">
                    {String(selectedBooking.extraInfo || selectedBooking.answers?.extraInfo || "")}
                  </p>
                </div>
              )}
            </div>

            {/* Custom Form Answers */}
            {selectedBooking.answers && Object.keys(selectedBooking.answers).length > 0 && (
              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] space-y-2 text-xs">
                <p className="font-bold text-[#1c1b1a] mb-1">Questionnaire Answers (Full Booking Form):</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto print:max-h-none print:overflow-visible">
                  {Object.entries(selectedBooking.answers).map(([k, v]) => (
                    <div key={k} className="text-[#615e57] grid grid-cols-1 sm:grid-cols-3 gap-1 py-1 border-b border-[#f5f4ef] last:border-0">
                      <span className="font-semibold capitalize text-[#1c1b1a] sm:col-span-1">{k}:</span>{" "}
                      <span className="sm:col-span-2 text-[#2c2b29] font-medium break-words">
                        {typeof v === "object" ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Studio Notes */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#48453f]">Owner Private Notes:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto print:max-h-none print:overflow-visible">
                {!selectedBooking.ownerNotes || selectedBooking.ownerNotes.length === 0 ? (
                  <p className="text-xs text-[#9d9990] italic">No private notes yet.</p>
                ) : (
                  selectedBooking.ownerNotes.map((note, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#f5f4ef] text-xs">
                      <p className="text-[#2c2b29]">{note.text}</p>
                      <p className="text-[10px] text-[#8a867f] mt-1 font-mono">
                        {note.by} · {new Date(note.at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 print-hide">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add private note for this booking..."
                  className="flex-1 px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="px-4 py-2 rounded-xl bg-[#e8491c] text-white text-xs font-bold hover:bg-[#d03d12]"
                >
                  Add Note
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#f0eee8] flex items-center justify-between gap-2 print-hide">
              <div className="flex items-center gap-2">
                <a
                  href={getClientWhatsappUrl(selectedBooking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-xs font-bold text-[#1c1b1a] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#faf9f6] text-xs font-bold text-[#1c1b1a] border border-[#d6d4cb] transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-[#1c1b1a]" />
                  <span>Print Full Details</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl bg-[#1c1b1a] hover:bg-black text-white text-xs font-bold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
