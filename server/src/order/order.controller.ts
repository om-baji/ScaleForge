import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { register } from '../middleware/prometheus.middleware';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('metrics')
  async getMetrics() {
    const metrics = await register.metrics();
    return metrics;
  }

  @Get('health')
  getHealth() {
    return {
      success: true,
      data: {
        service: 'Orders Service',
        status: 'OK',
        time: new Date().toISOString(),
      },
    };
  }

  @Post()
  async createOrder(
    @Body()
    body: {
      userId: string;
      items: { productId: string; quantity: number }[];
    },
  ) {
    const { userId, items } = body;
    const order = await this.orderService.createOrder(userId, items);
    return { success: true, data: order };
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    const order = await this.orderService.getOrder(id);
    if (!order)
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    return { success: true, data: order };
  }

  @Get('user/:id')
  async getUserOrders(@Param('id') id: string) {
    const orders = await this.orderService.getUserOrders(id);
    return { success: true, data: orders };
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
    },
  ) {
    const order = await this.orderService.updateOrderStatus(id, body.status);
    return { success: true, data: order };
  }

  @Patch(':id/cancel')
  async cancelOrder(@Param('id') id: string) {
    const order = await this.orderService.cancelOrder(id);
    return { success: true, data: order };
  }
}
