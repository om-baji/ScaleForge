import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrometheusMiddleware } from 'src/middleware/prometheus.middleware';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  providers: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PrometheusMiddleware).forRoutes('*');
  }
}
