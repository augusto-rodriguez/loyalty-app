"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

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
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/programs/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProgram(data.program);
        // Generar QR en el cliente
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

  async function handleRedeem(rewardId: string) {
    if (!confirm("¿Confirmar canje de recompensa?")) return;
    const res = await fetch(`/api/rewards/${rewardId}/redeem`, { method: "POST" });
    if (res.ok) {
      // Reload data
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

  if (loading || !program) {
    return <div className="animate-pulse text-slate-400">Cargando...</div>;
  }

  return (
    <div>
      <Link
        href="/dashboard/programs"
        className="text-sm text-slate-400 hover:text-slate-600 mb-4 inline-block"
      >
        ← Volver a programas
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Info + QR */}
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
                <span className="text-slate-500">Estado</span>
                <span
                  className={`font-semibold ${
                    program.isActive ? "text-green-600" : "text-slate-400"
                  }`}
                >
                  {program.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clientes</span>
                <span className="font-semibold">
                  {program.customerCards.length}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <h3 className="font-semibold text-slate-900 mb-3">Código QR</h3>
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="mx-auto mb-3 rounded-lg"
                width={200}
                height={200}
              />
            )}
            <p className="text-xs text-slate-400 mb-3">
              Imprime este QR y ponlo en tu local
            </p>
            <div className="space-y-2">
              <button
                onClick={copyScanUrl}
                className="w-full py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                {copied ? "✓ Copiado!" : "📋 Copiar link"}
              </button>
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`qr-${program.qrCode}.png`}
                  className="block w-full py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
                >
                  ⬇️ Descargar QR
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Clientes ({program.customerCards.length})
          </h2>

          {program.customerCards.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-slate-400">
                Aún no hay clientes. ¡Comparte tu QR para empezar!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {program.customerCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {card.customer.name || "Cliente"}
                      </p>
                      <p className="text-sm text-slate-400">
                        {card.customer.phone || card.customer.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {card.stampsCount}/{program.stampsRequired}
                      </p>
                      <p className="text-xs text-slate-400">sellos</p>
                    </div>
                  </div>

                  {/* Stamps progress */}
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

                  {/* Reward status */}
                  {card.isCompleted && card.reward && (
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        card.reward.isRedeemed
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {card.reward.isRedeemed ? (
                        <span>✅ Recompensa canjeada</span>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span>🎁 Recompensa lista: {program.rewardTitle}</span>
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
