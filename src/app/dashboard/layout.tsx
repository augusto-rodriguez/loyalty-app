"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Target, Settings, LogOut } from "lucide-react";

interface Business {
  id: string;
  name: string;
  email: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
      fetch("/api/auth/is-admin")
        .then((r) => r.json())
        .catch(() => ({ isAdmin: false })),
    ])
      .then(([meData, adminData]) => {
        setBusiness(meData.business);
        setIsAdmin(adminData.isAdmin || false);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Inicio", icon: <LayoutDashboard size={18} />, exact: true },
    { href: "/dashboard/programs", label: "Programas", icon: <Target size={18} />, exact: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16 md:pb-0">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <Target size={24} />
            Fidelio
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:inline">
              {business?.name}
            </span>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-medium hover:bg-red-100 transition"
              >
                <Settings size={14} />
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-slate-400 hover:text-red-500 flex items-center gap-1"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <nav className="w-56 shrink-0 hidden md:block">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <Settings size={18} /> Administración
              </Link>
            )}
          </div>
        </nav>

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-10">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
                  active ? "text-indigo-600" : "text-slate-400"
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-red-500"
            >
              <Settings size={18} />
              <span className="text-xs font-medium">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
