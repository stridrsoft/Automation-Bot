# Dockerfile (in root directory)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY api/package*.json ./api/
COPY web/package*.json ./web/
COPY worker/package*.json ./worker/

# Install dependencies
RUN cd api && npm ci --only=production
RUN cd web && npm ci --only=production  
RUN cd worker && npm ci --only=production

# Copy source code
COPY . .

# Install Playwright browsers
RUN cd worker && npx playwright install chromium

# Build web app
RUN cd web && npm run build

# Expose ports
EXPOSE 3000 4000

# Start script that runs all services
CMD ["node", "start-all.js"]