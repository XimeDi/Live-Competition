#!/bin/sh
set -e

echo "[entrypoint] Ejecutando migraciones de base de datos..."
npx prisma migrate deploy

echo "[entrypoint] Iniciando servidor..."
exec node dist/index.js
