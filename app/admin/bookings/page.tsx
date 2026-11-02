"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck2,
  ChevronLeft,
  Search,
  Filter,
  Clock,
  Mail,
  Phone,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
} from "lucide-react";
import { BookingDoc } from "@/types/firebase";
import { db } from "@/lib/firebase/config";
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";

// Seeded initial bookings for demonstration & pipeline review
const MOCK_BOOKINGS: BookingDoc[] = [
  {
    id: "bk_901",
    sessionId: "weddings",
    sessionSnapshot: {
      name: "Weddings (Full Day Coverage)",
      price: "Bespoke Quote",
      durationMinutes: 480,
    },
    slot: {
      date: "2026-11-14",
      start: "10:00",
      end: "18:00",
    },
    answers: {
      venue: "King Street Townhouse, Manchester",
      guestCount: "85",
      specialRequests: "Natural light, documentary coverage during morning preparations",
    },
    customer: {
      name: "Eleanor & James Vance",
      email: "eleanor.vance@example.com",
      phone: "+44 7911 123456",
    },
    status: "confirmed",
    ownerNotes: [
      { text: "Pre-shoot consultation call completed via WhatsApp.", by: "Benedict Henry", at: Date.now() - 86400000 },
    ],
    customerUid: null,
    claimTokenHash: "mock_hash_1",
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 86400000,
    source: "web",
    emailStatus: { owner: "sent", customer: "sent" },
    statusHistory: [
      { status: "pending", by: "customer", at: Date.now() - 172800000 },
      { status: "confirmed", by: "Benedict Henry", at: Date.now() - 86400000 },
    ],
  },
  {
    id: "bk_902",
    sessionId: "portraits",
    sessionSnapshot: {
      name: "Beauty & Editorial Portraits",
      price: "Quote on Request",
      durationMinutes: 90,
    },
    slot: {
      date: "2026-11-18",
      start: "14:00",
      end: "15:30",
    },
    answers: {
      vision: "Studio beauty portrait session for personal brand refresh.",
      outfits: "2 wardrobe changes",
    },
    customer: {
      name: "Marcus Sterling",
      email: "marcus.sterling@example.com",
      phone: "+44 7722 987654",
    },
    status: "pending",
    ownerNotes: [],
    customerUid: null,
    claimTokenHash: "mock_hash_2",
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 43200000,
    source: "guest",
    emailStatus: { owner: "sent", customer: "pending" },
    statusHistory: [{ status: "pending", by: "guest", at: Date.now() - 43200000 }],
  },
  {
    id: "bk_903",
    sessionId: "family",
    sessionSnapshot: {
      name: "Family Milestones",
      price: "Quote on Request",
      durationMinutes: 60,
    },
    slot: {
      date: "2026-11-22",
      start: "11:00",
      end: "12:00",
    },
    answers: {
      location: "Fletcher Moss Botanical Garden, Didsbury",
      familyMembers: "Parents + 2 children (ages 3 and 6)",
    },
    customer: {
      name: "Sophia Chen",
      email: "sophia.chen@example.com",
      phone: "+44 7855 456789",
    },
    status: "pending",
    ownerNotes: [],
    customerUid: null,
    createdAt: Date.now() - 15000000,
    updatedAt: Date.now() - 15000000,
    source: "web",
    emailStatus: { owner: "sent", customer: "sent" },
    statusHistory: [{ status: "pending", by: "customer", at: Date.now() - 15000000 }],
  },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingDoc[]>(MOCK_BOOKINGS);
  const [selectedBooking, setSelectedBooking] = useState<BookingDoc | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        const q = query(collection(db, "bookings"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => d.data() as BookingDoc);
          setBookings(loaded);
        }
      } catch (err) {
        // Fallback to initial mock bookings
      }
    }
    loadBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    const matchesSearch =
      search === "" ||
      b.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.email.toLowerCase().includes(search.toLowerCase()) ||
      b.sessionSnapshot.name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingDoc["status"]) => {
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: newStatus,
          updatedAt: Date.now(),
          statusHistory: [
            ...b.statusHistory,
            { status: newStatus, by: "Benedict Henry (Owner)", at: Date.now() },
          ],
        };
      }
      return b;
    });

    setBookings(updated);
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking(updated.find((b) => b.id === bookingId) || null);
    }

    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: newStatus,
        updatedAt: Date.now(),
      });
    } catch {
      // offline/fallback
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
          ownerNotes: [...b.ownerNotes, noteItem],
        };
      }
      return b;
    });

    setBookings(updated);
    setSelectedBooking({
      ...selectedBooking,
      ownerNotes: [...selectedBooking.ownerNotes, noteItem],
    });
    setNewNote("");

    try {
      await updateDoc(doc(db, "bookings", selectedBooking.id), {
        ownerNotes: [...selectedBooking.ownerNotes, noteItem],
      });
    } catch {
      // offline
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
            Bookings &amp; Inquiries Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Review client requests, inspect form answers, confirm shoot dates, and add private studio notes.
          </p>
        </div>

        <Link
          href="/book"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-[#2c2b29] text-xs font-bold transition-colors border border-[#e6e4dc]"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#7a766f]" />
          <span>Public Booking Form</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e8e6df] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                filterStatus === st
                  ? "bg-[#1c1b1a] text-white"
                  : "bg-[#f5f4ef] text-[#615e57] hover:bg-[#ebe9e1]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#9d9990] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client or session..."
            className="w-full pl-9 pr-4 py-1.5 rounded-full border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a] placeholder:text-[#aaa59c] focus:outline-none focus:ring-2 focus:ring-[#e8491c]/20"
          />
        </div>
      </div>

      {/* Bookings Table / Cards */}
      <div className="bg-white rounded-3xl border border-[#e8e6df] shadow-sm overflow-hidden">
        <div className="divide-y divide-[#f0eee8]">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#8a867f]">
              No bookings found matching the current filters.
            </div>
          ) : (
            filtered.map((booking) => {
              const statusBadgeColor =
                booking.status === "confirmed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : booking.status === "pending"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : booking.status === "completed"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-red-50 text-red-700 border-red-200";

              return (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="p-4 sm:p-6 hover:bg-[#faf9f6] cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#f5f4ef] text-[#1c1b1a] flex items-center justify-center font-bold text-xs shrink-0 border border-[#e6e4dc]">
                      {booking.customer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#1c1b1a]">{booking.customer.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${statusBadgeColor}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#e8491c] mt-0.5">
                        {booking.sessionSnapshot.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#7a766f] mt-1.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#9d9990]" />
                          <span>{booking.slot.date}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#9d9990]" />
                          <span>
                            {booking.slot.start} – {booking.slot.end}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-[#9d9990]" />
                          <span>{booking.customer.email}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(booking);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-xs font-bold text-[#1c1b1a] transition-colors border border-[#e6e4dc]"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Booking Detail Drawer Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-[#e6e4dc] animate-in zoom-in-95 duration-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0eee8]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e8491c]">
                  Booking Reference: {selectedBooking.id}
                </span>
                <h3 className="text-xl font-bold text-[#1c1b1a]">{selectedBooking.customer.name}</h3>
                <p className="text-xs text-[#7a766f]">{selectedBooking.sessionSnapshot.name}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl text-[#8a867f] hover:bg-[#f5f4ef]"
              >
                ✕
              </button>
            </div>

            {/* Status Change Buttons */}
            <div>
              <p className="text-xs font-bold text-[#48453f] mb-2">Change Status:</p>
              <div className="flex flex-wrap gap-2">
                {(["pending", "confirmed", "completed", "cancelled"] as const).map((st) => (
                  <button
                    key={st}
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
                <strong>Email:</strong> {selectedBooking.customer.email}
              </p>
              <p className="text-[#615e57]">
                <strong>Phone:</strong> {selectedBooking.customer.phone}
              </p>
              <p className="text-[#615e57]">
                <strong>Preferred Date:</strong> {selectedBooking.slot.date} ({selectedBooking.slot.start} – {selectedBooking.slot.end})
              </p>
            </div>

            {/* Custom Form Answers */}
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] space-y-2 text-xs">
              <p className="font-bold text-[#1c1b1a] mb-1">Questionnaire Answers:</p>
              {Object.entries(selectedBooking.answers).map(([k, v]) => (
                <div key={k} className="text-[#615e57]">
                  <span className="font-semibold capitalize text-[#1c1b1a]">{k}:</span>{" "}
                  <span>{String(v)}</span>
                </div>
              ))}
            </div>

            {/* Owner Studio Notes */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#48453f]">Owner Private Notes:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedBooking.ownerNotes.length === 0 ? (
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

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add note for this booking..."
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

            <div className="pt-4 border-t border-[#f0eee8] flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl bg-[#1c1b1a] text-white text-xs font-bold"
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
