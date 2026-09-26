"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Scissors, UtensilsCrossed, Dumbbell, Clock, Gift, Eye, ShieldCheck, HelpCircle, X } from "lucide-react";

const cooldownOptions = [
  { value: 0, label: "Sin cooldown (testing)" },
  { value: 15, label: "15 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 60, label: "1 hora" },
  { value: 120, label: "2 horas" },
  { value: 240, label: "4 horas" },
  { value: 480, label: "8 horas" },
  { value: 720, label: "12 horas" },
  { value: 1440, label: "24 horas" },
  { value: 10080, label: "1 semana" },
  { value: 20160, label: "2 semanas" },
  { value: 30240, label: "3 semanas" },
  { value: 43200, label: "1 mes" },
];

const inputStyle = { border: "1px solid var(--line)", ["--tw-ring-color" as string]: "var(--rose)" };

export default function NewProgramPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", description: "", stampsRequired: 10, cooldownMinutes: 60,
    requiresPin: false, rewardTitle: "", rewardDescription: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPinHelp, setShowPinHelp] = useState(false);

  function update(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/dashboard/programs/${data.program.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setLoading(false);
    }
  }

  const templates = [
    { label: "Cafetería", icon: <Coffee size={18} />, name: "Café de fidelidad", stamps: 8, cooldown: 60, reward: "Café gratis", desc: "Acumula 8 cafés y el siguiente es gratis" },
    { label: "Barbería / Peluquería", icon: <Scissors size={18} />, name: "Cortes frecuentes", stamps: 5, cooldown: 1440, reward: "Corte gratis", desc: "Cada 5 cortes, el siguiente va por la casa" },
    { label: "Restaurante", icon: <UtensilsCrossed size={18} />, name: "Cliente frecuente", stamps: 10, cooldown: 240, reward: "Plato gratis", desc: "10 visitas y disfruta un plato por cuenta nuestra" },
    { label: "Gym / Estudio", icon: <Dumbbell size={18} />, name: "Entrenamiento fiel", stamps: 12, cooldown: 720, reward: "Mes con 50% dcto", desc: "12 sesiones y obtén descuento en tu siguiente mes" },
  ];

  function applyTemplate(t: (typeof templates)[0]) {
    setForm({ name: t.name, description: t.desc, stampsRequired: t.stamps, cooldownMinutes: t.cooldown, requiresPin: false, rewardTitle: t.reward, rewardDescription: t.desc });
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl italic mb-2" style={{ color: "var(--wine)" }}>Nuevo programa</h1>
      <p className="mb-6" style={{ color: "var(--ink-muted)" }}>Configura tu tarjeta de sellos. O usa una plantilla para empezar rápido:</p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {templates.map((t) => (
          <button
            key={t.label}
            onClick={() => applyTemplate(t)}
            className="text-left rounded-lg p-4 transition"
            style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
          >
            <div className="flex items-center gap-2 mb-1" style={{ color: "var(--rose)" }}>
              {t.icon}
              <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>{t.label}</span>
            </div>
            <p className="text-xs" style={{ color: "var(--ink-muted)" }}>{t.stamps} sellos → {t.reward}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-8 space-y-5" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
        {error && <div className="text-sm rounded-lg p-3" style={{ background: "#FEE2E2", color: "#B91C1C" }}>{error}</div>}

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Nombre del programa</label>
          <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ej: Café de fidelidad"
            className="w-full px-4 py-2.5 rounded-lg outline-none focus:ring-2" style={inputStyle} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Descripción (opcional)</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2}
            className="w-full px-4 py-2.5 rounded-lg outline-none focus:ring-2 resize-none" style={inputStyle} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Sellos necesarios para el premio</label>
          <input type="number" min={2} max={50} value={form.stampsRequired} onChange={(e) => update("stampsRequired", parseInt(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg outline-none focus:ring-2" style={inputStyle} required />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
            <Clock size={15} /> Tiempo entre sellos (cooldown)
          </label>
          <select value={form.cooldownMinutes} onChange={(e) => update("cooldownMinutes", parseInt(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg outline-none focus:ring-2" style={{ ...inputStyle, background: "var(--paper)" }}>
            {cooldownOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <p className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>Tiempo mínimo entre cada sello del mismo cliente.</p>
        </div>

        {/* PIN toggle */}
        <div className="rounded-lg p-4" style={{ background: "#D1FAE5" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} style={{ color: "var(--wine)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>Verificación por PIN</span>
              <button type="button" onClick={() => setShowPinHelp(!showPinHelp)} style={{ color: "var(--ink-muted)" }}>
                <HelpCircle size={16} />
              </button>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.requiresPin} onChange={(e) => update("requiresPin", e.target.checked)} className="sr-only peer" />
              <div
                className="w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
                style={{ background: form.requiresPin ? "var(--wine)" : "var(--line)" }}
              />
            </label>
          </div>

          {showPinHelp && (
            <div className="mt-3 rounded-lg p-4 relative" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
              <button type="button" onClick={() => setShowPinHelp(false)} className="absolute top-2 right-2" style={{ color: "var(--ink-muted)" }}>
                <X size={16} />
              </button>
              <p className="text-sm font-medium mb-2" style={{ color: "var(--ink)" }}>¿Qué es la verificación por PIN?</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                El cliente necesita ingresar un código de 4 dígitos para registrar su visita.
                Lo tiene el personal del local y <strong>cambia automáticamente cada 10 minutos</strong>.
              </p>
              <p className="text-sm leading-relaxed mt-2" style={{ color: "var(--ink-muted)" }}>
                Esto evita que alguien comparta el código en un grupo de WhatsApp y lo use todo el día.
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
            <Gift size={15} /> Recompensa
          </label>
          <input type="text" value={form.rewardTitle} onChange={(e) => update("rewardTitle", e.target.value)} placeholder="Ej: Café gratis, 20% descuento"
            className="w-full px-4 py-2.5 rounded-lg outline-none focus:ring-2" style={inputStyle} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Descripción de la recompensa (opcional)</label>
          <textarea value={form.rewardDescription} onChange={(e) => update("rewardDescription", e.target.value)} rows={2}
            className="w-full px-4 py-2.5 rounded-lg outline-none focus:ring-2 resize-none" style={inputStyle} />
        </div>

        <div className="rounded-lg p-4" style={{ background: "var(--cream)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Eye size={14} style={{ color: "var(--ink-muted)" }} />
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>Vista previa</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[...Array(form.stampsRequired || 5)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                style={i < 3 ? { background: "var(--sand)", color: "var(--wine-dark)" } : { border: "2px dashed var(--line)", color: "var(--ink-muted)" }}>
                {i < 3 ? "✓" : i + 1}
              </div>
            ))}
            <span className="text-sm ml-2" style={{ color: "var(--ink-muted)" }}>→ {form.rewardTitle || "Premio"}</span>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 font-semibold rounded-lg text-white disabled:opacity-50" style={{ background: "var(--wine)" }}>
          {loading ? "Creando..." : "Crear programa y generar QR"}
        </button>
      </form>
    </div>
  );
}
