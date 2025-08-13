import express from "express"
import morgan from "morgan"

const app = express()

app.use(express.json())
app.use(morgan("dev"))

app.listen(4000, () => console.log("Inventory Service running on PORT 4000"))