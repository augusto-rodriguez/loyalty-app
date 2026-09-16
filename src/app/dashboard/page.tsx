"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalCustomers: number;
  totalVisits: number;
  recentVisits: number;
  pendingRewards: number;
  redeemedRewards: number;
  totalPrograms: number;
}

const emptyStats: Stats = {
  totalCustomers: 0,
  totalVisits: 0,
  recentVisits: 0,
  pendingRewards: 0,
  redeemedRewards: 0,
  totalPrograms: 0,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setStats(data.stats || emptyStats);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
        setStats(emptyStats);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Clientes", value: stats.totalCustomers, icon: "👥" },
        { label: "Visitas totales", value: stats.totalVisits, icon: "📍" },
        { label: "Visitas (7 días)", value: stats.recentVisits, icon: "📈" },
        { label: "Premios pendientes", value: stats.pendingRewards, icon: "🎁" },
        { label: "Premios canjeados", value: stats.redeemedRewards, icon: "✅" },
        { label: "Programas activos", value: stats.totalPrograms, icon: "🎯" },
      ]
    : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Panel de control</h1>
        <Link
          href="/dashboard/programs/new"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          + Nuevo programa
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm rounded-lg p-3">
          Error al cargar estadísticas: {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
            >
              <div className="h-4 bg-slate-200 rounded w-20 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <span>{card.icon}</span>
                <span>{card.label}</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {stats && stats.totalPrograms === 0 && !loading && (
        <div className="mt-8 bg-indigo-50 rounded-xl p-8 text-center">
          <p className="text-lg text-indigo-900 font-medium mb-2">
            ¡Bienvenido! Crea tu primer programa de fidelización
          </p>
          <p className="text-indigo-600 mb-4">
            Solo toma 2 minutos. Configura los sellos, el premio, y genera tu QR.
          </p>
          <Link
            href="/dashboard/programs/new"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
          >
            Crear programa →
          </Link>
        </div>
      )}
    </div>
  );
}
