import express from "express";
import cors from "cors"
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config";
import inventoryRouter from "./routes/inventory.routes";

const app = express()

app.use(cors())

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/inventory", inventoryRouter)

app.listen(4000, () => console.log("Inventory Service running on PORT 4000"))