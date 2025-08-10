import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  timeout: 5000, 
  prefix: "node_"
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5] 
});
register.registerMetric(httpRequestDurationSeconds);

const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    httpRequestDurationSeconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(durationInSeconds);
  });

  next();
};

export default {
  client,
  register,
  metricsMiddleware
};
