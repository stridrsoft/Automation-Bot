# Dockerfile (in root directory)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY api/package*.json ./api/
COPY web/package*.json ./web/
COPY worker/package*.json ./worker/

# Install dependencies
RUN cd api && npm ci --omit=dev
RUN cd web && npm ci --omit=dev  
RUN cd worker && npm ci --omit=dev

# Copy source code
COPY . .

# Install Playwright browsers (use the local installation)
RUN cd worker && ./node_modules/.bin/playwright install chromium

# Build web app
RUN cd web && npm run build

# Expose ports
EXPOSE 3000 4000

# Start script that runs all services
CMD ["node", "start-all.js"]