"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    border: "1px solid var(--line)",
    ["--tw-ring-color" as string]: "var(--rose)",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl italic" style={{ color: "var(--wine)" }}>
            EcoFideliza
          </Link>
          <p className="mt-2" style={{ color: "var(--ink-muted)" }}>Registra tu negocio en dos minutos</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 space-y-5"
          style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
        >
          {error && (
            <div className="text-sm rounded-lg p-3" style={{ background: "#FBE9EC", color: "var(--wine-dark)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Nombre del negocio</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ej: Panadería Trigo Dorado"
              className="w-full px-4 py-2.5 rounded-lg outline-none focus:ring-2"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg outline-none focus:ring-2"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Teléfono (opcional)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              minLength={6}
              className="w-full px-4 py-2.5 rounded-lg outline-none focus:ring-2"
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold rounded-lg text-white disabled:opacity-50"
            style={{ background: "var(--wine)" }}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
          </button>

          <p className="text-center text-sm" style={{ color: "var(--ink-muted)" }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--rose)" }}>
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
