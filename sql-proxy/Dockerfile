FROM golang-1.21-alpine

WORKDIR /app

COPY . .

RUN go mod tidy

RUN make build

EXPOSE 7000 8080

CMD [ "./proxy" ]
