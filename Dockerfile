# Base image
FROM node:24-alpine AS base
RUN npm install -g pnpm@10

# Builder stage
FROM base AS builder
WORKDIR /app

# 1) Copy only dependency manifests first → cached pnpm install layer
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-notification,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 2) Copy source and build
COPY . .
RUN pnpm build

# 3) Create production-only node_modules
RUN --mount=type=cache,id=pnpm-notification,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

# Production stage
FROM base AS final
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN apk --no-cache add curl

ENV NODE_ENV=production
ENV PORT=8300
EXPOSE 8300 8301

CMD ["node", "dist/src/main"]
