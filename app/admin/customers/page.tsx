"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ChevronLeft, Calendar, Mail, RefreshCw, UserCheck, Inbox } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";

interface CustomerDisplayItem {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  shootsCount: number;
  lastShootDate?: string;
  isRegisteredUser: boolean;
  joinedAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const customerMap = new Map<string, CustomerDisplayItem>();

      // 1. Fetch from customers collection (registered accounts)
      const custSnap = await getDocs(collection(db, "customers"));
      custSnap.forEach((d) => {
        const data = d.data();
        const email = (data.email || "").toLowerCase().trim();
        const key = email || d.id;
        const joinedDate = data.createdAt
          ? new Date(data.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Recently";

        customerMap.set(key, {
          id: d.id,
          displayName: data.displayName || data.name || email.split("@")[0] || "Registered Client",
          email: data.email || "",
          phone: data.phone || data.phoneNumber || "",
          shootsCount: 0,
          isRegisteredUser: true,
          joinedAt: joinedDate,
        });
      });

      // 2. Fetch from bookings collection to count bookings and find guest clients
      const bookSnap = await getDocs(collection(db, "bookings"));
      bookSnap.forEach((d) => {
        const data = d.data();
        const email = (data.customer?.email || "").toLowerCase().trim();
        const key = email || data.customerUid || d.id;

        const dateStr = data.slot?.date || "";
        const createdAtVal = data.createdAt
          ? new Date(data.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Recently";

        if (customerMap.has(key)) {
          const existing = customerMap.get(key)!;
          existing.shootsCount += 1;
          if (dateStr && (!existing.lastShootDate || dateStr > existing.lastShootDate)) {
            existing.lastShootDate = dateStr;
          }
          if (!existing.phone && data.customer?.phone) {
            existing.phone = data.customer.phone;
          }
        } else if (email) {
          customerMap.set(key, {
            id: key,
            displayName: data.customer?.name || email.split("@")[0] || "Client",
            email,
            phone: data.customer?.phone || "",
            shootsCount: 1,
            lastShootDate: dateStr,
            isRegisteredUser: Boolean(data.customerUid),
            joinedAt: createdAtVal,
          });
        }
      });

      const list = Array.from(customerMap.values());
      // Sort by shoot count desc, then name
      list.sort((a, b) => b.shootsCount - a.shootsCount);

      setCustomers(list);
    } catch (err) {
      console.error("Failed to load customers from Firestore:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

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
            Customer Accounts &amp; Clients
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Live directory of registered studio portal accounts and clients who have booked sessions with SH Photography.
          </p>
        </div>

        <button
          onClick={loadCustomers}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-[#2c2b29] text-xs font-semibold transition-colors border border-[#e6e4dc]"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#7a766f]" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#e8e6df] shadow-sm">
          <div className="w-8 h-8 border-2 border-[#e8491c]/20 border-t-[#e8491c] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#7a766f]">Loading live customer directory from Firestore...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#e8e6df] shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#faf9f6] text-[#8a867f] flex items-center justify-center mx-auto border border-[#f0eee8]">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1c1b1a]">No Customer Accounts Found</h3>
          <p className="text-xs text-[#7a766f] max-w-sm mx-auto">
            When clients book shoots or sign up on the website, their accounts will automatically sync and populate here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#e8e6df] shadow-sm divide-y divide-[#f0eee8] overflow-hidden">
          {customers.map((c) => (
            <div key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#faf9f6] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1c1b1a] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {c.displayName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1c1b1a]">{c.displayName}</p>
                    {c.isRegisteredUser ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                        Portal Account
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.2 rounded-full">
                        Guest Booking
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7a766f]">
                    {c.email} {c.phone ? `· ${c.phone}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 text-right">
                <div>
                  <p className="text-xs font-bold text-[#e8491c]">
                    {c.shootsCount} {c.shootsCount === 1 ? "Shoot" : "Shoots"}
                  </p>
                  <p className="text-[11px] text-[#8a867f]">
                    {c.lastShootDate ? `Last: ${c.lastShootDate}` : `First Contact: ${c.joinedAt}`}
                  </p>
                </div>

                <a
                  href={`mailto:${c.email}?subject=Message from SH Photography`}
                  className="p-2 text-stone-400 hover:text-[#e8491c] rounded-xl hover:bg-orange-50 border border-stone-200 transition-colors"
                  title="Send Email to Customer"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
