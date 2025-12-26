#!/bin/sh
set -e

PUID=${PUID:-1000}
PGID=${PGID:-1000}

echo "🔐 Using PUID=$PUID PGID=$PGID"

if ! getent group appgroup >/dev/null 2>&1; then
  addgroup appgroup || echo "GID $PGID already exists, using default"
fi


if ! id appuser >/dev/null 2>&1; then
  adduser -D -u "$PUID" -G appgroup appuser || echo "User exists"
fi

chown -R appuser:appgroup /requira /books /songs || true
npx prisma migrate deploy --config=/app/prisma.config.ts
exec su-exec appuser node server/dist/api.js
