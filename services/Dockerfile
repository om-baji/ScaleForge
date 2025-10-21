FROM node:20-alpine

WORKDIR /usr/app

COPY package.json bun.lockb ./

RUN npm -g install bun

RUN bun install

COPY . ./

RUN ./setup.sh

RUN bun test

EXPOSE 3000

CMD [ "bun", "dev" ]
