FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:20-alpine AS runner

COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 4002

CMD ["npm", "run", "start"]
