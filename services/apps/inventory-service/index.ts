import { getLogger, metrics, requestLogger } from "@shared/logging";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config";
import inventoryRouter from "./routes/inventory.routes";

const app = express();

app.use(express.json());
app.use(requestLogger("inventory-service"));

const logger = getLogger("inventory-service");

app.use(
  morgan("combined", {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  }),
);

app.use(metrics.metricsMiddleware);

app.get("/metrics", metrics.metricsEndpoint);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/", inventoryRouter);

app.listen(4000, () => console.log("Inventory Service running on PORT 4000"));
