import Link from "next/link";

export default function TerminosPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <nav style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/" className="font-display text-xl italic" style={{ color: "var(--wine)" }}>EcoFideliza</Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl italic mb-8" style={{ color: "var(--wine)" }}>Términos de Servicio</h1>
        <div className="rounded-2xl p-8 space-y-6 leading-relaxed" style={{ background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink)" }}>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--wine)" }}>1. Descripción del servicio</h2>
            <p style={{ color: "var(--ink-muted)" }}>EcoFideliza es una plataforma de fidelización digital que permite a negocios crear programas de tarjeta de sellos mediante códigos QR.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--wine)" }}>2. Uso aceptable</h2>
            <p style={{ color: "var(--ink-muted)" }}>El servicio debe usarse únicamente para programas de fidelización legítimos. Queda prohibido el uso fraudulento.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--wine)" }}>3. Responsabilidades del negocio</h2>
            <p style={{ color: "var(--ink-muted)" }}>Cada negocio es responsable de cumplir las recompensas ofrecidas a sus clientes.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--wine)" }}>4. Disponibilidad</h2>
            <p style={{ color: "var(--ink-muted)" }}>Nos esforzamos por mantener el servicio disponible, pero no garantizamos un uptime del 100%.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--wine)" }}>5. Cancelación</h2>
            <p style={{ color: "var(--ink-muted)" }}>Puedes cancelar tu cuenta en cualquier momento. Tus datos serán eliminados dentro de los 30 días siguientes.</p>
          </section>
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Última actualización: Septiembre 2026</p>
        </div>
      </main>
    </div>
  );
}
