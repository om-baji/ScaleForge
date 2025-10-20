FROM node:20-alpine

WORKDIR /usr/app

COPY package.json bun.lockb ./

RUN npm -g install bun

RUN bun install

COPY . ./

RUN ./setup.sh

RUN bun test

CMD [ "bun", "dev" ]
