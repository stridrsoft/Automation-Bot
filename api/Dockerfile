FROM node:18-bullseye-slim AS base
WORKDIR /usr/src/app

# Dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
  openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

# App source
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

# Ensure results dir exists at runtime location
RUN mkdir -p /data/results

EXPOSE 4000

CMD sh -c "npx prisma db push && node dist/seed.js || true; node dist/server.js"


