"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Copy, Check, Download, Pause, Play, Trash2, Gift,
  ShieldCheck, Eye, EyeOff, RefreshCw, ChevronDown, ChevronUp, Clock, MinusCircle,
} from "lucide-react";

interface Visit {
  id: string;
  createdAt: string;
}

interface CustomerCard {
  id: string;
  stampsCount: number;
  isCompleted: boolean;
  customer: { id: string; name: string | null; phone: string | null; email: string | null };
  reward: { id: string; isRedeemed: boolean; redeemedAt: string | null } | null;
  visits: Visit[];
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

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const [minutesLeft, setMinutesLeft] = useState<number>(0);
  const [regenerating, setRegenerating] = useState(false);
  const [togglingPin, setTogglingPin] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [removingStamp, setRemovingStamp] = useState<string | null>(null);

  useEffect(() => {
    loadProgram();
  }, [id]);

  function loadProgram() {
    fetch(`/api/programs/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProgram(data.program);
        const scanUrl = `${window.location.origin}/s/${data.program.qrCode}`;
        import("qrcode").then((QRCode) => {
          QRCode.toDataURL(scanUrl, {
            width: 300,
            margin: 2,
            color: { dark: "#0B815C", light: "#FFFFFF" },
          }).then(setQrDataUrl);
        });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!program?.requiresPin) return;

    function fetchPin() {
      fetch(`/api/programs/${id}/pin`)
        .then((r) => r.json())
        .then((data) => {
          if (data.pin) {
            setDailyPin(data.pin);
            setMinutesLeft(data.minutesLeft ?? 0);
          }
        });
    }

    fetchPin();
    const interval = setInterval(fetchPin, 30000);
    return () => clearInterval(interval);
  }, [program?.requiresPin, id]);

  async function handleRegeneratePin() {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/programs/${id}/pin`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setDailyPin(data.pin);
        setMinutesLeft(data.minutesLeft ?? 0);
        setShowPin(true);
      }
    } finally {
      setRegenerating(false);
    }
  }

  async function handleTogglePin() {
    if (!program) return;
    const newValue = !program.requiresPin;
    setTogglingPin(true);
    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requiresPin: newValue }),
      });
      if (res.ok) {
        setProgram((prev) => prev ? { ...prev, requiresPin: newValue } : prev);
        if (!newValue) {
          setDailyPin(null);
        }
      }
    } finally {
      setTogglingPin(false);
    }
  }

  async function handleRedeem(rewardId: string) {
    if (!confirm("¿Confirmar canje de recompensa?")) return;
    const res = await fetch(`/api/rewards/${rewardId}/redeem`, { method: "POST" });
    if (res.ok) loadProgram();
  }

  async function handleRemoveStamp(cardId: string, customerName: string) {
    if (!confirm(`¿Quitar el sello más reciente de ${customerName}? Esta acción no se puede deshacer.`)) return;
    setRemovingStamp(cardId);
    try {
      const res = await fetch(`/api/customer-cards/${cardId}/remove-stamp`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        loadProgram();
      } else {
        alert(data.error || "Error al quitar el sello");
      }
    } finally {
      setRemovingStamp(null);
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
    return <div className="animate-pulse" style={{ color: "var(--ink-muted)" }}>Cargando...</div>;
  }

  return (
    <div>
      <Link
        href="/dashboard/programs"
        className="flex items-center gap-1 text-sm mb-4"
        style={{ color: "var(--ink-muted)" }}
      >
        <ArrowLeft size={14} />
        Volver a programas
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80 shrink-0 space-y-4">
          <div className="rounded-xl p-6" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
            <h1 className="font-display text-xl italic mb-1" style={{ color: "var(--wine)" }}>{program.name}</h1>
            {program.description && (
              <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>{program.description}</p>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--ink-muted)" }}>Sellos necesarios</span>
                <span className="font-semibold" style={{ color: "var(--ink)" }}>{program.stampsRequired}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--ink-muted)" }}>Recompensa</span>
                <span className="font-semibold" style={{ color: "var(--ink)" }}>{program.rewardTitle}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--ink-muted)" }}>Cooldown</span>
                <span className="font-semibold" style={{ color: "var(--ink)" }}>
                  {program.cooldownMinutes >= 60 ? `${program.cooldownMinutes / 60}h` : `${program.cooldownMinutes} min`}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--ink-muted)" }}>Estado</span>
                <span className="font-semibold" style={{ color: program.isActive ? "#15803D" : "var(--ink-muted)" }}>
                  {program.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--ink-muted)" }}>Clientes</span>
                <span className="font-semibold" style={{ color: "var(--ink)" }}>{program.customerCards.length}</span>
              </div>
            </div>
          </div>

          {/* Toggle de PIN */}
          <div className="rounded-xl p-5" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} style={{ color: "var(--wine)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>Verificación por PIN</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={program.requiresPin}
                  onChange={handleTogglePin}
                  disabled={togglingPin}
                  className="sr-only peer"
                />
                <div
                  className="w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-disabled:opacity-50"
                  style={{ background: program.requiresPin ? "var(--wine)" : "var(--line)" }}
                />
              </label>
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--ink-muted)" }}>
              {program.requiresPin
                ? "Tus clientes deben ingresar el PIN del personal para sumar sellos."
                : "Actívalo para reforzar la seguridad y evitar que compartan el QR."}
            </p>
          </div>

          {/* PIN actual */}
          {program.requiresPin && dailyPin && (
            <div className="rounded-xl p-5" style={{ background: "#D1FAE5" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} style={{ color: "var(--wine)" }} />
                  <h3 className="font-semibold text-sm" style={{ color: "var(--wine)" }}>PIN actual</h3>
                </div>
                <button onClick={() => setShowPin(!showPin)} style={{ color: "var(--rose)" }}>
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-3xl font-mono font-bold text-center tracking-[0.3em]" style={{ color: "var(--wine)" }}>
                {showPin ? dailyPin : "••••"}
              </p>
              <p className="text-xs text-center mt-2" style={{ color: "var(--ink-muted)" }}>
                Expira en {minutesLeft} minuto{minutesLeft !== 1 ? "s" : ""}
              </p>
              <button
                onClick={handleRegeneratePin}
                disabled={regenerating}
                className="flex items-center justify-center gap-1.5 w-full mt-3 py-2 text-xs font-medium rounded-lg disabled:opacity-50"
                style={{ background: "var(--paper)", border: "1px solid var(--rose)", color: "var(--wine)" }}
              >
                <RefreshCw size={13} className={regenerating ? "animate-spin" : ""} />
                {regenerating ? "Actualizando..." : "Actualizar ahora"}
              </button>
            </div>
          )}

          <div className="rounded-xl p-6 text-center" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
            <h3 className="font-semibold mb-3" style={{ color: "var(--ink)" }}>Código QR</h3>
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" className="mx-auto mb-3 rounded-lg" width={200} height={200} />
            )}
            <p className="text-xs mb-3" style={{ color: "var(--ink-muted)" }}>Imprime este QR y ponlo en tu local</p>
            <div className="space-y-2">
              <button
                onClick={copyScanUrl}
                className="flex items-center justify-center gap-1.5 w-full py-2 text-sm rounded-lg"
                style={{ border: "1px solid var(--line)", color: "var(--ink)" }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copiado" : "Copiar link"}
              </button>
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`qr-${program.qrCode}.png`}
                  className="flex items-center justify-center gap-1.5 w-full py-2 text-sm rounded-lg text-white"
                  style={{ background: "var(--wine)" }}
                >
                  <Download size={14} />
                  Descargar QR
                </a>
              )}
            </div>
          </div>

          <div className="rounded-xl p-4 space-y-2" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
            <button
              onClick={handleToggleActive}
              className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-medium rounded-lg"
              style={
                program.isActive
                  ? { border: "1px solid var(--sand-dark)", color: "#0E7490" }
                  : { border: "1px solid #6EE7B7", color: "#15803D" }
              }
            >
              {program.isActive ? <Pause size={14} /> : <Play size={14} />}
              {program.isActive ? "Pausar programa" : "Activar programa"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-medium rounded-lg disabled:opacity-50"
              style={{ border: "1px solid var(--rose)", color: "var(--wine)" }}
            >
              <Trash2 size={14} />
              {deleting ? "Eliminando..." : "Eliminar programa"}
            </button>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="font-display text-lg italic mb-4" style={{ color: "var(--wine)" }}>
            Clientes ({program.customerCards.length})
          </h2>

          {program.customerCards.length === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
              <p style={{ color: "var(--ink-muted)" }}>Aún no hay clientes. Comparte tu QR para empezar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {program.customerCards.map((card) => {
                const isExpanded = expandedCard === card.id;
                return (
                  <div key={card.id} className="rounded-xl p-4" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium" style={{ color: "var(--ink)" }}>{card.customer.name || "Cliente"}</p>
                        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>{card.customer.phone || card.customer.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: "var(--wine)" }}>{card.stampsCount}/{program.stampsRequired}</p>
                        <p className="text-xs" style={{ color: "var(--ink-muted)" }}>sellos</p>
                        {card.stampsCount > 0 && (
                          <button
                            onClick={() => handleRemoveStamp(card.id, card.customer.name || "este cliente")}
                            disabled={removingStamp === card.id}
                            className="flex items-center gap-1 text-xs mt-1 disabled:opacity-50"
                            style={{ color: "var(--rose)" }}
                          >
                            <MinusCircle size={12} />
                            {removingStamp === card.id ? "Quitando..." : "Quitar sello"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {[...Array(program.stampsRequired)].map((_, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                          style={
                            i < card.stampsCount
                              ? { background: "var(--sand)", color: "var(--wine-dark)" }
                              : { background: "var(--cream)", color: "var(--ink-muted)", border: "1px solid var(--line)" }
                          }
                        >
                          {i < card.stampsCount ? "✓" : i + 1}
                        </div>
                      ))}
                    </div>

                    {card.isCompleted && card.reward && (
                      <div
                        className="rounded-lg p-3 text-sm mb-2"
                        style={
                          card.reward.isRedeemed
                            ? { background: "#DCFCE7", color: "#15803D" }
                            : { background: "#D1FAE5", color: "var(--wine-dark)" }
                        }
                      >
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
                              className="px-3 py-1 rounded-lg text-xs font-medium text-white"
                              style={{ background: "var(--wine)" }}
                            >
                              Validar canje
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {card.visits.length > 0 && (
                      <div>
                        <button
                          onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                          className="flex items-center gap-1.5 text-xs"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          <Clock size={12} />
                          {isExpanded ? "Ocultar historial" : `Ver historial de visitas (${card.visits.length})`}
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                            {card.visits.map((visit, idx) => (
                              <div
                                key={visit.id}
                                className="flex items-center justify-between text-xs rounded px-3 py-1.5"
                                style={{ background: "var(--cream)", color: "var(--ink-muted)" }}
                              >
                                <span>Sello #{card.visits.length - idx}</span>
                                <span>{formatDateTime(visit.createdAt)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
