FROM oven/bun:1.3.11-alpine AS builder
RUN apk add --no-cache nodejs
WORKDIR /app
COPY . .
RUN bun install

# Build workspace packages then demo
RUN bun run --filter='@siteping/core' build && \
    bun run --filter='@siteping/widget' build && \
    bun run --filter='@siteping/adapter-memory' build && \
    bun run --filter='@siteping/adapter-prisma' build
RUN cd apps/demo && bunx prisma generate
RUN cd apps/demo && bun run build

# --- Runner ---
FROM oven/bun:1.3.11-alpine AS runner
RUN apk add --no-cache nodejs openssl
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Copy built app + workspace packages + full node_modules (bun uses .bun/ hashing)
COPY --from=builder /app/apps/demo /app/apps/demo
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/bun.lock /app/bun.lock

CMD ["sh", "-c", "cd /app/apps/demo && npx prisma@7.8.0 db push --accept-data-loss --schema=prisma/schema.prisma && node_modules/.bin/next start -H $HOSTNAME"]
