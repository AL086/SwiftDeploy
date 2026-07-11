# PostgreSQL Migration Guide

## Overview

By default, SwiftDeploy uses SQLite (via `sql.js`) for development. For production deployments, PostgreSQL is recommended for better concurrency, performance, and reliability.

## Switching from SQLite to PostgreSQL

### Step 1: Start PostgreSQL

Using Docker Compose:

```bash
docker-compose up -d postgres
```

### Step 2: Update Environment Variables

Edit `.env`:

```env
# Comment out SQLite
# DATABASE_URL=sqlite:///data/swiftdeploy.db

# Uncomment PostgreSQL
DATABASE_URL=postgresql://swiftdeploy:swiftdeploy@localhost:5432/swiftdeploy
```

Or for Docker deployment:

```env
DATABASE_URL=postgresql://swiftdeploy:swiftdeploy@postgres:5432/swiftdeploy
```

### Step 3: Restart Server

```bash
pnpm --filter @swiftdeploy/server run dev
```

TypeORM will automatically synchronize the schema (`synchronize: true` in development).

### Step 4: Verify Connection

```bash
curl http://localhost:3000/api/system/health
# Expected: {"success":true,"data":{"status":"ok","version":"0.1.0","database":"connected"}}
```

## Production Considerations

### Disable Auto-Sync

In production, disable `synchronize` and use migrations instead:

```typescript
// packages/server/src/database/database.module.ts
TypeOrmModule.forRoot({
  type: 'postgres',
  url: config.databaseUrl,
  autoLoadEntities: true,
  synchronize: false,  // ← Set to false in production
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
  logging: config.logLevel === 'debug',
})
```

### Generate Migration

```bash
cd packages/server
npx typeorm-ts-node-commonjs migration:generate src/migrations/InitialSchema -d src/database/datasource.ts
```

### Run Migration

```bash
npx typeorm migration:run -d src/database/datasource.ts
```

## Docker Compose Production Setup

The production `docker-compose.yml` already includes PostgreSQL and pgAdmin:

```bash
# Start full stack
docker-compose up -d

# Access pgAdmin at http://localhost:5050
# Email: admin@swiftdeploy.com
# Password: admin
```

## Backup & Restore

### Backup

```bash
docker exec -t swiftdeploy-postgres-1 pg_dump -U swiftdeploy swiftdeploy > backup.sql
```

### Restore

```bash
cat backup.sql | docker exec -i swiftdeploy-postgres-1 psql -U swiftdeploy swiftdeploy
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Ensure PostgreSQL container is running: `docker ps` |
| Authentication failed | Check POSTGRES_USER/POSTGRES_PASSWORD in .env |
| Schema out of sync | Run `synchronize: true` once, then disable |
| Port conflict | Change POSTGRES_PORT in docker-compose.yml |
