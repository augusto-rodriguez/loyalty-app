# 🎯 Fidelio - Programa de Fidelización con QR

Sistema de tarjeta de sellos digital para pymes. Tu cliente escanea un QR, acumula visitas y gana premios. Sin apps, sin complicaciones.

## 🚀 Setup rápido

### Requisitos
- Node.js 18+ (recomendado 20+)
- npm

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Generar el cliente de Prisma
npx prisma generate

# 3. Crear la base de datos (SQLite local)
npx prisma db push

# 4. (Opcional) Cargar datos de prueba
npx tsx prisma/seed.ts

# 5. Iniciar el servidor de desarrollo
npm run dev
```

Abre http://localhost:3000 en tu navegador.

### Datos de prueba (si corriste el seed)
- **Email:** demo@fidelio.cl
- **Password:** demo1234
- **URL de escaneo:** http://localhost:3000/s/DEMO12CAFE

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── api/                    # Backend (API Routes)
│   │   ├── auth/               # Registro, Login, Logout, Sesión
│   │   ├── programs/           # CRUD de programas de fidelización
│   │   ├── scan/[qrCode]/      # Endpoint del cliente (escaneo QR)
│   │   ├── rewards/[id]/redeem/ # Validación de recompensas
│   │   └── dashboard/          # Estadísticas
│   ├── dashboard/              # Panel del negocio
│   │   ├── programs/           # Lista, crear, detalle de programas
│   │   └── page.tsx            # Inicio con estadísticas
│   ├── login/                  # Login del negocio
│   ├── register/               # Registro del negocio
│   ├── s/[qrCode]/             # Página del CLIENTE (escaneo QR)
│   └── page.tsx                # Landing page
├── lib/
│   ├── prisma.ts               # Cliente de BD
│   ├── auth.ts                 # JWT + bcrypt
│   └── utils.ts                # Helpers
└── middleware.ts                # Protección de rutas
```

## 🔄 Flujo completo

### Para el dueño del negocio:
1. Se registra en /register
2. Crea un programa de fidelización (puede usar plantillas)
3. Se genera un QR único
4. Imprime el QR y lo pone en su local
5. Ve clientes, sellos y canjea premios desde el dashboard

### Para el cliente:
1. Escanea el QR con la cámara del celular
2. Se abre la web (no necesita app)
3. Ingresa su teléfono la primera vez
4. Se registra la visita automáticamente
5. Ve su progreso (sellos acumulados)
6. Cuando completa los sellos, desbloquea el premio
7. Muestra la pantalla al personal para canjear

## 🛠 Stack técnico

- **Framework:** Next.js 15 (App Router)
- **Base de datos:** SQLite (Prisma ORM) - migrable a PostgreSQL
- **Auth:** JWT en cookies httpOnly
- **Estilos:** Tailwind CSS
- **QR:** librería qrcode (generación client-side)

## 📝 Variables de entorno

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="cambiar-por-un-secreto-real-en-produccion"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## 💡 Tips

- Para producción, cambia SQLite por PostgreSQL en prisma/schema.prisma
- Genera un JWT_SECRET seguro: openssl rand -base64 32
- El QR se genera en el navegador del dueño, no en el servidor
- El cooldown entre escaneos es de 1 hora (configurable en api/scan/[qrCode]/route.ts)
