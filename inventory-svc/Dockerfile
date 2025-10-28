FROM node:20-alpine as builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

COPY . ./

RUN npx prisma generate

FROM node:20-alpine as runner

WORKDIR /app

COPY --from=builder /app .

RUN npm run build

EXPOSE 4002

CMD [ "npm","run", "start" ]
