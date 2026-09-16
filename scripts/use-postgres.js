const fs = require('fs');
const schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');
const updated = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
fs.writeFileSync('prisma/schema.prisma', updated);
console.log('Schema cambiado a PostgreSQL para produccion');
console.log('Ahora ejecuta: npx prisma db push');
