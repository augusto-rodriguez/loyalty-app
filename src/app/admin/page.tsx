"use client";

import { useEffect, useState } from "react";
import {
  Store, UserPlus, CalendarDays,
  Target, CheckCircle, Pause,
  Users, MapPin, TrendingUp, BarChart3,
  Gift, Clock,
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
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => setStats(data.stats));
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-slate-800 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-20 mb-3" />
            <div className="h-8 bg-slate-700 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  const sections = [
    {
      title: "Negocios",
      cards: [
        { label: "Total registrados", value: stats.totalBusinesses, icon: <Store size={18} className="text-indigo-400" /> },
        { label: "Nuevos (7 días)", value: stats.newBusinessesLast7Days, icon: <UserPlus size={18} className="text-green-400" /> },
        { label: "Nuevos (30 días)", value: stats.newBusinessesLast30Days, icon: <CalendarDays size={18} className="text-blue-400" /> },
      ],
    },
    {
      title: "Programas",
      cards: [
        { label: "Total programas", value: stats.totalPrograms, icon: <Target size={18} className="text-violet-400" /> },
        { label: "Activos", value: stats.activePrograms, icon: <CheckCircle size={18} className="text-green-400" /> },
        { label: "Inactivos", value: stats.totalPrograms - stats.activePrograms, icon: <Pause size={18} className="text-slate-400" /> },
      ],
    },
    {
      title: "Actividad",
      cards: [
        { label: "Clientes totales", value: stats.totalCustomers, icon: <Users size={18} className="text-indigo-400" /> },
        { label: "Visitas totales", value: stats.totalVisits, icon: <MapPin size={18} className="text-blue-400" /> },
        { label: "Visitas (7 días)", value: stats.visitsLast7Days, icon: <TrendingUp size={18} className="text-green-400" /> },
        { label: "Visitas (30 días)", value: stats.visitsLast30Days, icon: <BarChart3 size={18} className="text-cyan-400" /> },
      ],
    },
    {
      title: "Premios",
      cards: [
        { label: "Total generados", value: stats.totalRewards, icon: <Gift size={18} className="text-amber-400" /> },
        { label: "Canjeados", value: stats.redeemedRewards, icon: <CheckCircle size={18} className="text-green-400" /> },
        { label: "Pendientes", value: stats.pendingRewards, icon: <Clock size={18} className="text-orange-400" /> },
      ],
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">
        Panel de administración
      </h1>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {section.title}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {section.cards.map((card) => (
                <div
                  key={card.label}
                  className="bg-slate-800 rounded-xl border border-slate-700 p-5"
                >
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    {card.icon}
                    <span>{card.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
