#!/usr/bin/env bash
# Boots a local PostgreSQL 16 cluster (if not already running), creates the
# b2bmandi database, pushes the Prisma schema and seeds demo data.
# Safe to re-run.
set -euo pipefail

PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
PGDATA="${PGDATA:-/var/lib/postgresql/b2bdata}"
PGPORT="${PGPORT:-5432}"

if [ ! -d "$PGDATA/base" ]; then
  echo "› Initializing PostgreSQL cluster at $PGDATA"
  mkdir -p "$PGDATA"
  chown -R postgres:postgres "$PGDATA"
  su postgres -c "$PGBIN/initdb -D $PGDATA -U postgres --auth=trust"
fi

if ! "$PGBIN/pg_isready" -p "$PGPORT" >/dev/null 2>&1; then
  echo "› Starting PostgreSQL on port $PGPORT"
  su postgres -c "$PGBIN/pg_ctl -D $PGDATA -l /tmp/pg.log -o '-p $PGPORT' start"
  sleep 2
fi

echo "› Ensuring database 'b2bmandi' exists"
psql -U postgres -h localhost -p "$PGPORT" -tc \
  "SELECT 1 FROM pg_database WHERE datname='b2bmandi'" | grep -q 1 || \
  psql -U postgres -h localhost -p "$PGPORT" -c "CREATE DATABASE b2bmandi;"

echo "› Pushing Prisma schema + seeding"
npx prisma db push
npm run db:seed

echo "✅ Database ready at postgresql://postgres@localhost:$PGPORT/b2bmandi"
