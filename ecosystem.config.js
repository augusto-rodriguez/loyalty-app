module.exports = {
  apps: [
    {
      name: "fidelio",
      script: "npm",
      args: "start -- -p 3001",
      cwd: "/var/www/fidelio",
      env: {
        NODE_ENV: "production",
      },
      // Reiniciar si usa más de 512MB RAM
      max_memory_restart: "512M",
      // Reiniciar automático si crashea
      autorestart: true,
      // Esperar 3 segundos antes de considerar que arrancó bien
      min_uptime: "3s",
      // Máximo 10 reinicios antes de parar
      max_restarts: 10,
      // Logs
      error_file: "/var/log/fidelio/error.log",
      out_file: "/var/log/fidelio/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
