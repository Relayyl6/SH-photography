"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck2,
  Grid2X2,
  Image as ImageIcon,
  Layers,
  UserCheck,
  FileText,
  Sliders,
  Users,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Mail,
  History,
  Lock,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    group: "General",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck2, badge: "New" },
      { href: "/admin/availability", label: "Availability", icon: CalendarDays },
    ],
  },
  {
    group: "Site",
    items: [
      { href: "/admin/bento", label: "Bento & Home", icon: Grid2X2 },
      { href: "/admin/portfolio", label: "Portfolio", icon: ImageIcon },
      { href: "/admin/sessions", label: "Sessions & Packages", icon: Layers },
      { href: "/admin/about", label: "About & Story", icon: UserCheck },
    ],
  },
  {
    group: "Other",
    items: [
      { href: "/admin/form-builder", label: "Form Builder", icon: Sliders },
      { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
      { href: "/admin/customers", label: "Customer Accounts", icon: Users },
    ],
  },
  {
    group: "Information",
    items: [
      { href: "/admin/settings", label: "Settings & SEO", icon: ShieldCheck },
      { href: "/admin/audit", label: "Audit Log", icon: History },
      { href: "/admin/docs", label: "Documentation", icon: HelpCircle },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isOwner, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  // Auto redirect to login if unauthenticated
  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [user, loading, isLoginPage, router]);

  // If on login page, render children directly without admin shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f4ef] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#e8491c]/20 border-t-[#e8491c] rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#7a766f]">Verifying owner access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Authenticated but NOT owner: Access Denied
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#f5f4ef] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-[#e6e4dc] text-center">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#1f1e1d]">Access Denied</h2>
          <p className="text-sm text-[#7a766f] mt-2 mb-6 leading-relaxed">
            Your account (<span className="font-semibold text-[#1f1e1d]">{user.email}</span>) does not have owner privileges. Only verified administrators can access the studio dashboard.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => signOut()}
              className="w-full py-2.5 rounded-xl bg-[#e8491c] text-white font-medium text-sm hover:bg-[#d03d12] transition-colors shadow-sm"
            >
              Sign Out &amp; Switch Account
            </button>
            <Link
              href="/"
              className="w-full py-2.5 rounded-xl border border-[#e6e4dc] text-[#55524c] font-medium text-sm hover:bg-[#f5f4ef] transition-colors"
            >
              Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#1c1b1a] flex font-sans antialiased overflow-x-hidden">
      {/* 1. Desktop & Tablet Sidebar (Swiftpay inspired) */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-[#e8e6df] transition-all duration-300 z-40 fixed inset-y-0 left-0 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#f0eee8] flex items-center justify-between h-20">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? "justify-center w-full" : ""}`}>
            <div className="w-10 h-10 rounded-2xl bg-[#1c1b1a] text-white flex items-center justify-center font-bold tracking-tight shrink-0 shadow-sm">
              SH
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-[#1c1b1a] truncate">SH Photography</span>
                <span className="text-[11px] text-[#8a867f] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Owner Studio
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-xl text-[#8a867f] hover:text-[#1c1b1a] hover:bg-[#f5f4ef] transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="p-2 flex justify-center border-b border-[#f0eee8]">
            <button
              onClick={() => setCollapsed(false)}
              className="p-2 rounded-xl text-[#8a867f] hover:text-[#1c1b1a] hover:bg-[#f5f4ef] transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9d9990] mb-2">
                  {group.group}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                      isActive
                        ? "bg-[#e8491c] text-white shadow-sm shadow-[#e8491c]/25"
                        : "text-[#615e57] hover:bg-[#f5f4ef] hover:text-[#1c1b1a]"
                    } ${collapsed ? "justify-center px-0 py-3" : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-white" : "text-[#7a766f] group-hover:scale-105"}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              isActive ? "bg-white/25 text-white" : "bg-[#f0eee8] text-[#e8491c]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Pinned Bottom: View Site & Logout */}
        <div className="p-3 border-t border-[#f0eee8] space-y-1.5 bg-white">
          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#7a766f] hover:text-[#1c1b1a] hover:bg-[#f5f4ef] transition-colors ${
              collapsed ? "justify-center px-0" : ""
            }`}
            title="Preview Live Site"
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-[#9d9990]" />
            {!collapsed && <span className="truncate">View Public Site</span>}
          </Link>

          <button
            onClick={() => signOut()}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#d9481a] hover:bg-[#fff2ed] transition-colors ${
              collapsed ? "justify-center px-0" : ""
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 pb-20 md:pb-6 overflow-x-hidden w-full max-w-full ${collapsed ? "md:ml-20" : "md:ml-72"}`}>
        {/* Top Header Bar for Desktop & Mobile */}
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-[#e8e6df] sticky top-0 z-30 px-4 sm:px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#7a766f] hover:bg-[#f5f4ef]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#e8491c] bg-[#fff2ed] px-2.5 py-1 rounded-full border border-[#fbdcd0]">
                Admin Panel
              </span>
              <span className="hidden sm:inline-block text-xs text-[#8a867f]">/</span>
              <span className="hidden sm:inline-block text-xs font-semibold text-[#55524c] capitalize truncate max-w-xs">
                {pathname?.replace("/admin", "").replace("/", "") || "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#1c1b1a] bg-[#f5f4ef] hover:bg-[#eae8df] px-3.5 py-2 rounded-full transition-colors border border-[#e6e4dc]"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#7a766f]" />
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-[#eceae3]">
              <div className="w-8 h-8 rounded-full bg-[#1c1b1a] text-white flex items-center justify-center font-bold text-xs uppercase">
                {(user.displayName || user.email || "A")
                  .split(/[\s@._]+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => (w && w.length > 0 ? w.charAt(0).toUpperCase() : ""))
                  .join("") || "AD"}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-semibold text-[#1c1b1a] leading-tight">
                  {user.displayName || user.email?.split("@")[0] || "Admin"}
                </span>
                <span className="text-[10px] text-[#8a867f] leading-tight">{user.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Flyout Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="bg-white w-4/5 max-w-sm h-full p-4 overflow-y-auto space-y-6 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#f0eee8]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1c1b1a] text-white flex items-center justify-center font-bold text-xs">
                    SH
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1c1b1a]">SH Photography</h3>
                    <p className="text-[11px] text-[#8a867f]">Admin Dashboard</p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-[#7a766f]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-4">
                {navGroups.map((grp) => (
                  <div key={grp.group} className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#9d9990] px-2">{grp.group}</p>
                    {grp.items.map((it) => {
                      const Icon = it.icon;
                      const isActive = pathname === it.href;
                      return (
                        <Link
                          key={it.href}
                          href={it.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                            isActive ? "bg-[#e8491c] text-white" : "text-[#615e57] hover:bg-[#f5f4ef]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{it.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#f0eee8]">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Inner Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto min-w-0">{children}</main>
      </div>

      {/* 3. Mobile Bottom Navigation Bar (Zero Horizontal Scroll) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#e8e6df] h-16 z-40 px-3 flex items-center justify-around">
        <Link
          href="/admin"
          className={`flex flex-col items-center gap-1 ${pathname === "/admin" ? "text-[#e8491c]" : "text-[#8a867f]"}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        <Link
          href="/admin/bookings"
          className={`flex flex-col items-center gap-1 ${pathname === "/admin/bookings" ? "text-[#e8491c]" : "text-[#8a867f]"}`}
        >
          <CalendarCheck2 className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Bookings</span>
        </Link>
        <Link
          href="/admin/bento"
          className={`flex flex-col items-center gap-1 ${pathname === "/admin/bento" ? "text-[#e8491c]" : "text-[#8a867f]"}`}
        >
          <Grid2X2 className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Bento</span>
        </Link>
        <Link
          href="/admin/portfolio"
          className={`flex flex-col items-center gap-1 ${pathname === "/admin/portfolio" ? "text-[#e8491c]" : "text-[#8a867f]"}`}
        >
          <ImageIcon className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Gallery</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-[#8a867f]"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Menu</span>
        </button>
      </nav>
    </div>
  );
}
