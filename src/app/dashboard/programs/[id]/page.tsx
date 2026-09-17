"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Download, Pause, Play, Trash2, Gift, ShieldCheck, Eye, EyeOff } from "lucide-react";

interface CustomerCard {
  id: string;
  stampsCount: number;
  isCompleted: boolean;
  customer: { id: string; name: string | null; phone: string | null; email: string | null };
  reward: { id: string; isRedeemed: boolean; redeemedAt: string | null } | null;
}

interface Program {
  id: string;
  name: string;
  description: string | null;
  stampsRequired: number;
  cooldownMinutes: number;
  requiresPin: boolean;
  rewardTitle: string;
  rewardDescription: string | null;
  isActive: boolean;
  qrCode: string;
  customerCards: CustomerCard[];
}

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dailyPin, setDailyPin] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    fetch(`/api/programs/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProgram(data.program);
        const scanUrl = `${window.location.origin}/s/${data.program.qrCode}`;
        import("qrcode").then((QRCode) => {
          QRCode.toDataURL(scanUrl, {
            width: 300,
            margin: 2,
            color: { dark: "#4f46e5", light: "#ffffff" },
          }).then(setQrDataUrl);
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (program?.requiresPin) {
      fetch(`/api/programs/${id}/pin`)
        .then((r) => r.json())
        .then((data) => { if (data.pin) setDailyPin(data.pin); });
    }
  }, [program, id]);

  async function handleRedeem(rewardId: string) {
    if (!confirm("¿Confirmar canje de recompensa?")) return;
    const res = await fetch(`/api/rewards/${rewardId}/redeem`, { method: "POST" });
    if (res.ok) {
      const r = await fetch(`/api/programs/${id}`);
      const data = await r.json();
      setProgram(data.program);
    }
  }

  function copyScanUrl() {
    if (!program) return;
    navigator.clipboard.writeText(`${window.location.origin}/s/${program.qrCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!program) return;
    const clientCount = program.customerCards.length;
    const message = clientCount > 0
      ? `Este programa tiene ${clientCount} cliente${clientCount !== 1 ? "s" : ""}. Al eliminarlo se borrarán todos sus sellos y premios.\n\n¿Estás seguro de que quieres eliminar "${program.name}"?`
      : `¿Estás seguro de que quieres eliminar "${program.name}"?`;
    if (!confirm(message)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/programs");
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar");
      }
    } catch {
      alert("Error al eliminar el programa");
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleActive() {
    if (!program) return;
    const newState = !program.isActive;
    if (!confirm(`¿${newState ? "Activar" : "Pausar"} el programa "${program.name}"?`)) return;
    const res = await fetch(`/api/programs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: newState }),
    });
    if (res.ok) {
      setProgram((prev) => prev ? { ...prev, isActive: newState } : prev);
    }
  }

  if (loading || !program) {
    return <div className="animate-pulse text-slate-400">Cargando...</div>;
  }

  return (
    <div>
      <Link
        href="/dashboard/programs"
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4"
      >
        <ArrowLeft size={14} />
        Volver a programas
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80 shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h1 className="text-xl font-bold text-slate-900 mb-1">{program.name}</h1>
            {program.description && (
              <p className="text-sm text-slate-500 mb-4">{program.description}</p>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Sellos necesarios</span>
                <span className="font-semibold">{program.stampsRequired}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recompensa</span>
                <span className="font-semibold">{program.rewardTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cooldown</span>
                <span className="font-semibold">
                  {program.cooldownMinutes >= 60
                    ? `${program.cooldownMinutes / 60}h`
                    : `${program.cooldownMinutes} min`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado</span>
                <span className={`font-semibold ${program.isActive ? "text-green-600" : "text-slate-400"}`}>
                  {program.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verificación PIN</span>
                <span className={`font-semibold ${program.requiresPin ? "text-indigo-600" : "text-slate-400"}`}>
                  {program.requiresPin ? "Activada" : "Desactivada"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clientes</span>
                <span className="font-semibold">{program.customerCards.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <h3 className="font-semibold text-slate-900 mb-3">Código QR</h3>
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" className="mx-auto mb-3 rounded-lg" width={200} height={200} />
            )}
            <p className="text-xs text-slate-400 mb-3">Imprime este QR y ponlo en tu local</p>
            <div className="space-y-2">
              <button
                onClick={copyScanUrl}
                className="flex items-center justify-center gap-1.5 w-full py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copiado" : "Copiar link"}
              </button>
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`qr-${program.qrCode}.png`}
                  className="flex items-center justify-center gap-1.5 w-full py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Download size={14} />
                  Descargar QR
                </a>
              )}
            </div>
          </div>

          {program.requiresPin && dailyPin && (
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-600" />
                  <h3 className="font-semibold text-indigo-900 text-sm">PIN del día</h3>
                </div>
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="text-indigo-400 hover:text-indigo-600"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-3xl font-mono font-bold text-indigo-700 text-center tracking-[0.3em]">
                {showPin ? dailyPin : "••••"}
              </p>
              <p className="text-xs text-indigo-400 text-center mt-2">
                Comparte este código con tu personal. Cambia cada día automáticamente.
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            <button
              onClick={handleToggleActive}
              className={`flex items-center justify-center gap-1.5 w-full py-2 text-sm font-medium rounded-lg ${
                program.isActive
                  ? "border border-amber-300 text-amber-600 hover:bg-amber-50"
                  : "border border-green-300 text-green-600 hover:bg-green-50"
              }`}
            >
              {program.isActive ? <Pause size={14} /> : <Play size={14} />}
              {program.isActive ? "Pausar programa" : "Activar programa"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={14} />
              {deleting ? "Eliminando..." : "Eliminar programa"}
            </button>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Clientes ({program.customerCards.length})
          </h2>

          {program.customerCards.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-slate-400">Aún no hay clientes. ¡Comparte tu QR para empezar!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {program.customerCards.map((card) => (
                <div key={card.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-slate-900">{card.customer.name || "Cliente"}</p>
                      <p className="text-sm text-slate-400">{card.customer.phone || card.customer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{card.stampsCount}/{program.stampsRequired}</p>
                      <p className="text-xs text-slate-400">sellos</p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {[...Array(program.stampsRequired)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                          i < card.stampsCount
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}
                      >
                        {i < card.stampsCount ? "✓" : i + 1}
                      </div>
                    ))}
                  </div>

                  {card.isCompleted && card.reward && (
                    <div className={`rounded-lg p-3 text-sm ${
                      card.reward.isRedeemed ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {card.reward.isRedeemed ? (
                        <span className="flex items-center gap-1.5">
                          <Check size={14} /> Recompensa canjeada
                        </span>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5">
                            <Gift size={14} /> Recompensa lista: {program.rewardTitle}
                          </span>
                          <button
                            onClick={() => handleRedeem(card.reward!.id)}
                            className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700"
                          >
                            Validar canje
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
