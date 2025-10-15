FROM mcr.microsoft.com/playwright:v1.48.0-jammy
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

ENV RESULTS_DIR=/data/results
RUN mkdir -p /data/results

EXPOSE 4001

CMD ["node", "dist/worker.js"]


