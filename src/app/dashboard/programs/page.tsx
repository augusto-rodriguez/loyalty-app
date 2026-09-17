"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Program {
  id: string;
  name: string;
  stampsRequired: number;
  rewardTitle: string;
  isActive: boolean;
  qrCode: string;
  _count: { customerCards: number };
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/programs")
      .then((r) => r.json())
      .then((data) => setPrograms(data.programs))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse text-slate-400">Cargando programas...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mis Programas</h1>
        <Link
          href="/dashboard/programs/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          <Plus size={16} />
          Nuevo programa
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 mb-4">Aún no tienes programas</p>
          <Link
            href="/dashboard/programs/new"
            className="text-indigo-600 font-medium hover:underline"
          >
            Crear tu primer programa
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/dashboard/programs/${program.id}`}
              className="block bg-white rounded-xl border border-slate-200 p-6 hover:border-indigo-300 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {program.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        program.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {program.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {program.stampsRequired} sellos → {program.rewardTitle}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    {program._count.customerCards}
                  </p>
                  <p className="text-xs text-slate-400">clientes</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
