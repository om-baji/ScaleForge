import { Injectable, NestMiddleware } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction): void {
    req.log.info({
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
      params: req.params,
    });

    res.on('finish', () => {
      req.log.info({
        statusCode: res.statusCode,
        method: req.method,
        url: req.url,
      });
    });

    next();
  }
}
