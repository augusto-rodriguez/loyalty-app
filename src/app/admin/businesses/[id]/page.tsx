"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface CustomerCard {
  id: string;
  stampsCount: number;
  isCompleted: boolean;
  createdAt: string;
  customer: { name: string | null; phone: string | null; email: string | null };
  reward: { isRedeemed: boolean; redeemedAt: string | null } | null;
  _count: { visits: number };
}

interface Program {
  id: string;
  name: string;
  isActive: boolean;
  stampsRequired: number;
  cooldownMinutes: number;
  rewardTitle: string;
  qrCode: string;
  createdAt: string;
  customerCards: CustomerCard[];
}

interface Business {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  slug: string;
  createdAt: string;
  loyaltyPrograms: Program[];
}

export default function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/businesses/${id}`)
      .then((r) => r.json())
      .then((data) => setBusiness(data.business))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !business) {
    return <div className="text-slate-400 animate-pulse">Cargando...</div>;
  }

  return (
    <div>
      <Link
        href="/admin/businesses"
        className="text-sm text-slate-500 hover:text-slate-300 mb-4 inline-block"
      >
        ← Volver a negocios
      </Link>

      {/* Business info */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">{business.name}</h1>
        <div className="space-y-1 text-sm text-slate-400">
          <p>📧 {business.email}</p>
          {business.phone && <p>📱 {business.phone}</p>}
          <p>🔗 /{business.slug}</p>
          <p>
            📅 Registrado:{" "}
            {new Date(business.createdAt).toLocaleDateString("es-CL", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Programs */}
      <h2 className="text-lg font-semibold text-white mb-4">
        Programas ({business.loyaltyPrograms.length})
      </h2>

      {business.loyaltyPrograms.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <p className="text-slate-500">Este negocio no ha creado programas</p>
        </div>
      ) : (
        <div className="space-y-6">
          {business.loyaltyPrograms.map((prog) => (
            <div
              key={prog.id}
              className="bg-slate-800 rounded-xl border border-slate-700 p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">
                      {prog.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        prog.isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-slate-700 text-slate-500"
                      }`}
                    >
                      {prog.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">
                    {prog.stampsRequired} sellos → {prog.rewardTitle} |
                    Cooldown:{" "}
                    {prog.cooldownMinutes >= 60
                      ? `${prog.cooldownMinutes / 60}h`
                      : `${prog.cooldownMinutes} min`}{" "}
                    | QR: {prog.qrCode}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {prog.customerCards.length}
                  </p>
                  <p className="text-xs text-slate-400">clientes</p>
                </div>
              </div>

              {/* Customers table */}
              {prog.customerCards.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="text-left py-2 pr-4">Cliente</th>
                        <th className="text-left py-2 pr-4">Contacto</th>
                        <th className="text-center py-2 pr-4">Sellos</th>
                        <th className="text-center py-2 pr-4">Visitas</th>
                        <th className="text-center py-2">Premio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prog.customerCards.map((card) => (
                        <tr
                          key={card.id}
                          className="border-b border-slate-700/50"
                        >
                          <td className="py-2.5 pr-4 text-white">
                            {card.customer.name || "—"}
                          </td>
                          <td className="py-2.5 pr-4 text-slate-400">
                            {card.customer.phone || card.customer.email || "—"}
                          </td>
                          <td className="py-2.5 pr-4 text-center">
                            <span
                              className={`font-semibold ${
                                card.isCompleted
                                  ? "text-green-400"
                                  : "text-white"
                              }`}
                            >
                              {card.stampsCount}/{prog.stampsRequired}
                            </span>
                          </td>
                          <td className="py-2.5 pr-4 text-center text-slate-400">
                            {card._count.visits}
                          </td>
                          <td className="py-2.5 text-center">
                            {!card.reward ? (
                              <span className="text-slate-600">—</span>
                            ) : card.reward.isRedeemed ? (
                              <span className="text-green-400">✅ Canjeado</span>
                            ) : (
                              <span className="text-amber-400">⏳ Pendiente</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
