# 1. Build client
FROM node:22.12.0-alpine AS client-build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY client ./client
COPY server ./server
COPY models ./models
RUN yarn build:client   

# 2. Build server
FROM node:22.12.0-alpine AS server-build
WORKDIR /app

ENV DATABASE_URL=file:/requira/service.db
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000
COPY tsconfig*.json ./
COPY server ./server
COPY models ./models
COPY prisma.config.ts ./prisma.config.ts
RUN yarn build:server
RUN mkdir -p ./dist/server/db
RUN cp -R ./server/db/prisma ./dist/server/db/
RUN mkdir -p /requira

# 3. Final image
FROM node:22.12.0-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=client-build /app/server/public ./server/public
COPY --from=server-build /app/dist/server ./server/dist
COPY --from=server-build /requira /requira

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

ENV DATABASE_URL=file:/requira/service.db
COPY ./prisma.config.ts /app/prisma.config.ts 
COPY ./server/prisma /app/server/prisma 

EXPOSE 3022
#CMD ["sh", "-c", "mkdir -p /requira && npx prisma migrate deploy --config=prisma.config.ts && exec node server/dist/api.js"]
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN apk add --no-cache su-exec python3 py3-pip flac
ENTRYPOINT ["/entrypoint.sh"]
