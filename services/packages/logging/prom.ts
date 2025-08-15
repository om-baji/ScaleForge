import client from "prom-client";
import type { Request, Response, NextFunction } from "express";

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: "node_",
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 1.5, 2, 5],
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestErrorsTotal = new client.Counter({
  name: "http_request_errors_total",
  help: "Total number of HTTP requests resulting in errors",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestsInProgress = new client.Gauge({
  name: "http_requests_in_progress",
  help: "Number of HTTP requests currently being processed",
  labelNames: ["method", "route"],
});

const memoryUsageBytes = new client.Gauge({
  name: "process_memory_usage_bytes",
  help: "Node.js process memory usage in bytes",
  labelNames: ["type"],
});

register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestErrorsTotal);
register.registerMetric(httpRequestsInProgress);
register.registerMetric(memoryUsageBytes);

const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const route = req.route?.path || req.path;
  const start = process.hrtime();

  httpRequestsInProgress.inc({ method: req.method, route });

  const memUsage = process.memoryUsage();
  memoryUsageBytes.set({ type: "rss" }, memUsage.rss);
  memoryUsageBytes.set({ type: "heapTotal" }, memUsage.heapTotal);
  memoryUsageBytes.set({ type: "heapUsed" }, memUsage.heapUsed);
  memoryUsageBytes.set({ type: "external" }, memUsage.external);

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    };

    httpRequestDurationSeconds.observe(labels, durationInSeconds);
    httpRequestsTotal.inc(labels);

    if (res.statusCode >= 400) {
      httpRequestErrorsTotal.inc(labels);
    }

    httpRequestsInProgress.dec({ method: req.method, route });
  });

  next();
};

const metricsEndpoint = async (_req: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
};

export default {
  register,
  metricsMiddleware,
  metricsEndpoint,
};
