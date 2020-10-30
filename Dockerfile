# Base
FROM mhart/alpine-node:14 AS base

RUN apk update && apk add curl bash python g++ make && rm -rf /var/cache/apk/*
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

WORKDIR /app

COPY package.json yarn.lock ./
COPY ./config ./config

# Dependencies
FROM base AS build

RUN yarn --frozen-lockfile
COPY . .
RUN yarn lint
RUN yarn build

# remove development dependencies
RUN npm prune --production

# run node prune
RUN /usr/local/bin/node-prune

# Final image
FROM node:12-alpine

WORKDIR /app

# copy from build image
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/config ./config

ENV NODE_ENV docker_dev
EXPOSE 5000

CMD [ "node", "./dist/server.js" ]
