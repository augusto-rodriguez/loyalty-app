"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  slug: string;
  createdAt: string;
  loyaltyPrograms: {
    id: string;
    name: string;
    isActive: boolean;
    stampsRequired: number;
    rewardTitle: string;
    _count: { customerCards: number };
  }[];
  _count: { loyaltyPrograms: number };
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/businesses")
      .then((r) => r.json())
      .then((data) => setBusinesses(data.businesses || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-slate-400 animate-pulse">Cargando negocios...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">
          Negocios ({businesses.length})
        </h1>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <p className="text-slate-400">
            {search ? "No se encontraron negocios" : "Aún no hay negocios registrados"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((biz) => {
            const totalClients = biz.loyaltyPrograms.reduce(
              (sum, p) => sum + p._count.customerCards,
              0
            );
            const activePrograms = biz.loyaltyPrograms.filter(
              (p) => p.isActive
            ).length;

            return (
              <Link
                key={biz.id}
                href={`/admin/businesses/${biz.id}`}
                className="block bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-500 transition"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {biz.name}
                    </h3>
                    <p className="text-sm text-slate-400">{biz.email}</p>
                    {biz.phone && (
                      <p className="text-sm text-slate-500">{biz.phone}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-1">
                      Registrado:{" "}
                      {new Date(biz.createdAt).toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex gap-6 sm:gap-8 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {biz._count.loyaltyPrograms}
                      </p>
                      <p className="text-xs text-slate-400">programas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {activePrograms}
                      </p>
                      <p className="text-xs text-slate-400">activos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {totalClients}
                      </p>
                      <p className="text-xs text-slate-400">clientes</p>
                    </div>
                  </div>
                </div>

                {/* Programs summary */}
                {biz.loyaltyPrograms.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {biz.loyaltyPrograms.map((prog) => (
                      <span
                        key={prog.id}
                        className={`text-xs px-2.5 py-1 rounded-full ${
                          prog.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-700 text-slate-500"
                        }`}
                      >
                        {prog.name} ({prog._count.customerCards})
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
