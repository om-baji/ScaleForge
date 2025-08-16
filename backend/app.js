import dotenv from "dotenv";
dotenv.config();
import express from "express";
import client from "./sub_services/prom_client.js";
import { logger } from "./sub_services/loki.js";
import eventRouter from "./routes/event.routes.js";
import { serve, setup } from "swagger-ui-express";
import { config } from "./utils/swagger.js";
import userRouter from "./routes/user.routes.js";


const app = express();

app.use(express.json());

app.use("/docs", serve, setup(config));

app.get("/", (_req, res, next) => {
  logger.info("Fetching the / error");
  return res.json({
    status: 200,
    message: "Route fetched sucessfully",
  });
});

app.get("/slow", (_req, res, _next) => {
  setTimeout(() => {
    try {
      logger.info("Fetching /slow");
      const randomInt = Math.ceil(Math.random() * 2);
      if (randomInt == 1) {
        throw new Error("Failed to fetch route");
      }

      return res.json({
        status: 200,
        message: "Slow route fetched sucessfully",
      });
    } catch (e) {
      logger.error(e.message);
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        err: e.message,
      });
    }
  }, 2000);
});

app.get("/metrics", async (_req, res, _next) => {
  res.setHeader("Content-Type", client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
});

app.use("/api/v1/event", eventRouter);
app.use("/api/v1/user", userRouter); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
