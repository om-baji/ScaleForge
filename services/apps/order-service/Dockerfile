FROM oven/bun

WORKDIR /usr/app

COPY package.json bun.lockb ./

RUN bun install

COPY . .

EXPOSE 5000

CMD ["bun", "dev"]
