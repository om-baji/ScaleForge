import type { Request, Response, NextFunction } from "express";
import ApiError from "./error";

export const errorMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode, message } = err as ApiError;

  if (!statusCode) statusCode = 500;
  if (!message) message = "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
