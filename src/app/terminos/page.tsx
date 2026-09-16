import Link from "next/link";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            🎯 Fidelio
          </Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Términos de Servicio
        </h1>
        <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              1. Descripción del servicio
            </h2>
            <p>
              Fidelio es una plataforma de fidelización digital que permite a
              negocios crear programas de tarjeta de sellos mediante códigos QR
              para sus clientes.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              2. Uso aceptable
            </h2>
            <p>
              El servicio debe usarse únicamente para programas de fidelización
              legítimos. Queda prohibido el uso fraudulento, la manipulación de
              sellos o visitas, y cualquier actividad que viole la legislación
              vigente.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              3. Responsabilidades del negocio
            </h2>
            <p>
              Cada negocio es responsable de cumplir las recompensas ofrecidas a
              sus clientes. Fidelio actúa como plataforma tecnológica y no es
              responsable del cumplimiento de las promociones.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              4. Disponibilidad
            </h2>
            <p>
              Nos esforzamos por mantener el servicio disponible, pero no
              garantizamos un uptime del 100%. Realizamos mantenimientos
              programados con aviso previo cuando es posible.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              5. Cancelación
            </h2>
            <p>
              Puedes cancelar tu cuenta en cualquier momento. Al cancelar, tus
              datos serán eliminados dentro de los 30 días siguientes.
            </p>
          </section>
          <p className="text-sm text-slate-400">
            Última actualización: Septiembre 2026
          </p>
        </div>
      </main>
    </div>
  );
}
