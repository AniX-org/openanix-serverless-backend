FROM node:24-alpine

LABEL org.opencontainers.image.source=https://github.com/AniX-org/openanix-serverless-backend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

ADD src ./src
COPY node.ts ./
COPY tsconfig.json ./

EXPOSE 3000

CMD ["npm", "run", "node-run"]