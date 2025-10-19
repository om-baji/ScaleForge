FROM oven/bun

WORKDIR /app

COPY package*.json .

RUN bun install

CMD [ "bun", "dev" ]