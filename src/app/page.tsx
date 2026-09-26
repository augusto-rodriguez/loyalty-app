import Link from "next/link";
import { Check } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      {/* Nav */}
      <nav className="border-b" style={{ borderColor: "var(--line)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center gap-2">
          <span className="font-display text-xl sm:text-2xl italic shrink-0" style={{ color: "var(--wine)" }}>
            EcoFideliza
          </span>
          <div className="flex items-center gap-2 sm:gap-6">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium whitespace-nowrap px-2 sm:px-0"
              style={{ color: "var(--ink-muted)" }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-full text-white whitespace-nowrap"
              style={{ background: "var(--wine)" }}
            >
              Registrar mi negocio
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — asymmetric, stamp card as the visual */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-5 gap-12 items-center">
        <div className="md:col-span-3">
          <h1 className="font-display text-5xl md:text-6xl leading-[1.08]" style={{ color: "var(--wine)" }}>
            La tarjeta de sellos de tu negocio, ahora en el celular de tus clientes
          </h1>
          <p className="mt-6 text-lg max-w-md leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            Escanean un código, acumulan visitas, desbloquean premios. Sin
            aplicaciones que instalar, sin tarjetitas que se pierden en la billetera.
          </p>
          <div className="mt-9 flex items-center gap-5">
            <Link
              href="/register"
              className="px-7 py-3.5 text-base font-medium rounded-full text-white"
              style={{ background: "var(--wine)" }}
            >
              Crear mi programa
            </Link>
            <span className="text-sm" style={{ color: "var(--ink-muted)" }}>
              Listo en cinco minutos
            </span>
          </div>
        </div>

        {/* Stamp card visual — the hero image */}
        <div className="md:col-span-2">
          <div
            className="rounded-[28px] p-7 shadow-xl"
            style={{ background: "var(--paper)", boxShadow: "0 24px 60px -20px rgba(16,185,129,0.35)" }}
          >
            <p className="font-display italic text-lg" style={{ color: "var(--wine)" }}>
              Panadería Trigo Dorado
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
              6 de 8 sellos — te falta poco
            </p>
            <div className="grid grid-cols-4 gap-3 mt-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-full flex items-center justify-center"
                  style={
                    i < 6
                      ? { background: "var(--sand)" }
                      : { border: "2px dashed var(--line)" }
                  }
                >
                  {i < 6 && <Check size={16} color="white" strokeWidth={2.5} />}
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t flex items-center justify-between" style={{ borderColor: "var(--line)" }}>
              <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Premio</span>
              <span className="text-sm font-medium" style={{ color: "var(--wine)" }}>Pan del día gratis</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — numbered list */}
      <section className="border-t" style={{ borderColor: "var(--line)", background: "var(--paper)" }}>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="font-display text-3xl italic mb-10" style={{ color: "var(--wine)" }}>
            Cómo funciona
          </h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <span
                className="font-display text-xl shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "var(--cream)", color: "var(--wine)", border: "1.5px solid var(--sand)" }}
              >
                1
              </span>
              <p className="text-lg leading-relaxed pt-1.5" style={{ color: "var(--ink)" }}>
                Configuras tu programa: cuántas visitas se necesitan y qué premio
                desbloquean. Elige una plantilla por rubro o hazlo a tu manera.
              </p>
            </div>
            <div className="flex gap-6 items-start">
              <span
                className="font-display text-xl shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "var(--cream)", color: "var(--wine)", border: "1.5px solid var(--sand)" }}
              >
                2
              </span>
              <p className="text-lg leading-relaxed pt-1.5" style={{ color: "var(--ink)" }}>
                Imprimes el código QR y lo dejas en el mesón. Tus clientes lo
                escanean con la cámara — no necesitan descargar nada.
              </p>
            </div>
            <div className="flex gap-6 items-start">
              <span
                className="font-display text-xl shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "var(--cream)", color: "var(--wine)", border: "1.5px solid var(--sand)" }}
              >
                3
              </span>
              <p className="text-lg leading-relaxed pt-1.5" style={{ color: "var(--ink)" }}>
                Cada visita suma un sello. Al completar la tarjeta, el premio se
                desbloquea solo y tú lo validas desde tu panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: "var(--line)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
            © {new Date().getFullYear()} EcoFideliza
          </p>
          <div className="flex gap-6 text-sm" style={{ color: "var(--ink-muted)" }}>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/terminos">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
