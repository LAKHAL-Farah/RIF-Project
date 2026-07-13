# ===== Stage 1: Install deps and build the static bundle =====
FROM node:22-alpine AS build
WORKDIR /app

# Use the repo's pnpm lockfile so the image follows the same dependency graph as CI.
RUN corepack enable

# Install dependencies first (cached layer, only re-runs if package metadata changes)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm build

# ===== Stage 2: Serve the static build with nginx =====
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD wget --spider -q http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
