"use client";

import { useEffect, useState, use } from "react";
import { Store, Gift, Star, PartyPopper, CheckCircle, AlertCircle, ShieldCheck, Lock } from "lucide-react";

interface ProgramInfo {
  id: string;
  name: string;
  description: string | null;
  stampsRequired: number;
  rewardTitle: string;
  rewardDescription: string | null;
  requiresPin: boolean;
  businessName: string;
  businessLogo: string | null;
}

interface CardStatus {
  stampsCount: number;
  stampsRequired: number;
  isCompleted: boolean;
  rewardAvailable: boolean;
  rewardTitle: string;
}

const inputStyle = { border: "1px solid var(--line)", ["--tw-ring-color" as string]: "var(--rose)" };

export default function ScanPage({
  params,
}: {
  params: Promise<{ qrCode: string }>;
}) {
  const { qrCode } = use(params);
  const [program, setProgram] = useState<ProgramInfo | null>(null);
  const [card, setCard] = useState<CardStatus | null>(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<"loading" | "identify" | "result" | "error">("loading");
  const [message, setMessage] = useState("");
  const [newStamp, setNewStamp] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/scan/${qrCode}`)
      .then((r) => {
        if (!r.ok) throw new Error("Programa no encontrado");
        return r.json();
      })
      .then((data) => {
        setProgram(data.program);
        const savedPhone = localStorage.getItem(`fidelio-phone-${qrCode}`);
        const savedName = localStorage.getItem(`fidelio-name-${qrCode}`);
        if (savedPhone && !data.program.requiresPin) {
          setPhone(savedPhone);
          if (savedName) setName(savedName);
          registerVisit(savedPhone, savedName || undefined);
        } else if (savedPhone) {
          setPhone(savedPhone);
          if (savedName) setName(savedName);
          setStep("identify");
        } else {
          setStep("identify");
        }
      })
      .catch(() => {
        setError("Este programa no existe o ya no está activo");
        setStep("error");
      });
  }, [qrCode]);

  async function registerVisit(customerPhone: string, customerName?: string, customerPin?: string) {
    try {
      const res = await fetch(`/api/scan/${qrCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: customerPhone, name: customerName, pin: customerPin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCard(data.card);
      setMessage(data.message);
      setNewStamp(data.newStamp || false);
      setStep("result");
      localStorage.setItem(`fidelio-phone-${qrCode}`, customerPhone);
      if (customerName) localStorage.setItem(`fidelio-name-${qrCode}`, customerName);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar visita");
    }
  }

  function handleIdentify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!phone.trim()) return;
    if (program?.requiresPin && !pin.trim()) {
      setError("Ingresa el PIN que te dará el personal del local");
      return;
    }
    registerVisit(phone.trim(), name.trim() || undefined, pin.trim() || undefined);
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: "var(--wine)" }} />
      </div>
    );
  }

  if (step === "error" && !program) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--cream)" }}>
        <div className="text-center">
          <AlertCircle size={48} style={{ color: "var(--rose)" }} className="mx-auto mb-4" />
          <p className="font-medium" style={{ color: "var(--wine)" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "var(--cream)" }}>
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--sand)" }}>
            <Store size={28} style={{ color: "var(--wine-dark)" }} />
          </div>
          <h1 className="font-display text-xl italic" style={{ color: "var(--wine)" }}>{program?.businessName}</h1>
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>{program?.name}</p>
        </div>

        {step === "identify" && (
          <form
            onSubmit={handleIdentify}
            className="rounded-2xl p-6 space-y-4"
            style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
          >
            <p className="text-center text-sm" style={{ color: "var(--ink-muted)" }}>
              Ingresa tus datos para registrar tu visita
            </p>

            {error && (
              <div className="text-sm rounded-lg p-3 flex items-start gap-2" style={{ background: "#FBE9EC", color: "var(--wine-dark)" }}>
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Tu nombre (opcional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="¿Cómo te llamas?"
                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 text-lg"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Teléfono *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+56 9 1234 5678"
                className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 text-lg"
                style={inputStyle}
                required
              />
            </div>

            {program?.requiresPin && (
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
                  <Lock size={14} /> Código PIN *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Pide el código al personal"
                  className="w-full px-4 py-3 rounded-xl outline-none focus:ring-2 text-lg text-center tracking-[0.3em] font-mono"
                  style={inputStyle}
                  required
                />
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--ink-muted)" }}>
                  <ShieldCheck size={12} style={{ color: "var(--rose)" }} />
                  El personal del local tiene el código actual
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 font-semibold rounded-xl text-white text-lg"
              style={{ background: "var(--wine)" }}
            >
              Registrar visita
            </button>

            <p className="text-center text-xs" style={{ color: "var(--ink-muted)" }}>
              Solo usamos tu número para identificar tu tarjeta
            </p>
          </form>
        )}

        {step === "result" && card && (
          <div className="space-y-4">
            <div
              className="rounded-2xl p-5 text-center"
              style={
                card.isCompleted
                  ? { background: "linear-gradient(135deg, var(--sand-dark), var(--sand))", color: "var(--wine-dark)" }
                  : newStamp
                  ? { background: "var(--wine)", color: "white" }
                  : { background: "var(--paper)", border: "1px solid var(--line)" }
              }
            >
              <div className="flex items-center justify-center gap-2">
                {card.isCompleted ? <PartyPopper size={20} /> : newStamp ? <CheckCircle size={20} /> : null}
                <p className="text-lg font-semibold" style={!card.isCompleted && !newStamp ? { color: "var(--ink)" } : {}}>
                  {message}
                </p>
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium" style={{ color: "var(--ink-muted)" }}>Tu tarjeta</span>
                <span className="text-sm font-bold" style={{ color: "var(--wine)" }}>{card.stampsCount}/{card.stampsRequired}</span>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-4">
                {[...Array(card.stampsRequired)].map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                      i === card.stampsCount - 1 && newStamp ? "animate-bounce" : ""
                    }`}
                    style={
                      i < card.stampsCount
                        ? { background: "var(--sand)", color: "var(--wine-dark)" }
                        : { background: "var(--cream)", color: "var(--ink-muted)", border: "2px dashed var(--line)" }
                    }
                  >
                    {i < card.stampsCount ? <Star size={18} fill="currentColor" /> : <span className="text-sm font-bold">{i + 1}</span>}
                  </div>
                ))}
              </div>

              <div className="w-full rounded-full h-2 mb-2" style={{ background: "var(--cream)" }}>
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(card.stampsCount / card.stampsRequired) * 100}%`, background: "var(--wine)" }}
                />
              </div>

              <div className="text-center mt-4 p-3 rounded-xl" style={{ background: "var(--cream)" }}>
                <p className="text-xs uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>Premio</p>
                <p className="font-semibold flex items-center justify-center gap-1.5" style={{ color: "var(--wine)" }}>
                  <Gift size={16} />
                  {card.rewardTitle}
                </p>
                {!card.isCompleted && (
                  <p className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>
                    Te faltan {card.stampsRequired - card.stampsCount} visitas
                  </p>
                )}
              </div>
            </div>

            {card.isCompleted && card.rewardAvailable && (
              <div className="rounded-2xl p-6 text-center" style={{ background: "#F1E4DC", border: "2px solid var(--sand-dark)" }}>
                <PartyPopper size={36} style={{ color: "var(--wine)" }} className="mx-auto mb-2" />
                <p className="font-bold text-lg mb-1" style={{ color: "var(--wine)" }}>Recompensa desbloqueada</p>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  Muestra esta pantalla al personal para canjear tu premio
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
