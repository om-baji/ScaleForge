import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { prisma as prismaClient } from 'src/lib/prisma';
import { notificationQueue } from 'src/lib/queues';

@Injectable()
export class AppService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  async createOrder(
    userId: string,
    items: { productId: string; quantity: number }[],
  ) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });

    if (products.length !== items.length)
      throw new HttpException(
        'Some products were not found',
        HttpStatus.BAD_REQUEST,
      );

    products.forEach((p) => {
      const requested = items.find((i) => i.productId === p.id)?.quantity || 0;
      if (p.stock < requested)
        throw new HttpException(
          `Insufficient stock for ${p.name}`,
          HttpStatus.BAD_REQUEST,
        );
    });

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: { userId, status: 'PENDING' },
      });

      await Promise.all(
        items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          return tx.orderItem.create({
            data: {
              orderId: createdOrder.id,
              productId: product.id,
              quantity: item.quantity,
              price: product.price,
            },
          });
        }),
      );

      await Promise.all(
        items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      );

      return createdOrder;
    });

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      };
    });

    await notificationQueue.add('ORDER', {
      type: 'ORDER_CREATED',
      userId,
      orderId: order.id,
      orderItems,
      total: orderItems.reduce(
        (sum, i) => sum + Number(i.price) * i.quantity,
        0,
      ),
    });

    return order;
  }

  async getOrder(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true },
    });
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(
    orderId: string,
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELED',
  ) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  async cancelOrder(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order)
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);

      await Promise.all(
        order.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          }),
        ),
      );

      return tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELED' },
      });
    });
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}
