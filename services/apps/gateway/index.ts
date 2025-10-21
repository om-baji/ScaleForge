import express from "express";
import proxy from "express-http-proxy";

const app = express();
app.use(express.json());

app.use("/inventory", proxy("http://localhost:4000"));
app.use("/orders", proxy("http://localhost:5000"));

app.get("/health", (_req, res) => {
  res.json({
    status: "Running!",
  });
});

app.get("/", (_req, res) => {
  res.json({
    service: "Gateway Service",
    status: "OK",
    time: new Date().toISOString(),
  });
});

app.listen(3000, () => {
  console.log("Gateway service is running on port 3000");
});
