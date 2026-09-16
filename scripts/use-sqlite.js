const fs = require('fs');
const schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');
const updated = schema.replace('provider = "postgresql"', 'provider = "sqlite"');
fs.writeFileSync('prisma/schema.prisma', updated);
console.log('Schema cambiado a SQLite para desarrollo local');
console.log('Ahora ejecuta: npx prisma db push');
