FROM node:20-alpine

# Install dumb-init untuk proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files dulu (cache layer)
COPY package.json package-lock.json* ./

# Install dependencies (tanpa devDependencies)
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 5000

# Gunakan dumb-init agar Node menerima signal dengan benar
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
