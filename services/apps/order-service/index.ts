import { getLogger, metrics, requestLogger } from "@shared/logging";
import express from "express";
import morgan from "morgan";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config';
import orderRouter from "./routes/order.routes";

const app = express()

app.use(express.json())
app.use(requestLogger("order-service"))

const logger = getLogger("order-service")

app.use(
  morgan("combined", {
    stream: {
      write: (message) => {
        logger.info(message.trim())
      },
    },
  })
);

app.use(metrics.metricsMiddleware);

app.get("/metrics", metrics.metricsEndpoint);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/order", orderRouter);

app.listen(5000, () => console.log("Order Service running on PORT 5000"))