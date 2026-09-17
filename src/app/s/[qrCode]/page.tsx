"use client";

import { useEffect, useState, use } from "react";
import { Store, Gift, Star, PartyPopper, CheckCircle, AlertCircle } from "lucide-react";

interface ProgramInfo {
  id: string;
  name: string;
  description: string | null;
  stampsRequired: number;
  rewardTitle: string;
  rewardDescription: string | null;
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
  const [step, setStep] = useState<"loading" | "identify" | "result" | "error">(
    "loading"
  );
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
        if (savedPhone) {
          setPhone(savedPhone);
          if (savedName) setName(savedName);
          registerVisit(savedPhone, savedName || undefined);
        } else {
          setStep("identify");
        }
      })
      .catch(() => {
        setError("Este programa no existe o ya no está activo");
        setStep("error");
      });
  }, [qrCode]);

  async function registerVisit(customerPhone: string, customerName?: string) {
    try {
      const res = await fetch(`/api/scan/${qrCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: customerPhone, name: customerName }),
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
      setStep("error");
    }
  }

  function handleIdentify(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    registerVisit(phone.trim(), name.trim() || undefined);
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Store size={28} className="text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{program?.businessName}</h1>
          <p className="text-sm text-slate-500">{program?.name}</p>
        </div>

        {step === "identify" && (
          <form
            onSubmit={handleIdentify}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm"
          >
            <p className="text-center text-sm text-slate-500">
              Ingresa tu número para registrar tu visita
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tu nombre (opcional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="¿Cómo te llamas?"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+56 9 1234 5678"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 text-lg"
            >
              Registrar visita
            </button>
            <p className="text-center text-xs text-slate-400">
              Solo usamos tu número para identificar tu tarjeta
            </p>
          </form>
        )}

        {step === "result" && card && (
          <div className="space-y-4">
            <div
              className={`rounded-2xl p-5 text-center shadow-sm ${
                card.isCompleted
                  ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white"
                  : newStamp
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                  : "bg-white border border-slate-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {card.isCompleted ? (
                  <PartyPopper size={20} />
                ) : newStamp ? (
                  <CheckCircle size={20} />
                ) : null}
                <p className={`text-lg font-semibold ${!card.isCompleted && !newStamp ? "text-slate-700" : ""}`}>
                  {message}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-slate-500">Tu tarjeta</span>
                <span className="text-sm font-bold text-indigo-600">
                  {card.stampsCount}/{card.stampsRequired}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-4">
                {[...Array(card.stampsRequired)].map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                      i < card.stampsCount
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-200"
                        : "bg-slate-100 text-slate-300 border-2 border-dashed border-slate-200"
                    } ${
                      i === card.stampsCount - 1 && newStamp
                        ? "ring-4 ring-indigo-200 animate-bounce"
                        : ""
                    }`}
                  >
                    {i < card.stampsCount ? (
                      <Star size={18} fill="currentColor" />
                    ) : (
                      <span className="text-sm font-bold">{i + 1}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(card.stampsCount / card.stampsRequired) * 100}%` }}
                />
              </div>

              <div className="text-center mt-4 p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Premio</p>
                <p className="font-semibold text-slate-900 flex items-center justify-center gap-1.5">
                  <Gift size={16} className="text-indigo-500" />
                  {card.rewardTitle}
                </p>
                {!card.isCompleted && (
                  <p className="text-xs text-slate-400 mt-1">
                    Te faltan {card.stampsRequired - card.stampsCount} visitas
                  </p>
                )}
              </div>
            </div>

            {card.isCompleted && card.rewardAvailable && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 text-center">
                <PartyPopper size={36} className="text-amber-500 mx-auto mb-2" />
                <p className="font-bold text-amber-800 text-lg mb-1">
                  ¡Recompensa desbloqueada!
                </p>
                <p className="text-amber-600 text-sm">
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
