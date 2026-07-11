FROM node:20-alpine AS builder
RUN npm install -g pnpm

WORKDIR /app
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY tsconfig.base.json ./

# Copy workspace packages
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server

RUN pnpm install --frozen-lockfile
RUN cd packages/server && pnpm build

FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app

# Copy only production artifacts
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/shared ./packages/shared

RUN pnpm install --frozen-lockfile --prod

EXPOSE 3000 50051
CMD ["node", "packages/server/dist/main"]
