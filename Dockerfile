
# Base image
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Builder stage
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
RUN pnpm deploy --filter=. --prod --legacy /app/deploy

# Production stage
FROM base AS final
WORKDIR /app
COPY --from=builder /app/deploy/package.json ./
COPY --from=builder /app/deploy/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Install curl for healthcheck
RUN apk --no-cache add curl

ENV NODE_ENV=production
ENV PORT=8300
EXPOSE 8300 8301

CMD ["node", "dist/src/main"]
