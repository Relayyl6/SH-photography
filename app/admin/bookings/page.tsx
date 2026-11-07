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
  Trash2,
  Edit3,
  X,
  User,
  MapPin,
  Sparkles,
  Palette,
  Layers,
  FileText,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Phone,
  Compass,
  Briefcase,
  Camera,
  PackageCheck,
} from "lucide-react";
import { BookingDoc } from "@/types/firebase";
import { db } from "@/lib/firebase/config";
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";
import { siteConfig } from "@/lib/site-config";
import { getBookings } from "@/lib/content";
import { getConsecutiveDates } from "@/lib/date-utils";

export default function AdminBookingsPage() {
  const searchParams = useSearchParams();
  const urlBookingId = searchParams.get("id");

  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingDoc | null>(null);
  const [editingBooking, setEditingBooking] = useState<BookingDoc | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: "",
    start: "10:00",
    end: "11:30",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    location: "",
    notes: "",
    secondaryDate: "",
    notifyClient: true,
  });
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
      const deletedIds: string[] = JSON.parse(
        (typeof window !== "undefined" && localStorage.getItem("sh_deleted_booking_ids")) || "[]"
      );
      const activeBookings = (loaded || []).filter((b) => !deletedIds.includes(b.id));
      setBookings(activeBookings);
      if (urlBookingId) {
        const found = activeBookings.find((b) => b.id === urlBookingId);
        if (found) setSelectedBooking(found);
      }
    } catch (err) {
      console.error("Failed to load bookings from Firestore:", err);
      setBookings([]);
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

    const targetBooking = bookings.find((b) => b.id === bookingId) || selectedBooking;

    // 1. Strict Conflict Check when confirming a booking (including multi-day ranges and encroachment)
    if (targetStatus === "confirmed" && targetBooking) {
      const datesToCheck: string[] = [];
      if (targetBooking.slot?.date) {
        datesToCheck.push(
          ...getConsecutiveDates(
            targetBooking.slot.date,
            targetBooking.multiDayCount || (targetBooking as any).answers?.multiDayCount
          )
        );
      }
      if (targetBooking.secondaryDate) datesToCheck.push(targetBooking.secondaryDate);
      if (Array.isArray(targetBooking.additionalDates)) {
        datesToCheck.push(...targetBooking.additionalDates.filter(Boolean));
      }

      // Check against all other currently confirmed bookings in memory
      for (const other of bookings) {
        if (other.id === bookingId) continue;
        if (other.status !== "confirmed") continue;

        const otherDates: string[] = [];
        if (other.slot?.date) {
          otherDates.push(
            ...getConsecutiveDates(
              other.slot.date,
              other.multiDayCount || (other as any).answers?.multiDayCount
            )
          );
        }
        if (other.secondaryDate) otherDates.push(other.secondaryDate);
        if (Array.isArray(other.additionalDates)) {
          otherDates.push(...other.additionalDates.filter(Boolean));
        }

        for (const d of datesToCheck) {
          if (otherDates.includes(d)) {
            const conflictMsg = `Cannot confirm booking: Date ${d} conflicts with confirmed photoshoot for ${other.customer?.name || "another client"} (${other.sessionSnapshot?.name || "Shoot"} #${other.id.substring(0, 8)}). The shoot spans multiple days encroaching into this date. Benedict Henry only accepts 1 event per day.`;
            setActionError(conflictMsg);
            setActionLoading(false);
            return;
          }
        }
      }
    }

    // 2. Call server route for notification emails & server-side conflict verification FIRST
    try {
      const res = await fetch("/api/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_status",
          bookingId,
          newStatus: targetStatus,
          bookingFallback: targetBooking,
        }),
      });

      const text = await res.text();
      let resData: any = {};
      try {
        resData = JSON.parse(text);
      } catch {
        resData = { error: text };
      }

      if (!res.ok) {
        setActionError(resData.error || resData.conflictDetail || "Failed to update booking status due to conflict.");
        setActionLoading(false);
        return;
      }

      // 3. Update client state locally and write to DB
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: targetStatus } : b))
      );
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: targetStatus } : null));
      }

      try {
        const { db } = await import("@/lib/firebase/config");
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(
          doc(db, "bookings", bookingId),
          {
            status: targetStatus,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      } catch (clientErr) {
        console.warn("Client SDK status update warning:", clientErr);
      }

      if (targetStatus === "confirmed") {
        setActionSuccess("Booking confirmed! Official confirmation email sent to client.");
      } else {
        setActionSuccess(`Status updated to ${targetStatus}.`);
      }
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (apiErr: any) {
      console.warn("API status update error:", apiErr);
      setActionError(apiErr.message || "Failed to communicate with booking server.");
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

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: "Failed to parse response." };
      }

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

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: "Failed to parse response." };
      }

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

  // Open Direct Reschedule Modal
  const handleOpenReschedule = (booking: BookingDoc) => {
    setEditingBooking(booking);
    setRescheduleForm({
      date: booking.slot?.date || "",
      start: booking.slot?.start || "10:00",
      end: booking.slot?.end || "11:30",
      customerName: booking.customer?.name || "",
      customerEmail: booking.customer?.email || "",
      customerPhone: booking.customer?.phone || "",
      location: (booking.answers?.location as string) || "",
      notes: (booking.answers?.notes as string) || "",
      secondaryDate: (booking.secondaryDate || booking.answers?.secondaryDate || "") as string,
      notifyClient: true,
    });
    setActionError(null);
    setActionSuccess(null);
  };

  // Save Direct Reschedule
  const handleSaveReschedule = async () => {
    if (!editingBooking) return;
    if (!rescheduleForm.date) {
      setActionError("Please choose a shoot date.");
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          bookingId: editingBooking.id,
          newDate: rescheduleForm.date,
          newStart: rescheduleForm.start,
          newEnd: rescheduleForm.end,
          customerName: rescheduleForm.customerName,
          customerEmail: rescheduleForm.customerEmail,
          customerPhone: rescheduleForm.customerPhone,
          location: rescheduleForm.location,
          notes: rescheduleForm.notes,
          secondaryDate: rescheduleForm.secondaryDate,
          notifyClient: rescheduleForm.notifyClient,
          bookingFallback: editingBooking,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: "Failed to parse reschedule response." };
      }

      if (!res.ok) {
        setActionError(data.error || "Failed to reschedule booking.");
        setActionLoading(false);
        return;
      }

      setActionSuccess(`Booking ${editingBooking.id} successfully rescheduled to ${rescheduleForm.date}!`);
      if (data.updatedBooking) {
        if (selectedBooking && selectedBooking.id === editingBooking.id) {
          setSelectedBooking(data.updatedBooking);
        }
        setBookings((prev) =>
          prev.map((b) => (b.id === editingBooking.id ? data.updatedBooking : b))
        );
      } else {
        await loadBookings();
      }
      setEditingBooking(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || "Failed to reschedule booking.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Booking
  const handleDeleteBooking = async (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId) || selectedBooking;
    const confirmMsg = `Are you sure you want to delete this booking for ${target?.customer?.name || "this client"} (${bookingId})? This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    setActionError(null);

    // 1. Instantly update UI and remove from active list
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking(null);
    }

    // 2. Persist deletion in client localStorage cache so mock / seeded records or cached items stay deleted
    try {
      const deletedSet = new Set<string>(
        JSON.parse((typeof window !== "undefined" && localStorage.getItem("sh_deleted_booking_ids")) || "[]")
      );
      deletedSet.add(bookingId);
      localStorage.setItem("sh_deleted_booking_ids", JSON.stringify(Array.from(deletedSet)));
    } catch (e) {
      console.warn("Local storage delete cache error:", e);
    }

    // 3. Delete from Firestore via client SDK
    try {
      const { db } = await import("@/lib/firebase/config");
      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "bookings", bookingId));
    } catch (clientErr) {
      console.warn("Client SDK delete error (proceeding to server action):", clientErr);
    }

    // 4. Also call server endpoint safely without exploding on HTML error responses
    try {
      const res = await fetch("/api/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          bookingId,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          if (json.error) console.warn("Server delete warning:", json.error);
        } catch {
          // Response was HTML or gateway error, ignore since client state and localStorage already pruned it
        }
      }
    } catch (apiErr) {
      console.warn("API delete call failed:", apiErr);
    }

    setActionSuccess("Booking deleted permanently.");
    setTimeout(() => setActionSuccess(null), 3000);
    setActionLoading(false);
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

  const handlePrintBooking = (b: BookingDoc) => {
    const a = b.answers || {};
    const clientName = b.customer?.name || "Anonymous Client";
    const clientEmail = b.customer?.email || "";
    const clientPhone = b.customer?.phone || "";
    const clientPrefContact = (a.preferredContact as string) || (b.customer as any)?.preferredContact || "Email";
    const clientCompany = (a.companyName as string) || (a.company as string) || "";
    const clientInstagram = (a.instagramHandle as string) || (a.instagram as string) || "";

    const sessionTitle = b.sessionSnapshot?.name || b.sessionId || "Photography Session";
    const shootDate = b.slot?.date || "Date Pending";
    const shootTime = `${b.slot?.start || "10:00"} – ${b.slot?.end || "11:30"}`;
    const duration = (a.estimatedDuration as string) || (a.duration as string) || "Standard";
    const subjects = (a.numSubjects as string) || (a.subjects as string) || "Individual / Couple";

    const locType = (a.locationType as string) || "Studio / Venue";
    const address = (a.address as string) || (a.venue as string) || "To be confirmed";
    const city = (a.cityPostcode as string) || (a.city as string) || "Manchester, UK";
    const setting = (a.indoorsOutdoors as string) || "Indoors";
    const travel = (a.travelRequired as string) === "Yes" ? (a.travelDetails as string) || "Yes" : "No";

    const vision = (a.vision as string) || (a.narrative as string) || "Standard signature shoot";
    const styles = Array.isArray(a.stylePreferences) ? a.stylePreferences.join(", ") : (a.stylePreferences as string) || "Standard signature style";
    const color = (a.colorPreference as string) || "Balanced Color & B/W";
    const mustHave = (a.mustHaveShots as string) || "";
    const requests = (a.specialRequests as string) || "";
    const extra = (a.extraInfo as string) || "";

    const deliverables = Array.isArray(a.deliverables) ? a.deliverables.join(", ") : (a.deliverables as string) || "Standard digital gallery";
    const turnaround = (a.turnaroundTime as string) || "Standard (2–3 weeks)";
    const usage = (a.usageRights as string) || "Personal & Social Media Rights";
    const budget = (a.budgetRange as string) || "Discuss";

    const STANDARD_KEYS = new Set([
      'fullName', 'email', 'phone', 'preferredContact', 'companyName', 'instagramHandle', 'howDidYouFindMe',
      'serviceCategory', 'sessionSubType', 'numSubjects', 'estimatedDuration', 'preferredDate', 'preferredStartTime',
      'dateFlexible', 'alternateDate', 'isDoubleDate', 'secondaryDate', 'multiDayCount', 'additionalDates', 'additionalDatesText',
      'locationType', 'address', 'cityPostcode', 'indoorsOutdoors', 'travelRequired', 'travelDetails', 'parkingNotes',
      'vision', 'stylePreferences', 'colorPreference', 'inspirationLinks', 'mustHaveShots', 'specialRequests', 'extraInfo',
      'deliverables', 'editedImagesExpected', 'turnaroundTime', 'usageRights', 'secondShooter',
      'budgetRange', 'budgetFlexible', 'howSoon', 'depositAck',
      'termsAgreed', 'privacyAgreed', 'contactConsent'
    ]);
    const customEntries = Object.entries(a).filter(
      ([k, v]) => !STANDARD_KEYS.has(k) && v !== undefined && v !== null && v !== ""
    );

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Call Sheet - ${clientName} (#${b.id})</title>
          <style>
            @page { size: A4; margin: 15mm 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1c1917; margin: 0; padding: 20px; font-size: 13px; line-height: 1.5; }
            .header { border-bottom: 2px solid #1c1917; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
            .brand { font-size: 18px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; margin: 0; }
            .sub { font-size: 11px; color: #57534e; margin-top: 3px; }
            .ref { font-family: monospace; font-size: 13px; font-weight: 700; text-align: right; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-top: 4px; border: 1px solid #d6d3d1; }
            .card { border: 1px solid #e7e5e4; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px; break-inside: avoid; page-break-inside: avoid; }
            .card-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 10px 0; padding-bottom: 6px; border-bottom: 1px solid #f5f5f4; color: #ea580c; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            .label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #78716c; margin: 0 0 2px 0; }
            .val { font-size: 12px; font-weight: 600; color: #1c1917; margin: 0; word-break: break-word; }
            .quote-box { background: #fafaf9; border-left: 3px solid #ea580c; padding: 8px 12px; margin-top: 6px; font-style: italic; }
            .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e7e5e4; font-size: 11px; color: #78716c; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="brand">SH Photography · Shoot Call Sheet</h1>
              <p class="sub">Lead Photographer: Benedict Henry · Manchester, United Kingdom · ${siteConfig.phoneDisplay} · ${siteConfig.email}</p>
            </div>
            <div class="ref">
              REF: #${b.id}<br>
              <span class="badge">${b.status}</span>
            </div>
          </div>

          <div class="card">
            <h2 class="card-title">1. Customer Profile & Contact</h2>
            <div class="grid-3">
              <div><p class="label">Client Name</p><p class="val">${clientName}</p></div>
              <div><p class="label">Email Address</p><p class="val">${clientEmail || "None"}</p></div>
              <div><p class="label">Phone Number</p><p class="val">${clientPhone || "None"}</p></div>
              <div><p class="label">Preferred Contact</p><p class="val">${clientPrefContact}</p></div>
              <div><p class="label">Company / Private</p><p class="val">${clientCompany || "Individual / Private"}</p></div>
              <div><p class="label">Instagram / Social</p><p class="val">${clientInstagram || "None"}</p></div>
            </div>
          </div>

          <div class="card">
            <h2 class="card-title">2. Session & Schedule Details</h2>
            <div class="grid-3">
              <div><p class="label">Service Category</p><p class="val">${sessionTitle}</p></div>
              <div><p class="label">Shoot Date</p><p class="val">📅 ${shootDate}</p></div>
              <div><p class="label">Time Window</p><p class="val">⏰ ${shootTime}</p></div>
              <div><p class="label">Estimated Duration</p><p class="val">${duration}</p></div>
              <div><p class="label">Number of Subjects</p><p class="val">${subjects}</p></div>
              ${b.secondaryDate ? `<div><p class="label">Secondary Date (Multi-Day)</p><p class="val">📅 ${b.secondaryDate}</p></div>` : ""}
            </div>
          </div>

          <div class="card">
            <h2 class="card-title">3. Location & Logistics</h2>
            <div class="grid">
              <div><p class="label">Location Type</p><p class="val">${locType}</p></div>
              <div><p class="label">Indoors / Outdoors</p><p class="val">${setting}</p></div>
              <div><p class="label">Address / Venue</p><p class="val">${address}</p></div>
              <div><p class="label">City / Postcode</p><p class="val">${city}</p></div>
              <div><p class="label">Travel Required</p><p class="val">${travel}</p></div>
            </div>
          </div>

          <div class="card">
            <h2 class="card-title">4. Creative Brief & Style</h2>
            <div><p class="label">Vision & Concept</p><div class="quote-box">“${vision}”</div></div>
            <div class="grid" style="margin-top: 10px;">
              <div><p class="label">Style Preferences</p><p class="val">${styles}</p></div>
              <div><p class="label">Color Preference</p><p class="val">${color}</p></div>
              ${mustHave ? `<div><p class="label">Must-Have Shots</p><p class="val">${mustHave}</p></div>` : ""}
              ${requests ? `<div><p class="label">Special Requests</p><p class="val">${requests}</p></div>` : ""}
              ${extra ? `<div><p class="label">Extra Notes</p><p class="val">${extra}</p></div>` : ""}
            </div>
          </div>

          <div class="card">
            <h2 class="card-title">5. Deliverables & Budget</h2>
            <div class="grid-3">
              <div><p class="label">Deliverables</p><p class="val">${deliverables}</p></div>
              <div><p class="label">Turnaround Time</p><p class="val">${turnaround}</p></div>
              <div><p class="label">Usage Rights</p><p class="val">${usage}</p></div>
              <div><p class="label">Budget Range</p><p class="val">${budget}</p></div>
            </div>
          </div>

          ${customEntries.length > 0 ? `
          <div class="card">
            <h2 class="card-title">6. Additional Questionnaire Responses</h2>
            <div class="grid">
              ${customEntries.map(([k, v]) => `<div><p class="label">${k.replace(/([A-Z])/g, ' $1')}</p><p class="val">${Array.isArray(v) ? v.join(', ') : String(v)}</p></div>`).join('')}
            </div>
          </div>` : ""}

          <div class="footer">
            Benedict Henry • SH Photography • Manchester, United Kingdom • ${siteConfig.phoneDisplay} • ${siteConfig.email}
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
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="space-y-6 sm:space-y-8 print:hidden">
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
                        handleOpenReschedule(booking);
                      }}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-[#faf9f6] text-xs font-bold text-[#e8491c] transition-colors border border-[#e8e6df] inline-flex items-center gap-1 shadow-sm"
                      title="Reschedule Shoot Date"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#e8491c]" />
                      <span>Reschedule</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(booking);
                        setActionError(null);
                        setActionSuccess(null);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-xs font-bold text-[#1c1b1a] transition-colors border border-[#e6e4dc]"
                    >
                      {isReschedulePending ? "Review Changes &rarr;" : "View Details"}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBooking(booking.id);
                      }}
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                      title="Delete Booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Booking Detail Drawer Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 booking-modal-backdrop">
          <style jsx global>{`
            @media print {
              @page {
                size: auto;
                margin: 8mm 12mm;
              }

              html, body {
                background: #ffffff !important;
                color: #000000 !important;
                height: auto !important;
                min-height: auto !important;
                overflow: visible !important;
                margin: 0 !important;
                padding: 0 !important;
              }

              /* Hide extraneous site, admin shell, and background elements */
              header, nav, aside, footer, .print-hide, .admin-sidebar, .admin-header, .print\\:hidden, [class*="print:hidden"] {
                display: none !important;
              }

              main {
                padding: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
              }

              /* Completely flatten backdrop to avoid fixed overlapping */
              .booking-modal-backdrop {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                background: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
                z-index: 99999 !important;
                display: block !important;
                overflow: visible !important;
              }

              /* Flatten the modal container into normal document flow */
              #printable-booking-modal {
                position: relative !important;
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                padding: 10px !important;
                margin: 0 !important;
                transform: none !important;
                animation: none !important;
              }

              /* Avoid breaking cards across page breaks and ensure high-contrast print styling */
              .print-section-card {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                margin-bottom: 14px !important;
                background: #ffffff !important;
                border: 1px solid #d1d5db !important;
                border-radius: 8px !important;
              }
            }
          `}</style>

          <div
            id="printable-booking-modal"
            className="bg-white rounded-3xl max-w-3xl lg:max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-[#e6e4dc] animate-in zoom-in-95 duration-200 space-y-6"
          >
            {/* Printable Call Sheet Header (Print Only) */}
            <div className="hidden print:block pb-4 mb-3 border-b-2 border-black">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-wider text-black">
                    SH Photography · Shoot Call Sheet &amp; Booking Dossier
                  </h1>
                  <p className="text-xs text-gray-700 mt-0.5">
                    Lead Photographer: Benedict Henry · Manchester, United Kingdom · {siteConfig.phoneDisplay} · {siteConfig.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-black">REF: #{selectedBooking.id}</p>
                  <p className="text-[10px] text-gray-600 uppercase font-semibold">
                    Status: {selectedBooking.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-[#f0eee8] print:hidden">
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
                  onClick={() => handleOpenReschedule(selectedBooking)}
                  title="Edit or Reschedule Shoot"
                  className="px-3 py-1.5 rounded-xl text-[#e8491c] hover:bg-[#fff2ed] border border-[#fbdcd0] transition-colors inline-flex items-center gap-1 text-xs font-bold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Reschedule</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintBooking(selectedBooking)}
                  title="Print Full Booking Details"
                  className="px-3 py-1.5 rounded-xl text-[#615e57] hover:text-[#1c1b1a] hover:bg-[#f5f4ef] border border-[#e6e4dc] transition-colors inline-flex items-center gap-1 text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                  title="Delete Booking"
                  className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
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

                <div className="flex flex-wrap gap-2 pt-1 print-hide">
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
            <div className="print-hide">
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

            {/* ========================================================================= */}
            {/* EXHAUSTIVE QUESTIONNAIRE & BOOKING SPECIFICATION */}
            {/* ========================================================================= */}
            {(() => {
              const a = (selectedBooking.answers || {}) as Record<string, any>;

              // 1. Client profile
              const clientName = a.fullName || selectedBooking.customer?.name || "Client";
              const clientEmail = a.email || selectedBooking.customer?.email || "";
              const clientPhone = a.phone || selectedBooking.customer?.phone || "";
              const clientPrefContact = a.preferredContact || "Email";
              const clientCompany = a.companyName || "";
              const clientInstagram = a.instagramHandle || "";
              const clientReferral = a.howDidYouFindMe || "";

              // 2. Session & Scheduling
              const sessCategory = a.serviceCategory || selectedBooking.sessionSnapshot?.name || selectedBooking.sessionId || "Standard Session";
              const sessSubType = a.sessionSubType || "";
              const sessNumSubjects = a.numSubjects || "";
              const sessDuration = a.estimatedDuration || "";
              const sessDate = a.preferredDate || selectedBooking.slot?.date || "To be arranged";
              const sessTime = a.preferredStartTime || (selectedBooking.slot ? `${selectedBooking.slot.start} – ${selectedBooking.slot.end}` : "Flexible");
              const sessDateFlexible = a.dateFlexible || "";
              const sessAltDate = a.alternateDate || "";
              const sessIsDoubleDate = Boolean(selectedBooking.isDoubleDate || a.isDoubleDate);
              const sessSecondaryDate = selectedBooking.secondaryDate || a.secondaryDate || "";
              const sessMultiDayCount = a.multiDayCount || "";
              const sessAdditionalDates = Array.isArray(a.additionalDates) ? a.additionalDates : [];
              const sessAdditionalDatesText = a.additionalDatesText || "";

              // 3. Location & Travel
              const locType = a.locationType || "";
              const locAddress = a.address || "";
              const locCityPostcode = a.cityPostcode || "";
              const locIndoorsOutdoors = a.indoorsOutdoors || "";
              const locTravelRequired = a.travelRequired || "";
              const locTravelDetails = a.travelDetails || "";
              const locParkingNotes = a.parkingNotes || "";

              // 4. Creative Vision & Aesthetic
              const creativeVision = a.vision || "";
              const creativeStyles: string[] = Array.isArray(a.stylePreferences)
                ? a.stylePreferences
                : a.stylePreferences ? [String(a.stylePreferences)] : [];
              const creativeColorPref = a.colorPreference || "";
              const creativeInspirationLinks = a.inspirationLinks || "";
              const creativeMustHaveShots = a.mustHaveShots || "";
              const creativeSpecialRequests = a.specialRequests || "";
              const creativeExtraInfo = a.extraInfo || selectedBooking.extraInfo || "";

              // 5. Deliverables & Production
              const prodDeliverables: string[] = Array.isArray(a.deliverables)
                ? a.deliverables
                : a.deliverables ? [String(a.deliverables)] : [];
              const prodEditedImages = a.editedImagesExpected || "";
              const prodTurnaround = a.turnaroundTime || "";
              const prodUsageRights = a.usageRights || "";
              const prodSecondShooter = a.secondShooter || "";

              // 6. Budget & Timeline
              const finBudgetRange = a.budgetRange || "";
              const finBudgetFlexible = a.budgetFlexible || "";
              const finHowSoon = a.howSoon || "";
              const finDepositAck = Boolean(a.depositAck);

              // 7. Consents
              const legalTermsAgreed = Boolean(a.termsAgreed);
              const legalPrivacyAgreed = Boolean(a.privacyAgreed);
              const legalContactConsent = Boolean(a.contactConsent);

              // 8. Custom / Unaccounted fields
              const STANDARD_KEYS = new Set([
                'fullName', 'email', 'phone', 'preferredContact', 'companyName', 'instagramHandle', 'howDidYouFindMe',
                'serviceCategory', 'sessionSubType', 'numSubjects', 'estimatedDuration', 'preferredDate', 'preferredStartTime',
                'dateFlexible', 'alternateDate', 'isDoubleDate', 'secondaryDate', 'multiDayCount', 'additionalDates', 'additionalDatesText',
                'locationType', 'address', 'cityPostcode', 'indoorsOutdoors', 'travelRequired', 'travelDetails', 'parkingNotes',
                'vision', 'stylePreferences', 'colorPreference', 'inspirationLinks', 'mustHaveShots', 'specialRequests', 'extraInfo',
                'deliverables', 'editedImagesExpected', 'turnaroundTime', 'usageRights', 'secondShooter',
                'budgetRange', 'budgetFlexible', 'howSoon', 'depositAck',
                'termsAgreed', 'privacyAgreed', 'contactConsent'
              ]);
              const customEntries = Object.entries(a).filter(
                ([k, v]) => !STANDARD_KEYS.has(k) && v !== undefined && v !== null && v !== ""
              );

              return (
                <div className="space-y-4">
                  {/* Section 1: Customer Profile & Contact */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] space-y-3 text-xs print-section-card print:bg-white print:border-gray-300">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#eceae3]">
                      <User className="w-4 h-4 text-[#e8491c]" />
                      <h4 className="font-bold text-[#1c1b1a] text-sm">1. Customer Profile &amp; Contact</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Full Name</p>
                        <p className="font-bold text-[#1c1b1a] text-sm">{clientName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Email Address</p>
                        {clientEmail ? (
                          <a href={`mailto:${clientEmail}`} className="font-semibold text-[#e8491c] hover:underline flex items-center gap-1">
                            <span>{clientEmail}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <p className="font-medium text-gray-500">Not provided</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Phone Number</p>
                        {clientPhone ? (
                          <a href={`tel:${clientPhone}`} className="font-semibold text-[#1c1b1a] hover:underline flex items-center gap-1">
                            <span>{clientPhone}</span>
                            <Phone className="w-3 h-3 text-emerald-600" />
                          </a>
                        ) : (
                          <p className="font-medium text-gray-500">Not provided</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Preferred Contact Method</p>
                        <p className="font-semibold text-[#1c1b1a]">{clientPrefContact}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Company / Organization</p>
                        <p className="font-semibold text-[#1c1b1a]">{clientCompany || "Individual / Private"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Instagram / Social Handle</p>
                        {clientInstagram ? (
                          <a
                            href={`https://instagram.com/${clientInstagram.replace(/^@/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#e8491c] hover:underline"
                          >
                            {clientInstagram.startsWith("@") ? clientInstagram : `@${clientInstagram}`}
                          </a>
                        ) : (
                          <p className="font-medium text-gray-500">None provided</p>
                        )}
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Referral Source</p>
                        <p className="font-semibold text-[#1c1b1a]">{clientReferral || "Direct Website Visit"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Session & Scheduling */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] space-y-3 text-xs print-section-card print:bg-white print:border-gray-300">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#eceae3]">
                      <Calendar className="w-4 h-4 text-[#e8491c]" />
                      <h4 className="font-bold text-[#1c1b1a] text-sm">2. Session &amp; Schedule Details</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Service Category</p>
                        <p className="font-bold text-[#1c1b1a]">{sessCategory}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Session Sub-Type / Concept</p>
                        <p className="font-semibold text-[#1c1b1a]">{sessSubType || "Bespoke Shoot"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Number of Subjects</p>
                        <p className="font-semibold text-[#1c1b1a]">{sessNumSubjects || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Primary Shoot Date</p>
                        <p className="font-bold text-emerald-800 text-sm">📅 {sessDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Time Slot / Preferred Start</p>
                        <p className="font-bold text-[#1c1b1a]">⏰ {sessTime}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Estimated Duration</p>
                        <p className="font-semibold text-[#1c1b1a]">{sessDuration || "Standard package duration"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Date Flexible?</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          sessDateFlexible === "Yes" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {sessDateFlexible === "Yes" ? "Yes — Client has flexible schedule" : sessDateFlexible || "No / Strict"}
                        </span>
                      </div>
                      {sessAltDate && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[#7a766f]">Alternate Shoot Date</p>
                          <p className="font-semibold text-gray-700">📅 {sessAltDate}</p>
                        </div>
                      )}
                    </div>

                    {/* Double Date / Multi-day Alert box */}
                    {sessIsDoubleDate && (
                      <div className="mt-3 p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Layers className="w-4 h-4 text-purple-700" />
                          <span>Multi-Day / Double Date Shoot Confirmed</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                          <p><strong>Secondary Date:</strong> {sessSecondaryDate || "To be arranged with client"}</p>
                          {sessMultiDayCount && <p><strong>Total Days:</strong> {sessMultiDayCount}</p>}
                        </div>
                        {(sessAdditionalDates.length > 0 || sessAdditionalDatesText) && (
                          <div className="pt-1 text-xs">
                            <strong>Additional Specified Dates:</strong>{" "}
                            {sessAdditionalDates.length > 0 ? sessAdditionalDates.join(", ") : sessAdditionalDatesText}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section 3: Location & Logistics */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] space-y-3 text-xs print-section-card print:bg-white print:border-gray-300">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#eceae3]">
                      <MapPin className="w-4 h-4 text-[#e8491c]" />
                      <h4 className="font-bold text-[#1c1b1a] text-sm">3. Shoot Location &amp; Travel Logistics</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Location Type</p>
                        <p className="font-bold text-[#1c1b1a]">{locType || "Studio / Venue"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Environment</p>
                        <p className="font-semibold text-[#1c1b1a]">{locIndoorsOutdoors || "Indoors"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Travel Outside Manchester?</p>
                        <p className={`font-bold ${locTravelRequired === "Yes" ? "text-amber-800" : "text-gray-700"}`}>
                          {locTravelRequired === "Yes" ? "Yes — Travel Required" : "No — Local Manchester"}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Street Address / Venue</p>
                        <p className="font-semibold text-[#1c1b1a]">{locAddress || "Studio / Venue address to be confirmed"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">City / Postcode</p>
                        <p className="font-semibold text-[#1c1b1a]">{locCityPostcode || "Manchester, UK"}</p>
                      </div>
                      {locTravelDetails && (
                        <div className="sm:col-span-2 md:col-span-3">
                          <p className="text-[10px] uppercase font-bold text-[#7a766f]">Travel &amp; Transit Details</p>
                          <p className="font-semibold text-[#1c1b1a]">{locTravelDetails}</p>
                        </div>
                      )}
                      {locParkingNotes && (
                        <div className="sm:col-span-2 md:col-span-3">
                          <p className="text-[10px] uppercase font-bold text-[#7a766f]">Parking &amp; Venue Access Notes</p>
                          <p className="font-semibold text-[#1c1b1a]">{locParkingNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 4: Creative Vision & Aesthetics */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] space-y-3 text-xs print-section-card print:bg-white print:border-gray-300">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#eceae3]">
                      <Sparkles className="w-4 h-4 text-[#e8491c]" />
                      <h4 className="font-bold text-[#1c1b1a] text-sm">4. Creative Concept, Vision &amp; Style</h4>
                    </div>

                    {/* Vision Statement */}
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#7a766f] mb-1">Creative Narrative &amp; Vision</p>
                      <div className="p-3.5 rounded-xl bg-white border border-[#e6e4dc] text-gray-800 italic whitespace-pre-wrap leading-relaxed shadow-inner">
                        &ldquo;{creativeVision || "No specific narrative submitted."}&rdquo;
                      </div>
                    </div>

                    {/* Style Preferences Chips */}
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#7a766f] mb-1.5">Style Preferences</p>
                      {creativeStyles.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {creativeStyles.map((style, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-[#fff2ed] text-[#e8491c] font-bold text-[11px] border border-[#fbdcd0]"
                            >
                              {style}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="font-medium text-gray-500">Standard SH Photography signature style</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Color Palette Preference</p>
                        <p className="font-semibold text-[#1c1b1a]">{creativeColorPref || "Color & B/W Balanced"}</p>
                      </div>

                      {creativeInspirationLinks && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[#7a766f]">Inspiration Links / Moodboard</p>
                          {creativeInspirationLinks.startsWith("http") ? (
                            <a
                              href={creativeInspirationLinks}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-[#e8491c] hover:underline flex items-center gap-1 truncate"
                            >
                              <span className="truncate">{creativeInspirationLinks}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <p className="font-semibold text-[#1c1b1a] whitespace-pre-wrap">{creativeInspirationLinks}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {creativeMustHaveShots && (
                      <div className="pt-1">
                        <p className="text-[10px] uppercase font-bold text-[#7a766f] mb-0.5">Must-Have Shots / Key Moments</p>
                        <div className="p-2.5 rounded-xl bg-white border border-[#e6e4dc] whitespace-pre-wrap font-medium text-gray-800">
                          {creativeMustHaveShots}
                        </div>
                      </div>
                    )}

                    {creativeSpecialRequests && (
                      <div className="pt-1">
                        <p className="text-[10px] uppercase font-bold text-[#7a766f] mb-0.5">Special Requests, Wardrobe &amp; Props</p>
                        <div className="p-2.5 rounded-xl bg-white border border-[#e6e4dc] whitespace-pre-wrap font-medium text-gray-800">
                          {creativeSpecialRequests}
                        </div>
                      </div>
                    )}

                    {creativeExtraInfo && (
                      <div className="pt-1">
                        <p className="text-[10px] uppercase font-bold text-[#7a766f] mb-0.5">Additional Client Comments &amp; Notes</p>
                        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 whitespace-pre-wrap font-medium text-gray-800">
                          {creativeExtraInfo}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 5: Deliverables & Production */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] space-y-3 text-xs print-section-card print:bg-white print:border-gray-300">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#eceae3]">
                      <PackageCheck className="w-4 h-4 text-[#e8491c]" />
                      <h4 className="font-bold text-[#1c1b1a] text-sm">5. Deliverables &amp; Post-Production</h4>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#7a766f] mb-1.5">Required Deliverables</p>
                      {prodDeliverables.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {prodDeliverables.map((d, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-[#f0f9ff] text-sky-800 font-bold text-[11px] border border-sky-200"
                            >
                              ✓ {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="font-medium text-gray-500">Standard session digital gallery</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Edited Images Expected</p>
                        <p className="font-semibold text-[#1c1b1a]">{prodEditedImages || "Standard session package"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Turnaround Speed</p>
                        <p className="font-semibold text-[#1c1b1a]">{prodTurnaround || "Standard (2–3 weeks)"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Usage Rights</p>
                        <p className="font-semibold text-[#1c1b1a]">{prodUsageRights || "Personal & Social Media Rights"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Second Shooter Required?</p>
                        <p className="font-semibold text-[#1c1b1a]">{prodSecondShooter || "No / Lead Only"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Budget & Investment */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] space-y-3 text-xs print-section-card print:bg-white print:border-gray-300">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#eceae3]">
                      <DollarSign className="w-4 h-4 text-[#e8491c]" />
                      <h4 className="font-bold text-[#1c1b1a] text-sm">6. Budget, Timeline &amp; Investment</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Stated Budget Range</p>
                        <p className="font-black text-[#e8491c] text-sm">{finBudgetRange || "To discuss"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Budget Flexibility</p>
                        <p className="font-semibold text-[#1c1b1a]">{finBudgetFlexible || "Standard"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Booking Horizon / Urgency</p>
                        <p className="font-semibold text-[#1c1b1a]">{finHowSoon || "Standard planning"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#7a766f]">Deposit Acknowledged</p>
                        <p className={`font-bold ${finDepositAck ? "text-emerald-700" : "text-amber-700"}`}>
                          {finDepositAck ? "✓ Confirmed by Client" : "Pending Confirmation"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 7: Legal Agreements & Consents */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] space-y-3 text-xs print-section-card print:bg-white print:border-gray-300">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#eceae3]">
                      <ShieldCheck className="w-4 h-4 text-[#e8491c]" />
                      <h4 className="font-bold text-[#1c1b1a] text-sm">7. Consents &amp; Verification</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${legalTermsAgreed ? "text-emerald-600" : "text-gray-300"}`} />
                        <div>
                          <p className="font-bold text-[#1c1b1a]">Terms &amp; Conditions</p>
                          <p className="text-[10px] text-gray-500">{legalTermsAgreed ? "Agreed upon submit" : "Pending"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${legalPrivacyAgreed ? "text-emerald-600" : "text-gray-300"}`} />
                        <div>
                          <p className="font-bold text-[#1c1b1a]">Privacy Policy</p>
                          <p className="text-[10px] text-gray-500">{legalPrivacyAgreed ? "Agreed upon submit" : "Pending"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${legalContactConsent ? "text-emerald-600" : "text-gray-300"}`} />
                        <div>
                          <p className="font-bold text-[#1c1b1a]">Contact Consent</p>
                          <p className="text-[10px] text-gray-500">{legalContactConsent ? "Consent granted" : "Pending"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 8: Catch-All for Any Custom Dynamic Fields */}
                  {customEntries.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3 text-xs print-section-card print:bg-white print:border-gray-300">
                      <div className="flex items-center gap-2 pb-2 border-b border-amber-200 text-amber-900">
                        <FileText className="w-4 h-4 text-amber-700" />
                        <h4 className="font-bold text-sm">8. Additional Questionnaire Responses</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {customEntries.map(([k, v]) => (
                          <div key={k} className="p-2.5 bg-white rounded-xl border border-amber-100">
                            <p className="text-[10px] uppercase font-bold text-amber-800">{k.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="font-semibold text-gray-900 mt-0.5 break-words">
                              {typeof v === "object" ? JSON.stringify(v) : String(v)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

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

            <div className="pt-4 border-t border-[#f0eee8] flex flex-wrap items-center justify-between gap-2 print-hide">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={getClientWhatsappUrl(selectedBooking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-xs font-bold text-[#1c1b1a] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenReschedule(selectedBooking)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#fff2ed] hover:bg-[#ffe6dc] text-xs font-bold text-[#e8491c] border border-[#fbdcd0] transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Reschedule Shoot</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrintBooking(selectedBooking)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#faf9f6] text-xs font-bold text-[#1c1b1a] border border-[#d6d4cb] transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-[#1c1b1a]" />
                  <span>Print Summary</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete</span>
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

      {/* Interactive Admin Direct Reschedule Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-[#e6e4dc] animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0eee8]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e8491c]">
                  Reschedule Shoot · {editingBooking.id}
                </span>
                <h3 className="text-lg font-bold text-[#1c1b1a]">Update Shoot Date &amp; Details</h3>
                <p className="text-xs text-[#7a766f]">{editingBooking.sessionSnapshot?.name}</p>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="p-1.5 rounded-xl text-[#8a867f] hover:bg-[#f5f4ef]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-bold text-[#1c1b1a] mb-1">Shoot Date *</label>
                  <input
                    type="date"
                    value={rescheduleForm.date}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1c1b1a] mb-1">Start Time</label>
                  <input
                    type="time"
                    value={rescheduleForm.start}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, start: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1c1b1a] mb-1">End Time</label>
                  <input
                    type="time"
                    value={rescheduleForm.end}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, end: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1c1b1a] mb-1">Secondary / Additional Date (Optional)</label>
                <input
                  type="date"
                  value={rescheduleForm.secondaryDate}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, secondaryDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1c1b1a] mb-1">Client Name</label>
                  <input
                    type="text"
                    value={rescheduleForm.customerName}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1c1b1a] mb-1">Client Phone</label>
                  <input
                    type="text"
                    value={rescheduleForm.customerPhone}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1c1b1a] mb-1">Client Email</label>
                <input
                  type="email"
                  value={rescheduleForm.customerEmail}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1c1b1a] mb-1">Location or Venue</label>
                <input
                  type="text"
                  value={rescheduleForm.location}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, location: e.target.value })}
                  placeholder="e.g. Victoria Baths, Manchester"
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1c1b1a] mb-1">Creative Notes &amp; Instructions</label>
                <textarea
                  rows={2}
                  value={rescheduleForm.notes}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, notes: e.target.value })}
                  placeholder="Special shot list or notes..."
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rescheduleForm.notifyClient}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, notifyClient: e.target.checked })}
                  className="w-4 h-4 rounded text-[#e8491c] focus:ring-[#e8491c]"
                />
                <span className="font-semibold text-[#48453f]">
                  Email updated confirmation to client
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-[#f0eee8] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="px-4 py-2 rounded-xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-xs font-bold text-[#1c1b1a]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSaveReschedule}
                className="px-5 py-2 rounded-xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-bold transition-all shadow-md shadow-[#e8491c]/25 disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Save & Reschedule Shoot"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
