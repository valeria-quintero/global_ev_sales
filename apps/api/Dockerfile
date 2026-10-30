# Contexto de build: raíz del monorepo (ver docker-compose.yml)
FROM node:24-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci -w api --include-workspace-root=false

COPY apps/api apps/api
WORKDIR /app/apps/api

# prisma.config.ts exige DATABASE_URL incluso para generate; el valor real llega en runtime
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate \
 && npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
