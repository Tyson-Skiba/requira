# Deps
FROM node:22.12.0-alpine AS deps
WORKDIR /app

COPY package.json yarn.lock ./

RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --network-timeout 600000
    
# Build client
FROM deps AS client-build
WORKDIR /app

COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY client ./client
COPY server ./server
COPY models ./models

RUN yarn build:client

# Build server
FROM deps AS server-build
WORKDIR /app

ENV DATABASE_URL=file:/requira/service.db

COPY tsconfig*.json ./
COPY server ./server
COPY models ./models
COPY prisma.config.ts ./

RUN yarn build:server

RUN mkdir -p ./dist/server/db \
 && cp -R ./server/db/prisma ./dist/server/db/ \
 && mkdir -p /requira

# Final image
FROM node:22.12.0-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL=file:/requira/service.db

RUN apk add --no-cache su-exec python3 py3-pip flac

COPY --from=client-build /app/server/public ./server/public
COPY --from=server-build /app/dist/server ./server/dist
COPY --from=server-build /requira /requira

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --production --network-timeout 600000

COPY prisma.config.ts ./prisma.config.ts
COPY server/prisma ./server/prisma

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3022
ENTRYPOINT ["/entrypoint.sh"]
