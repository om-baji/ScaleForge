import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrometheusMiddleware } from 'src/middleware/prometheus.middleware';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PrometheusMiddleware).forRoutes('*');
  }
}
