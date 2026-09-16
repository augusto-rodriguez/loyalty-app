import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">🎯 Fidelio</h1>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Registrar mi negocio
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Fideliza a tus clientes
            <br />
            <span className="text-indigo-600">sin complicaciones</span>
          </h2>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
            Tarjeta de sellos digital con código QR. Tu cliente escanea, acumula
            visitas y gana premios. Sin apps, sin complicaciones. Listo en 5 minutos.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 text-lg font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          >
            Empezar gratis →
          </Link>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 text-left">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-lg mb-2">Sin app para el cliente</h3>
              <p className="text-slate-500">
                Tu cliente escanea el QR con su cámara y listo. No necesita descargar nada.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-lg mb-2">Listo en 5 minutos</h3>
              <p className="text-slate-500">
                Crea tu cuenta, configura tu programa y genera tu QR. Así de simple.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="font-semibold text-lg mb-2">Premios automáticos</h3>
              <p className="text-slate-500">
                Cuando tu cliente completa los sellos, desbloquea su premio automáticamente.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Fidelio. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/privacidad" className="hover:text-slate-600">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-slate-600">
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
