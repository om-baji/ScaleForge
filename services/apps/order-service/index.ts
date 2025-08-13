import express from "express"
import morgan from "morgan"
import swaggerUi from 'swagger-ui-express';
import {swaggerSpec} from './config';
import orderRouter from "./routes/order.routes"
import winston from "winston";
import LokiTransport from "winston-loki";

const app = express()

app.use(express.json())

const logger = winston.createLogger({
  transports: [
    new LokiTransport({
      host: "http://localhost:3100",
      labels: { app: "inventory-service" },
      json: true,
      batching: true,
      interval: 5,
    }),
  ],
});

app.use(
  morgan("combined", {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  })
);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/order", orderRouter);

app.listen(5000, () => console.log("Order Service running on PORT 5000"))