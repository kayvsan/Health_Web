# ===== Stage 1: Build React App =====
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files dulu (untuk cache layer)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Build untuk production
RUN npm run build

# ===== Stage 2: Serve dengan Nginx =====
FROM nginx:1.27-alpine

# Hapus default config Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy hasil build dari Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
