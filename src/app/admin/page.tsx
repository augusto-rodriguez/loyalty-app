"use client";

import { useEffect, useState } from "react";
import {
  Store, UserPlus, CalendarDays, Target, CheckCircle, Pause,
  Users, MapPin, TrendingUp, BarChart3, Gift, Clock,
} from "lucide-react";

interface Stats {
  totalBusinesses: number;
  newBusinessesLast7Days: number;
  newBusinessesLast30Days: number;
  totalPrograms: number;
  activePrograms: number;
  totalCustomers: number;
  totalVisits: number;
  visitsLast7Days: number;
  visitsLast30Days: number;
  totalRewards: number;
  redeemedRewards: number;
  pendingRewards: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then((data) => setStats(data.stats));
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="rounded-xl p-6 animate-pulse" style={{ background: "var(--wine)" }}>
            <div className="h-4 rounded w-20 mb-3" style={{ background: "#0F9C6C" }} />
            <div className="h-8 rounded w-16" style={{ background: "#0F9C6C" }} />
          </div>
        ))}
      </div>
    );
  }

  const sections = [
    { title: "Negocios", cards: [
      { label: "Total registrados", value: stats.totalBusinesses, icon: <Store size={18} /> },
      { label: "Nuevos (7 días)", value: stats.newBusinessesLast7Days, icon: <UserPlus size={18} /> },
      { label: "Nuevos (30 días)", value: stats.newBusinessesLast30Days, icon: <CalendarDays size={18} /> },
    ]},
    { title: "Programas", cards: [
      { label: "Total programas", value: stats.totalPrograms, icon: <Target size={18} /> },
      { label: "Activos", value: stats.activePrograms, icon: <CheckCircle size={18} /> },
      { label: "Inactivos", value: stats.totalPrograms - stats.activePrograms, icon: <Pause size={18} /> },
    ]},
    { title: "Actividad", cards: [
      { label: "Clientes totales", value: stats.totalCustomers, icon: <Users size={18} /> },
      { label: "Visitas totales", value: stats.totalVisits, icon: <MapPin size={18} /> },
      { label: "Visitas (7 días)", value: stats.visitsLast7Days, icon: <TrendingUp size={18} /> },
      { label: "Visitas (30 días)", value: stats.visitsLast30Days, icon: <BarChart3 size={18} /> },
    ]},
    { title: "Premios", cards: [
      { label: "Total generados", value: stats.totalRewards, icon: <Gift size={18} /> },
      { label: "Canjeados", value: stats.redeemedRewards, icon: <CheckCircle size={18} /> },
      { label: "Pendientes", value: stats.pendingRewards, icon: <Clock size={18} /> },
    ]},
  ];

  return (
    <div>
      <h1 className="font-display text-2xl italic mb-8" style={{ color: "var(--sand)" }}>Panel de administración</h1>
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--rose-light)" }}>
              {section.title}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {section.cards.map((card) => (
                <div key={card.label} className="rounded-xl p-5" style={{ background: "var(--wine)", border: "1px solid #0F9C6C" }}>
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: "var(--sand)" }}>
                    {card.icon}
                    <span>{card.label}</span>
                  </div>
                  <p className="text-3xl font-semibold text-white">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
