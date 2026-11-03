"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  ChevronLeft,
  Clock,
  User,
  Phone,
  CheckCircle,
  RefreshCw,
  Inbox,
  Check,
  Send,
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  session?: string;
  message: string;
  createdAt?: number | string;
  status?: "new" | "read" | "replied";
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "enquiries"));
      const loaded: InquiryItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        loaded.push({
          id: d.id,
          name: data.name || data.fullName || "Prospective Client",
          email: data.email || "",
          phone: data.phone || data.phoneNumber || "",
          service: data.service || data.session || data.sessionCategory || "General Inquiry",
          message: data.message || data.notes || "",
          createdAt: data.createdAt || Date.now(),
          status: data.status || "new",
        });
      });

      // Sort newest first
      loaded.sort((a, b) => {
        const timeA = typeof a.createdAt === "number" ? a.createdAt : new Date(a.createdAt || 0).getTime();
        const timeB = typeof b.createdAt === "number" ? b.createdAt : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setInquiries(loaded);
    } catch (err) {
      console.error("Failed to load inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleMarkStatus = async (id: string, newStatus: "read" | "replied") => {
    try {
      await updateDoc(doc(db, "enquiries", id), {
        status: newStatus,
        updatedAt: Date.now(),
      });
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const formatDate = (val?: number | string) => {
    if (!val) return "Recently";
    try {
      const d = typeof val === "number" ? new Date(val) : new Date(val);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
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
            Inquiries &amp; Messages
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Live inquiries submitted by clients through the public Contact page.
          </p>
        </div>

        <button
          onClick={loadInquiries}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-[#2c2b29] text-xs font-semibold transition-colors border border-[#e6e4dc]"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#7a766f]" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#e8e6df] shadow-sm">
          <div className="w-8 h-8 border-2 border-[#e8491c]/20 border-t-[#e8491c] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#7a766f]">Loading live inquiries from Firestore...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#e8e6df] shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#faf9f6] text-[#8a867f] flex items-center justify-center mx-auto border border-[#f0eee8]">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1c1b1a]">No Inquiries Yet</h3>
          <p className="text-xs text-[#7a766f] max-w-sm mx-auto">
            When visitors reach out using the contact form on your website, their messages will immediately appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className={`bg-white rounded-3xl p-6 border shadow-sm space-y-3.5 transition-all ${
                inq.status === "new" ? "border-orange-200 ring-1 ring-orange-100" : "border-[#e8e6df]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs border ${
                      inq.status === "new"
                        ? "bg-orange-50 text-[#e8491c] border-orange-200"
                        : "bg-stone-50 text-stone-600 border-stone-200"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1c1b1a] flex items-center gap-2">
                      <span>{inq.name}</span>
                      {inq.status === "new" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fff2ed] text-[#e8491c] border border-[#fbdcd0]">
                          New
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-[#7a766f]">
                      {inq.email} {inq.phone ? `· ${inq.phone}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-sand/60 text-ink/80 border border-line">
                    {inq.service}
                  </span>
                  {inq.status === "new" && (
                    <button
                      onClick={() => handleMarkStatus(inq.id, "read")}
                      className="text-xs text-stone-500 hover:text-stone-900 border border-stone-200 px-2.5 py-1 rounded-full bg-white transition-colors"
                      title="Mark as Read"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#383632] leading-relaxed bg-[#faf9f6] p-4 rounded-2xl border border-[#f0eee8]">
                &ldquo;{inq.message}&rdquo;
              </p>

              <div className="flex items-center justify-between text-[11px] text-[#8a867f] pt-1">
                <span>Received: {formatDate(inq.createdAt)}</span>
                <a
                  href={`mailto:${inq.email}?subject=RE: Photography Inquiry - SH Photography`}
                  onClick={() => handleMarkStatus(inq.id, "replied")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e8491c] hover:underline"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply via Email →</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
