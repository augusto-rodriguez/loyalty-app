"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Store, ArrowLeft } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 403) { setError("No tienes permisos de administrador"); return; }
        if (r.status === 401) { router.push("/login"); return; }
        if (!r.ok) throw new Error();
      })
      .catch(() => setError("Error de conexión"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--wine-dark)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--sand)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--wine-dark)" }}>
        <div className="text-center">
          <p className="font-medium mb-4" style={{ color: "var(--sand)" }}>{error}</p>
          <Link href="/dashboard" className="hover:underline" style={{ color: "var(--rose-light)" }}>
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Resumen", icon: <BarChart3 size={18} />, exact: true },
    { href: "/admin/businesses", label: "Negocios", icon: <Store size={18} />, exact: false },
  ];

  return (
    <div className="min-h-screen pb-16 md:pb-0" style={{ background: "var(--wine-dark)" }}>
      <header className="sticky top-0 z-10" style={{ background: "var(--wine)", borderBottom: "1px solid #6B2E44" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-display text-xl italic" style={{ color: "var(--sand)" }}>
              Admin
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(217,185,140,0.2)", color: "var(--sand)" }}>
              Panel interno
            </span>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm" style={{ color: "var(--rose-light)" }}>
            <ArrowLeft size={16} />
            Volver al dashboard
          </Link>
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
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium"
                  style={active ? { background: "var(--wine)", color: "var(--sand)" } : { color: "var(--rose-light)" }}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-10" style={{ background: "var(--wine)", borderTop: "1px solid #6B2E44" }}>
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-4 py-2"
                style={{ color: active ? "var(--sand)" : "var(--rose-light)" }}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
