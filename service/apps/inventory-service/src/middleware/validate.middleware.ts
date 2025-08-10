import type { Request, Response, NextFunction } from "express";
import { ZodObject, type ZodRawShape } from "zod";
import { ApiError } from "@handlers/utils";

const validateResource =
  (schema: ZodObject<ZodRawShape>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      next(new ApiError(400, "Validation failed: " + error.errors?.[0]?.message));
    }
  };

export default validateResource;
