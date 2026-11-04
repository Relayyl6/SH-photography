"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  ChevronLeft,
  Calendar,
  Mail,
  RefreshCw,
  UserCheck,
  Inbox,
  Plus,
  Trash2,
  Edit2,
  Search,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Tag,
  Shield,
  Eye,
  Camera,
  ExternalLink,
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

export interface CustomerBookingSummary {
  id: string;
  sessionId: string;
  sessionName: string;
  date: string;
  timeSlot?: { start: string; end: string };
  status: string;
}

export interface CustomerItem {
  id: string;
  displayName: string;
  name: string;
  email: string;
  phone: string;
  shootsCount: number;
  lastShootDate?: string;
  isRegisteredUser: boolean;
  source: string;
  notes?: string;
  joinedAt: string;
  createdAtMs: number;
  deleted?: boolean;
  bookings?: CustomerBookingSummary[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "portal" | "shoots" | "guest">("all");
  const [sortBy, setSortBy] = useState<"shoots" | "recent" | "name">("shoots");

  // Modals & Drawers state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerItem | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<CustomerItem | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "Direct Booking",
    notes: "",
    initialShoots: 0,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    notes: "",
  });

  const [alsoDeleteBookings, setAlsoDeleteBookings] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 1. Fetch Customers & Bookings from Firestore
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const customerMap = new Map<string, CustomerItem>();
      const bookingsByEmail = new Map<string, CustomerBookingSummary[]>();

      // A. Load bookings collection
      try {
        const bookSnap = await getDocs(collection(db, "bookings"));
        bookSnap.forEach((d) => {
          const data = d.data();
          const email = (data.customer?.email || "").toLowerCase().trim();
          if (!email) return;

          const summary: CustomerBookingSummary = {
            id: d.id,
            sessionId: data.sessionId || "session",
            sessionName: data.sessionSnapshot?.name || data.sessionId || "Shoot",
            date: data.slot?.date || "",
            timeSlot: data.slot ? { start: data.slot.start, end: data.slot.end } : undefined,
            status: data.status || "pending",
          };

          const list = bookingsByEmail.get(email) || [];
          list.push(summary);
          bookingsByEmail.set(email, list);
        });
      } catch (bookErr) {
        console.warn("Could not load bookings for customers:", bookErr);
      }

      // B. Load customers collection
      const custSnap = await getDocs(collection(db, "customers"));
      custSnap.forEach((d) => {
        const data = d.data();
        if (data.deleted === true) return; // Skip soft-deleted accounts

        const email = (data.email || "").toLowerCase().trim();
        const key = email || d.id;
        const joinedDate = data.createdAt
          ? new Date(data.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Recently";

        const associatedBookings = bookingsByEmail.get(email) || [];
        const rawShootsCount = data.shootsCount !== undefined ? Number(data.shootsCount) : associatedBookings.length;
        const finalShootsCount = Math.max(rawShootsCount, associatedBookings.length);

        // Find latest shoot date
        let latestDate = data.lastShootDate || "";
        for (const b of associatedBookings) {
          if (b.date && (!latestDate || b.date > latestDate)) {
            latestDate = b.date;
          }
        }

        customerMap.set(key, {
          id: d.id,
          name: data.name || data.displayName || email.split("@")[0] || "Client",
          displayName: data.displayName || data.name || email.split("@")[0] || "Client",
          email: data.email || "",
          phone: data.phone || data.phoneNumber || "",
          shootsCount: finalShootsCount,
          lastShootDate: latestDate,
          isRegisteredUser: Boolean(data.isRegisteredUser),
          source: data.source || (data.isRegisteredUser ? "Portal Account" : "Guest Booking"),
          notes: data.notes || "",
          joinedAt: joinedDate,
          createdAtMs: Number(data.createdAt) || Date.now(),
          bookings: associatedBookings,
        });
      });

      // C. Also detect guest clients from bookings who don't have a doc in customers yet
      bookingsByEmail.forEach((bList, email) => {
        if (!customerMap.has(email)) {
          let latestDate = "";
          for (const b of bList) {
            if (b.date && (!latestDate || b.date > latestDate)) {
              latestDate = b.date;
            }
          }

          customerMap.set(email, {
            id: `cust_${email.replace(/[^a-z0-9]/gi, "_")}`,
            name: email.split("@")[0] || "Client",
            displayName: email.split("@")[0] || "Client",
            email,
            phone: "",
            shootsCount: bList.length,
            lastShootDate: latestDate,
            isRegisteredUser: false,
            source: "Guest Booking",
            notes: `Auto-detected from ${bList.length} booking(s)`,
            joinedAt: "Via Booking",
            createdAtMs: Date.now(),
            bookings: bList,
          });
        }
      });

      const list = Array.from(customerMap.values());
      setCustomers(list);
    } catch (err) {
      console.error("Failed to load customers from Firestore:", err);
      showToast("Failed to load customers. Check network connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter & Search Logic
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        // Search term
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = c.name?.toLowerCase().includes(q) || c.displayName?.toLowerCase().includes(q);
          const matchEmail = c.email?.toLowerCase().includes(q);
          const matchPhone = c.phone?.toLowerCase().includes(q);
          const matchNotes = c.notes?.toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchPhone && !matchNotes) return false;
        }

        // Filter tab
        if (filterTab === "portal") return c.isRegisteredUser || c.source?.toLowerCase().includes("portal");
        if (filterTab === "shoots") return c.shootsCount > 0;
        if (filterTab === "guest") return !c.isRegisteredUser && !c.source?.toLowerCase().includes("portal");

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "shoots") return b.shootsCount - a.shootsCount;
        if (sortBy === "recent") return b.createdAtMs - a.createdAtMs;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [customers, searchQuery, filterTab, sortBy]);

  // Handler: Add New Customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim()) {
      showToast("Name and Email are required.", "error");
      return;
    }

    setActionLoading(true);
    try {
      const normEmail = addForm.email.toLowerCase().trim();
      const custId = `cust_${normEmail.replace(/[^a-z0-9]/gi, "_")}`;

      const newCustomerDoc = {
        id: custId,
        name: addForm.name.trim(),
        displayName: addForm.name.trim(),
        email: normEmail,
        phone: addForm.phone.trim(),
        shootsCount: Number(addForm.initialShoots) || 0,
        source: addForm.source || "Manual Entry",
        isRegisteredUser: false,
        notes: addForm.notes.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deleted: false,
      };

      await setDoc(doc(db, "customers", custId), newCustomerDoc, { merge: true });

      showToast(`Customer account for ${addForm.name} created!`);
      setIsAddModalOpen(false);
      setAddForm({
        name: "",
        email: "",
        phone: "",
        source: "Direct Booking",
        notes: "",
        initialShoots: 0,
      });
      await loadCustomers();
    } catch (err: any) {
      console.error("Error creating customer:", err);
      showToast(err.message || "Failed to create customer.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Update Existing Customer
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      showToast("Name and Email cannot be empty.", "error");
      return;
    }

    setActionLoading(true);
    try {
      const normEmail = editForm.email.toLowerCase().trim();
      const payload = {
        name: editForm.name.trim(),
        displayName: editForm.name.trim(),
        email: normEmail,
        phone: editForm.phone.trim(),
        source: editForm.source || editingCustomer.source,
        notes: editForm.notes.trim(),
        updatedAt: Date.now(),
      };

      await setDoc(doc(db, "customers", editingCustomer.id), payload, { merge: true });

      showToast("Customer details updated successfully!");
      setEditingCustomer(null);
      await loadCustomers();
    } catch (err: any) {
      console.error("Error updating customer:", err);
      showToast(err.message || "Failed to update customer.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Delete Customer
  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;

    setActionLoading(true);
    try {
      const email = deletingCustomer.email.toLowerCase().trim();

      // 1. Permanently delete or mark deleted in customers collection
      try {
        await deleteDoc(doc(db, "customers", deletingCustomer.id));
      } catch {
        // Fallback: soft-delete
        await setDoc(doc(db, "customers", deletingCustomer.id), { deleted: true, updatedAt: Date.now() }, { merge: true });
      }

      // Also mark soft delete flag in case doc is re-queried
      await setDoc(
        doc(db, "customers", deletingCustomer.id),
        { deleted: true, deletedAt: Date.now() },
        { merge: true }
      ).catch(() => {});

      // 2. If admin opted to also purge associated bookings
      if (alsoDeleteBookings && email) {
        try {
          const bSnap = await getDocs(collection(db, "bookings"));
          const batch = writeBatch(db);
          let deleteCount = 0;
          bSnap.forEach((bDoc) => {
            const bEmail = (bDoc.data().customer?.email || "").toLowerCase().trim();
            if (bEmail === email) {
              batch.delete(bDoc.ref);
              deleteCount++;
            }
          });
          if (deleteCount > 0) {
            await batch.commit();
          }
        } catch (bErr) {
          console.warn("Could not batch delete bookings:", bErr);
        }
      }

      // 3. Immediately remove from local state
      setCustomers((prev) => prev.filter((c) => c.id !== deletingCustomer.id && c.email.toLowerCase() !== email));

      showToast(`Customer ${deletingCustomer.displayName} was deleted.`);
      setDeletingCustomer(null);
      setAlsoDeleteBookings(false);
    } catch (err: any) {
      console.error("Error deleting customer:", err);
      showToast(err.message || "Failed to delete customer.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (c: CustomerItem) => {
    setEditingCustomer(c);
    setEditForm({
      name: c.name || c.displayName,
      email: c.email,
      phone: c.phone || "",
      source: c.source || "",
      notes: c.notes || "",
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom-3 duration-300 ${
            toast.type === "success"
              ? "bg-[#1c1b1a] text-white border border-[#383735]"
              : "bg-red-600 text-white border border-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e6df] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin"
              className="text-xs font-semibold text-[#8a867f] hover:text-[#1c1b1a] inline-flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c1b1a]">
            Customer Accounts &amp; Clients
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Live directory of registered studio portal accounts, booking clients, and inquiries. Auto-synced from live bookings with full CRUD management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>

          <button
            onClick={loadCustomers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-[#2c2b29] text-xs font-semibold transition-colors border border-[#e6e4dc] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#7a766f] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search, Filter Tabs & Sort Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e8e6df] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a867f]" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#faf9f5] border border-[#e8e6df] text-xs text-[#1c1b1a] placeholder-[#9d9990] focus:outline-none focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9d9990] hover:text-[#1c1b1a]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 text-xs text-[#7a766f] self-end md:self-auto">
            <span className="font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#faf9f5] border border-[#e8e6df] text-xs font-semibold text-[#1c1b1a] px-3 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#e8491c]"
            >
              <option value="shoots">Most Shoots</option>
              <option value="recent">Recently Added</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f0eee8]">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterTab === "all"
                ? "bg-[#1c1b1a] text-white"
                : "bg-[#f5f4ef] text-[#7a766f] hover:bg-[#eae8df] hover:text-[#1c1b1a]"
            }`}
          >
            All Clients ({customers.length})
          </button>
          <button
            onClick={() => setFilterTab("portal")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterTab === "portal"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            Portal Accounts ({customers.filter((c) => c.isRegisteredUser || c.source?.includes("Portal")).length})
          </button>
          <button
            onClick={() => setFilterTab("shoots")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterTab === "shoots"
                ? "bg-[#e8491c] text-white"
                : "bg-orange-50 text-[#e8491c] hover:bg-orange-100 border border-orange-200"
            }`}
          >
            Active Shoots ({customers.filter((c) => c.shootsCount > 0).length})
          </button>
          <button
            onClick={() => setFilterTab("guest")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterTab === "guest"
                ? "bg-stone-700 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200"
            }`}
          >
            Guest Bookings ({customers.filter((c) => !c.isRegisteredUser && !c.source?.includes("Portal")).length})
          </button>
        </div>
      </div>

      {/* Customer List Table */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#e8e6df] shadow-sm">
          <div className="w-8 h-8 border-2 border-[#e8491c]/20 border-t-[#e8491c] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#7a766f]">Loading live customer directory from Firestore...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#e8e6df] shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#faf9f6] text-[#8a867f] flex items-center justify-center mx-auto border border-[#f0eee8]">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1c1b1a]">No matching customer accounts</h3>
          <p className="text-xs text-[#7a766f] max-w-sm mx-auto">
            {searchQuery
              ? `No clients found matching "${searchQuery}". Clear your search query or add a new customer.`
              : "When clients book shoots on the website or register, their accounts will automatically sync here."}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e8491c] text-white text-xs font-semibold hover:bg-[#d03d12] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Customer</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#e8e6df] shadow-sm divide-y divide-[#f0eee8] overflow-hidden">
          {filteredCustomers.map((c) => {
            const initials = (c.displayName || c.name || "Client")
              .split(" ")
              .map((w) => w.charAt(0))
              .slice(0, 2)
              .join("")
              .toUpperCase();

            const isPortal = c.isRegisteredUser || c.source?.toLowerCase().includes("portal");

            return (
              <div
                key={c.id}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#faf9f6] transition-colors group"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    onClick={() => setViewingCustomer(c)}
                    className="w-11 h-11 rounded-2xl bg-[#1c1b1a] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm cursor-pointer hover:bg-[#e8491c] transition-colors"
                    title="Click to view full client profile"
                  >
                    {initials || "CL"}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setViewingCustomer(c)}
                        className="text-sm font-bold text-[#1c1b1a] hover:text-[#e8491c] transition-colors text-left"
                      >
                        {c.displayName || c.name}
                      </button>

                      {isPortal ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Portal Account
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                          {c.source || "Guest Booking"}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7a766f]">
                      <span className="font-mono text-[11px] text-[#55524c]">{c.email}</span>
                      {c.phone && (
                        <>
                          <span className="text-[#d8d5cd]">&bull;</span>
                          <span className="flex items-center gap-1 text-[#615e57]">
                            <Phone className="w-3 h-3 text-[#9d9990]" />
                            {c.phone}
                          </span>
                        </>
                      )}
                      {c.notes && (
                        <>
                          <span className="text-[#d8d5cd]">&bull;</span>
                          <span className="truncate max-w-xs text-[#8a867f] italic">&ldquo;{c.notes}&rdquo;</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Shoot Stats & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#f5f4ef]">
                  <div className="text-left lg:text-right">
                    <p className="text-xs font-bold text-[#e8491c] flex items-center lg:justify-end gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      <span>
                        {c.shootsCount} {c.shootsCount === 1 ? "Shoot" : "Shoots"}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#8a867f]">
                      {c.lastShootDate ? `Last: ${c.lastShootDate}` : `Added: ${c.joinedAt}`}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* View details */}
                    <button
                      onClick={() => setViewingCustomer(c)}
                      className="p-2 text-[#7a766f] hover:text-[#1c1b1a] rounded-xl hover:bg-[#f0eee8] transition-colors border border-transparent hover:border-[#e6e4dc]"
                      title="View Client Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Email */}
                    <a
                      href={`mailto:${c.email}?subject=Message from SH Photography`}
                      className="p-2 text-[#7a766f] hover:text-[#e8491c] rounded-xl hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200"
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>

                    {/* WhatsApp if phone available */}
                    {c.phone && (
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-[#7a766f] hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-2 text-[#7a766f] hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                      title="Edit Customer Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeletingCustomer(c)}
                      className="p-2 text-[#7a766f] hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                      title="Delete Customer Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD NEW CUSTOMER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e8e6df] space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0eee8]">
              <div>
                <h3 className="text-lg font-bold text-[#1c1b1a]">Add New Customer</h3>
                <p className="text-xs text-[#7a766f]">Create a new client profile in your studio directory.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-[#8a867f] hover:bg-[#f5f4ef]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1c1b1a] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Benedict Henry"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#e8e6df] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1c1b1a] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="client@example.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#e8e6df] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1c1b1a] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#e8e6df] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1c1b1a] mb-1">Acquisition Source</label>
                  <select
                    value={addForm.source}
                    onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#e8e6df] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c] focus:outline-none"
                  >
                    <option value="Direct Booking">Direct Booking</option>
                    <option value="Manual Entry">Manual Admin Entry</option>
                    <option value="Phone Call Inquiry">Phone Call Inquiry</option>
                    <option value="Website Inquiry">Website Inquiry</option>
                    <option value="Referral / Word of Mouth">Referral / Word of Mouth</option>
                    <option value="VIP Client">VIP Client</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1c1b1a] mb-1">Private Studio Notes</label>
                <textarea
                  rows={3}
                  placeholder="Preferences, shoot style, venue details, or package history..."
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#e8e6df] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0eee8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7a766f] hover:bg-[#f5f4ef]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#e8491c] text-white text-xs font-semibold hover:bg-[#d03d12] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {actionLoading ? "Saving..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CUSTOMER */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e8e6df] space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0eee8]">
              <div>
                <h3 className="text-lg font-bold text-[#1c1b1a]">Edit Customer Profile</h3>
                <p className="text-xs text-[#7a766f]">Update client details, contact information, and studio notes.</p>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                className="p-2 rounded-xl text-[#8a867f] hover:bg-[#f5f4ef]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1c1b1a] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#e8e6df] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1c1b1a] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#e8e6df] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1c1b1a] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#e8e6df] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1c1b1a] mb-1">Source / Channel</label>
                  <input
                    type="text"
                    value={editForm.source}
                    onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    placeholder="e.g. VIP, Direct, Wedding Expo"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#e8e6df] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1c1b1a] mb-1">Private Notes</label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Private client notes..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#faf9f5] border border-[#e8e6df] text-xs text-[#1c1b1a] focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0eee8]">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7a766f] hover:bg-[#f5f4ef]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#e8491c] text-white text-xs font-semibold hover:bg-[#d03d12] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-[#1c1b1a]">Delete Customer Account?</h3>
              <p className="text-xs text-[#7a766f] leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#1c1b1a]">{deletingCustomer.displayName}</span> (
                <span className="font-mono text-[11px]">{deletingCustomer.email}</span>)?
              </p>
              <p className="text-[11px] text-red-600 font-medium">
                This will remove the client from your active customer directory.
              </p>
            </div>

            {deletingCustomer.shootsCount > 0 && (
              <div className="bg-[#faf9f5] p-3.5 rounded-2xl border border-[#e8e6df]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alsoDeleteBookings}
                    onChange={(e) => setAlsoDeleteBookings(e.target.checked)}
                    className="mt-0.5 rounded text-[#e8491c] focus:ring-[#e8491c]"
                  />
                  <span className="text-xs text-[#55524c]">
                    Also delete associated booking records ({deletingCustomer.shootsCount}) from Firestore
                  </span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                disabled={actionLoading}
                className="w-1/2 py-2.5 rounded-2xl border border-[#e6e4dc] text-xs font-semibold text-[#7a766f] hover:bg-[#f5f4ef] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={actionLoading}
                className="w-1/2 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
              >
                {actionLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW CUSTOMER PROFILE & SHOOT HISTORY */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#e8e6df] space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0eee8]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1c1b1a] text-white flex items-center justify-center font-bold text-sm uppercase">
                  {(viewingCustomer.displayName || "CL").substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1c1b1a]">{viewingCustomer.displayName}</h3>
                  <p className="text-xs text-[#7a766f]">{viewingCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingCustomer(null)}
                className="p-2 rounded-xl text-[#8a867f] hover:bg-[#f5f4ef]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#faf9f5] p-3 rounded-2xl border border-[#e8e6df]">
                <p className="text-[#8a867f] text-[10px] font-bold uppercase tracking-wider">Phone</p>
                <p className="font-semibold text-[#1c1b1a] mt-0.5">{viewingCustomer.phone || "Not provided"}</p>
              </div>

              <div className="bg-[#faf9f5] p-3 rounded-2xl border border-[#e8e6df]">
                <p className="text-[#8a867f] text-[10px] font-bold uppercase tracking-wider">Account Type</p>
                <p className="font-semibold text-[#1c1b1a] mt-0.5">
                  {viewingCustomer.isRegisteredUser ? "Registered Portal User" : viewingCustomer.source || "Guest"}
                </p>
              </div>

              <div className="bg-[#faf9f5] p-3 rounded-2xl border border-[#e8e6df]">
                <p className="text-[#8a867f] text-[10px] font-bold uppercase tracking-wider">Total Bookings</p>
                <p className="font-semibold text-[#e8491c] mt-0.5">{viewingCustomer.shootsCount} Shoots</p>
              </div>

              <div className="bg-[#faf9f5] p-3 rounded-2xl border border-[#e8e6df]">
                <p className="text-[#8a867f] text-[10px] font-bold uppercase tracking-wider">Last Activity</p>
                <p className="font-semibold text-[#1c1b1a] mt-0.5">
                  {viewingCustomer.lastShootDate || viewingCustomer.joinedAt}
                </p>
              </div>
            </div>

            {/* Studio Notes */}
            {viewingCustomer.notes && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-[#1c1b1a]">Studio Notes</p>
                <p className="text-xs text-[#55524c] bg-[#faf9f5] p-3.5 rounded-2xl border border-[#e8e6df] whitespace-pre-wrap">
                  {viewingCustomer.notes}
                </p>
              </div>
            )}

            {/* Associated Bookings History */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#1c1b1a]">Booking Sessions History</p>
                <span className="text-[11px] text-[#8a867f] font-semibold">
                  {viewingCustomer.bookings?.length || 0} Records
                </span>
              </div>

              {viewingCustomer.bookings && viewingCustomer.bookings.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {viewingCustomer.bookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#faf9f5] border border-[#e8e6df] text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-[#1c1b1a]">{b.sessionName}</p>
                        <p className="text-[11px] text-[#7a766f]">
                          {b.date} {b.timeSlot ? `· ${b.timeSlot.start}–${b.timeSlot.end}` : ""}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          b.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : b.status === "completed"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8a867f] italic bg-[#faf9f5] p-3 rounded-2xl border border-[#e8e6df]">
                  No direct bookings linked to this email yet.
                </p>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#f0eee8]">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${viewingCustomer.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf9f5] text-[#1c1b1a] text-xs font-semibold hover:bg-[#f0eee8] border border-[#e6e4dc]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
                {viewingCustomer.phone && (
                  <a
                    href={`https://wa.me/${viewingCustomer.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 border border-emerald-200"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setViewingCustomer(null);
                    openEditModal(viewingCustomer);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#faf9f5] hover:bg-[#f0eee8] text-xs font-semibold text-[#1c1b1a] border border-[#e6e4dc]"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setViewingCustomer(null);
                    setDeletingCustomer(viewingCustomer);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600 border border-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
