#!/bin/bash
# ============================================================
# GUÍA DE DEPLOY - Fidelio en DigitalOcean VPS
# Ejecuta estos comandos uno por uno via SSH
# ============================================================

# ============ PASO 1: CONECTAR AL VPS ============
# Desde tu PC:
# ssh root@TU_IP_DEL_VPS
# (o el usuario que uses)

# ============ PASO 2: INSTALAR NODE.JS (si no lo tienes) ============
# Verificar si ya está instalado:
node --version
# Si no está o es menor a v18:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
# Verificar:
node --version   # debería ser v20.x
npm --version

# ============ PASO 3: INSTALAR PM2 (mantiene tu app corriendo) ============
sudo npm install -g pm2

# ============ PASO 4: INSTALAR POSTGRESQL (si no lo tienes) ============
# Verificar si ya está:
psql --version
# Si no está:
sudo apt update
sudo apt install -y postgresql postgresql-contrib
# Iniciar servicio:
sudo systemctl start postgresql
sudo systemctl enable postgresql

# ============ PASO 5: CREAR BASE DE DATOS ============
sudo -u postgres psql << SQL
CREATE DATABASE fidelio;
CREATE USER fidelio_user WITH ENCRYPTED PASSWORD 'CAMBIA_ESTA_PASSWORD_123';
GRANT ALL PRIVILEGES ON DATABASE fidelio TO fidelio_user;
ALTER DATABASE fidelio OWNER TO fidelio_user;
\c fidelio
GRANT ALL ON SCHEMA public TO fidelio_user;
SQL

# ============ PASO 6: SUBIR EL PROYECTO ============
# Opción A: Git (recomendado)
# Sube tu proyecto a GitHub/GitLab y luego:
cd /var/www
git clone https://github.com/TU_USUARIO/loyalty-app.git fidelio
cd fidelio

# Opción B: SCP directo desde tu PC (sin git)
# Desde tu PC (no en el VPS):
# scp -r loyalty-app/ root@TU_IP:/var/www/fidelio

# ============ PASO 7: CONFIGURAR VARIABLES DE ENTORNO ============
cd /var/www/fidelio
cat > .env << 'ENV'
DATABASE_URL="postgresql://fidelio_user:CAMBIA_ESTA_PASSWORD_123@localhost:5432/fidelio"
JWT_SECRET=""
NEXT_PUBLIC_BASE_URL="https://TU_DOMINIO.com"
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
ENV

# Generar JWT_SECRET seguro:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copia el resultado y pégalo en JWT_SECRET del .env

# ============ PASO 8: INSTALAR Y CONSTRUIR ============
npm install
node scripts/use-postgres.js
npx prisma generate
npx prisma db push
npm run build

# ============ PASO 9: ARRANCAR CON PM2 ============
pm2 start npm --name "fidelio" -- start -- -p 3001
pm2 save
pm2 startup
# (ejecuta el comando que te muestre pm2 startup)

# Verificar que está corriendo:
pm2 status
# Para ver logs:
pm2 logs fidelio

# ============ PASO 10: CONFIGURAR NGINX ============
# Crear archivo de configuración:
sudo nano /etc/nginx/sites-available/fidelio
# (pegar el contenido del archivo nginx.conf que se genera aparte)

# Activar:
sudo ln -s /etc/nginx/sites-available/fidelio /etc/nginx/sites-enabled/
sudo nginx -t          # verificar que no hay errores
sudo systemctl reload nginx

# ============ PASO 11: SSL CON LET'S ENCRYPT ============
# Si no tienes certbot:
sudo apt install -y certbot python3-certbot-nginx

# Generar certificado:
sudo certbot --nginx -d TU_DOMINIO.com -d www.TU_DOMINIO.com
# Sigue las instrucciones (email, aceptar términos)
# Certbot modifica nginx automáticamente para HTTPS

# Verificar renovación automática:
sudo certbot renew --dry-run

# ============ LISTO ============
# Tu app debería estar en: https://TU_DOMINIO.com
# Panel del negocio: https://TU_DOMINIO.com/dashboard
# Escaneo QR: https://TU_DOMINIO.com/s/CODIGO_QR

echo "Deploy completado!"
