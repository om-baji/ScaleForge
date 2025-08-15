import express from "express"
import morgan from "morgan"
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config';
import inventoryRouter from "./routes/inventory.routes"
import winston from "winston";
import LokiTransport from "winston-loki";
import metrics from "@shared/logging"

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

app.use(metrics.metricsMiddleware);

app.get("/metrics", metrics.metricsEndpoint)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/inventory", inventoryRouter);

app.listen(4000, () => console.log("Inventory Service running on PORT 4000"))