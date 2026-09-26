"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl italic" style={{ color: "var(--wine)" }}>
            EcoFideliza
          </Link>
          <p className="mt-2" style={{ color: "var(--ink-muted)" }}>Inicia sesión en tu panel</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 space-y-5"
          style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
        >
          {error && (
            <div className="text-sm rounded-lg p-3" style={{ background: "#FEE2E2", color: "#B91C1C" }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg outline-none focus:ring-2"
              style={{ border: "1px solid var(--line)", ["--tw-ring-color" as string]: "var(--rose)" }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg outline-none focus:ring-2"
              style={{ border: "1px solid var(--line)", ["--tw-ring-color" as string]: "var(--rose)" }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold rounded-lg text-white disabled:opacity-50"
            style={{ background: "var(--wine)" }}
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>

          <p className="text-center text-sm" style={{ color: "var(--ink-muted)" }}>
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium" style={{ color: "var(--rose)" }}>
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
