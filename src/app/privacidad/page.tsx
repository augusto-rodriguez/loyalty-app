import Link from "next/link";
import { Target } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <Target size={24} />
            Fidelio
          </Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Política de Privacidad
        </h1>
        <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              1. Datos que recopilamos
            </h2>
            <p>
              Para los negocios: nombre del negocio, email y teléfono de contacto.
              Para los clientes finales: número de teléfono o email (según elijan),
              nombre opcional, y registro de visitas al negocio.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              2. Uso de los datos
            </h2>
            <p>
              Usamos los datos exclusivamente para operar el programa de fidelización:
              identificar clientes, registrar visitas, gestionar recompensas y
              mostrar estadísticas al negocio. No vendemos ni compartimos datos
              con terceros.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              3. Almacenamiento y seguridad
            </h2>
            <p>
              Los datos se almacenan en servidores seguros con conexiones cifradas
              (HTTPS/TLS). Las contraseñas se almacenan hasheadas y nunca en texto
              plano. Implementamos medidas de protección contra acceso no
              autorizado.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              4. Derechos del usuario
            </h2>
            <p>
              Puedes solicitar la eliminación de tus datos en cualquier momento
              contactándonos por email. Los negocios pueden eliminar su cuenta y
              todos los datos asociados desde su panel de control.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              5. Contacto
            </h2>
            <p>
              Para consultas sobre privacidad, escríbenos a:{" "}
              <span className="text-indigo-600">privacidad@fidelio.cl</span>
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
