FROM node:18-alpine
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY index.html ./
COPY tsconfig.json vite.config.ts tailwind.config.js postcss.config.js ./
COPY src ./src

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]


