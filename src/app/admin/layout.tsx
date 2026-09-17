"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
        if (r.status === 403) {
          setError("No tienes permisos de administrador");
          return;
        }
        if (r.status === 401) {
          router.push("/login");
          return;
        }
        if (!r.ok) throw new Error();
      })
      .catch(() => setError("Error de conexión"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "📊 Resumen", exact: true },
    { href: "/admin/businesses", label: "🏪 Negocios", exact: false },
  ];

  return (
    <div className="min-h-screen bg-slate-900 pb-16 md:pb-0">
      {/* Top bar */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xl font-bold text-red-500">
              ⚙️ Admin
            </Link>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
              Panel interno
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Volver al dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
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
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Bottom navigation — móvil */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 md:hidden z-10">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 ${
                  active ? "text-red-400" : "text-slate-500"
                }`}
              >
                <span className="text-xl">{item.label.split(" ")[0]}</span>
                <span className="text-xs font-medium">
                  {item.label.split(" ").slice(1).join(" ")}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
