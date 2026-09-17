"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Scissors, UtensilsCrossed, Dumbbell, Clock, Gift, Eye } from "lucide-react";

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

export default function NewProgramPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    stampsRequired: 10,
    cooldownMinutes: 60,
    rewardTitle: "",
    rewardDescription: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string | number) {
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
    {
      label: "Cafetería",
      icon: <Coffee size={18} className="text-amber-600" />,
      name: "Café de fidelidad",
      stamps: 8,
      cooldown: 60,
      reward: "Café gratis",
      desc: "Acumula 8 cafés y el siguiente es gratis",
    },
    {
      label: "Barbería / Peluquería",
      icon: <Scissors size={18} className="text-slate-600" />,
      name: "Cortes frecuentes",
      stamps: 5,
      cooldown: 1440,
      reward: "Corte gratis",
      desc: "Cada 5 cortes, el siguiente va por la casa",
    },
    {
      label: "Restaurante",
      icon: <UtensilsCrossed size={18} className="text-red-600" />,
      name: "Cliente frecuente",
      stamps: 10,
      cooldown: 240,
      reward: "Plato gratis",
      desc: "10 visitas y disfruta un plato por cuenta nuestra",
    },
    {
      label: "Gym / Estudio",
      icon: <Dumbbell size={18} className="text-indigo-600" />,
      name: "Entrenamiento fiel",
      stamps: 12,
      cooldown: 720,
      reward: "Mes con 50% dcto",
      desc: "12 sesiones y obtén descuento en tu siguiente mes",
    },
  ];

  function applyTemplate(t: (typeof templates)[0]) {
    setForm({
      name: t.name,
      description: t.desc,
      stampsRequired: t.stamps,
      cooldownMinutes: t.cooldown,
      rewardTitle: t.reward,
      rewardDescription: t.desc,
    });
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Nuevo programa</h1>
      <p className="text-slate-500 mb-6">
        Configura tu tarjeta de sellos. O usa una plantilla para empezar rápido:
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {templates.map((t) => (
          <button
            key={t.label}
            onClick={() => applyTemplate(t)}
            className="text-left bg-white border border-slate-200 rounded-lg p-4 hover:border-indigo-300 transition"
          >
            <div className="flex items-center gap-2 mb-1">
              {t.icon}
              <span className="text-sm font-medium">{t.label}</span>
            </div>
            <p className="text-xs text-slate-400">
              {t.stamps} sellos → {t.reward}
            </p>
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 p-8 space-y-5"
      >
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre del programa
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ej: Café de fidelidad"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Descripción (opcional)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Sellos necesarios para el premio
          </label>
          <input
            type="number"
            min={2}
            max={50}
            value={form.stampsRequired}
            onChange={(e) => update("stampsRequired", parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
            <Clock size={15} />
            Tiempo entre sellos (cooldown)
          </label>
          <select
            value={form.cooldownMinutes}
            onChange={(e) => update("cooldownMinutes", parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            {cooldownOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Tiempo mínimo que debe pasar entre cada sello del mismo cliente.
          </p>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
            <Gift size={15} />
            Recompensa
          </label>
          <input
            type="text"
            value={form.rewardTitle}
            onChange={(e) => update("rewardTitle", e.target.value)}
            placeholder="Ej: Café gratis, 20% descuento, Corte gratis"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Descripción de la recompensa (opcional)
          </label>
          <textarea
            value={form.rewardDescription}
            onChange={(e) => update("rewardDescription", e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
          />
        </div>

        {/* Preview */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Eye size={14} className="text-slate-400" />
            <p className="text-xs text-slate-400 uppercase tracking-wide">Vista previa</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[...Array(form.stampsRequired || 5)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs ${
                  i < 3
                    ? "bg-indigo-100 border-indigo-400 text-indigo-600"
                    : "border-slate-300 text-slate-300"
                }`}
              >
                {i < 3 ? "✓" : i + 1}
              </div>
            ))}
            <span className="text-sm text-slate-400 ml-2">
              → {form.rewardTitle || "Premio"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Clock size={12} />
            Cooldown:{" "}
            {cooldownOptions.find((o) => o.value === form.cooldownMinutes)?.label ||
              `${form.cooldownMinutes} min`}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear programa y generar QR"}
        </button>
      </form>
    </div>
  );
}
