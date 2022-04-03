FROM node:17-alpine

WORKDIR /usr/src/app

COPY package*.json .
COPY index.js .

RUN npm ci

USER node
CMD ["node", "index.js"]

