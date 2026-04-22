# Dockerfile for React Frontend — LOCAL DEV / Docker Compose ONLY
#
# ╔══════════════════════════════════════════════════════════════╗
# ║  ON RENDER: Deploy as a Static Site instead!               ║
# ║  Build Command : npm run build                             ║
# ║  Publish Dir   : dist                                      ║
# ║  This is FREE, CDN-served, and NEVER spins down.           ║
# ╚══════════════════════════════════════════════════════════════╝

# -------- Stage 1: Build --------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# -------- Stage 2: Serve with nginx (local only) --------
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Simple nginx config for SPA routing
RUN echo 'server { \
    listen 3000; \
    root /usr/share/nginx/html; \
    location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
