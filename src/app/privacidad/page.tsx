import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <nav style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/" className="font-display text-xl italic" style={{ color: "var(--wine)" }}>EcoFideliza</Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl italic mb-8" style={{ color: "var(--wine)" }}>Política de Privacidad</h1>
        <div className="rounded-2xl p-8 space-y-6 leading-relaxed" style={{ background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink)" }}>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--wine)" }}>1. Datos que recopilamos</h2>
            <p style={{ color: "var(--ink-muted)" }}>Para los negocios: nombre del negocio, email y teléfono de contacto. Para los clientes finales: número de teléfono o email, nombre opcional, y registro de visitas al negocio.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--wine)" }}>2. Uso de los datos</h2>
            <p style={{ color: "var(--ink-muted)" }}>Usamos los datos exclusivamente para operar el programa de fidelización. No vendemos ni compartimos datos con terceros.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--wine)" }}>3. Almacenamiento y seguridad</h2>
            <p style={{ color: "var(--ink-muted)" }}>Los datos se almacenan con conexiones cifradas (HTTPS/TLS). Las contraseñas se almacenan hasheadas y nunca en texto plano.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--wine)" }}>4. Derechos del usuario</h2>
            <p style={{ color: "var(--ink-muted)" }}>Puedes solicitar la eliminación de tus datos en cualquier momento. Los negocios pueden eliminar su cuenta desde su panel.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--wine)" }}>5. Contacto</h2>
            <p style={{ color: "var(--ink-muted)" }}>Para consultas sobre privacidad: <span style={{ color: "var(--rose)" }}>privacidad@ecofideliza.cl</span></p>
          </section>
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Última actualización: Septiembre 2026</p>
        </div>
      </main>
    </div>
  );
}
