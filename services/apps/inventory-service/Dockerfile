FROM oven/bun

WORKDIR /usr/app

COPY package.json ./

RUN bun install

COPY . .

EXPOSE 4000

CMD ["bun", "dev"]