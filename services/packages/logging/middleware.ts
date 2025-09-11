import getLogger from "./logs";
import { v4 as uuidv4 } from "uuid";
import os from "os";
import process from "process";
import type { Request, Response, NextFunction } from "express";

interface RequestLoggerOptions {
  requestId: string;
  method: string;
  path: string;
  status: number;
  latencyMs: number;
  ip: string;
  userAgent: string | undefined;
  referer: string | undefined;
  responseSize: string | number;
  cpuLoad: number;
  memoryMb: number;
  heapUsedMb: number;
  uptimeSec: number;
}

const getRequestLogger = (name: string) => {
  const logger = getLogger(name)
  const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const start = process.hrtime.bigint();
    const requestId = uuidv4();

    res.on("finish", () => {
      const end = process.hrtime.bigint();
      const latencyMs = Number(end - start) / 1e6;

      const logOptions: RequestLoggerOptions = {
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        latencyMs,
        ip: req.ip || "127.0.0.1",
        userAgent: req.get("User-Agent"),
        referer: req.get("Referer"),
        responseSize: res.get("Content-Length") || 0,
        cpuLoad: os.loadavg()[0],
        memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        uptimeSec: process.uptime(),
      };

      logger.info("HTTP Request", logOptions);
    });

    next();
  }

  return requestLogger;
}

export default getRequestLogger;
