FROM node:17-alpine

USER node
WORKDIR /usr/src/app

COPY package*.json .
COPY index.js .

RUN npm ci

CMD ["node", "index.js"]

