import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Crear negocio demo
  const password = await bcrypt.hash("demo1234", 12);

  const business = await prisma.business.upsert({
    where: { email: "demo@fidelio.cl" },
    update: {},
    create: {
      name: "Café Don Pedro",
      slug: "cafe-don-pedro",
      email: "demo@fidelio.cl",
      password,
      phone: "+56912345678",
    },
  });

  console.log(`✅ Negocio creado: ${business.name} (${business.email})`);

  // Crear programa de fidelización
  const program = await prisma.loyaltyProgram.upsert({
    where: { qrCode: "DEMO12CAFE" },
    update: {},
    create: {
      businessId: business.id,
      name: "Café de fidelidad",
      description: "Acumula 8 cafés y el siguiente es gratis",
      stampsRequired: 8,
      rewardTitle: "Café gratis",
      rewardDescription: "Un café del tamaño que quieras, totalmente gratis",
      qrCode: "DEMO12CAFE",
    },
  });

  console.log(`✅ Programa creado: ${program.name} (QR: ${program.qrCode})`);

  // Crear algunos clientes de prueba
  const customers = [
    { phone: "+56911111111", name: "María González" },
    { phone: "+56922222222", name: "Pedro Soto" },
    { phone: "+56933333333", name: "Ana Torres" },
  ];

  for (const c of customers) {
    const customer = await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {},
      create: c,
    });

    // Crear tarjeta con sellos aleatorios
    const stamps = Math.floor(Math.random() * program.stampsRequired);
    const isCompleted = stamps >= program.stampsRequired;

    const card = await prisma.customerCard.upsert({
      where: {
        customerId_loyaltyProgramId: {
          customerId: customer.id,
          loyaltyProgramId: program.id,
        },
      },
      update: { stampsCount: stamps },
      create: {
        customerId: customer.id,
        loyaltyProgramId: program.id,
        stampsCount: stamps,
        isCompleted,
      },
    });

    // Crear visitas
    for (let i = 0; i < stamps; i++) {
      await prisma.visit.create({
        data: {
          customerCardId: card.id,
          createdAt: new Date(
            Date.now() - (stamps - i) * 24 * 60 * 60 * 1000
          ),
        },
      });
    }

    console.log(`  👤 ${c.name}: ${stamps}/${program.stampsRequired} sellos`);
  }

  console.log("\n🎉 Seed completado!");
  console.log("\n📌 Credenciales demo:");
  console.log("   Email: demo@fidelio.cl");
  console.log("   Password: demo1234");
  console.log(`\n📱 URL de escaneo: http://localhost:3000/s/${program.qrCode}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
