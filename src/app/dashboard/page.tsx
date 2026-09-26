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
    return <div className="animate-pulse" style={{ color: "var(--ink-muted)" }}>Cargando programas...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl italic" style={{ color: "var(--wine)" }}>Mis programas</h1>
        <Link
          href="/dashboard/programs/new"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full text-white"
          style={{ background: "var(--wine)" }}
        >
          <Plus size={16} />
          Nuevo programa
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
          <p className="mb-4" style={{ color: "var(--ink-muted)" }}>Aún no tienes programas</p>
          <Link href="/dashboard/programs/new" className="font-medium" style={{ color: "var(--rose)" }}>
            Crear tu primer programa
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/dashboard/programs/${program.id}`}
              className="block rounded-xl p-6 transition"
              style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>{program.name}</h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={
                        program.isActive
                          ? { background: "#DCFCE7", color: "#15803D" }
                          : { background: "var(--line)", color: "var(--ink-muted)" }
                      }
                    >
                      {program.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                    {program.stampsRequired} sellos → {program.rewardTitle}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold" style={{ color: "var(--wine)" }}>{program._count.customerCards}</p>
                  <p className="text-xs" style={{ color: "var(--ink-muted)" }}>clientes</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
