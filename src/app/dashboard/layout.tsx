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
      fetch("/api/auth/is-admin").then((r) => r.json()).catch(() => ({ isAdmin: false })),
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--wine)" }} />
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Inicio", icon: <LayoutDashboard size={18} />, exact: true },
    { href: "/dashboard/programs", label: "Programas", icon: <Target size={18} />, exact: false },
  ];

  return (
    <div className="min-h-screen pb-16 md:pb-0" style={{ background: "var(--cream)" }}>
      <header className="sticky top-0 z-10" style={{ background: "var(--paper)", borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="font-display text-xl italic" style={{ color: "var(--wine)" }}>
            EcoFideliza
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:inline" style={{ color: "var(--ink-muted)" }}>
              {business?.name}
            </span>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: "#FBE9EC", color: "var(--wine-dark)" }}
              >
                <Settings size={14} />
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm flex items-center gap-1"
              style={{ color: "var(--ink-muted)" }}
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
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition"
                  style={
                    active
                      ? { background: "#F1E4DC", color: "var(--wine)" }
                      : { color: "var(--ink-muted)" }
                  }
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium"
                style={{ color: "var(--rose)" }}
              >
                <Settings size={18} /> Administración
              </Link>
            )}
          </div>
        </nav>

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 md:hidden z-10"
        style={{ background: "var(--paper)", borderTop: "1px solid var(--line)" }}
      >
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg"
                style={{ color: active ? "var(--wine)" : "var(--ink-muted)" }}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link href="/admin" className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg" style={{ color: "var(--rose)" }}>
              <Settings size={18} />
              <span className="text-xs font-medium">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
