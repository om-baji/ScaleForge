import { Injectable } from '@nestjs/common';
import { prisma as prismaClient } from 'src/lib/prisma';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AppService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  async createProduct(data: {
    name: string;
    sku: string;
    description?: string;
    price: bigint;
    stock: number;
  }) {
    return await this.prisma.product.create({ data });
  }

  async getProduct(id: string) {
    return await this.prisma.product.findUnique({ where: { id } });
  }

  async getProductBySku(sku: string) {
    return await this.prisma.product.findUnique({ where: { sku } });
  }

  async getAllProducts() {
    return await this.prisma.product.findMany();
  }

  async updateProduct(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: bigint;
      stock?: number;
    },
  ) {
    return await this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id: string) {
    return await this.prisma.product.delete({ where: { id } });
  }

  async updateStock(productId: string, quantity: number) {
    return await this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }

  async reduceStock(productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new Error('Product not found');
    if (product.stock < quantity) throw new Error('Insufficient stock');

    return await this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }

  async checkStock(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });
    return product?.stock || 0;
  }

  async getLowStockProducts(threshold: number = 10) {
    return await this.prisma.product.findMany({
      where: { stock: { lt: threshold } },
    });
  }

  async isInStock(productId: string, quantity: number = 1) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });
    return (product?.stock || 0) >= quantity;
  }

  async bulkUpdateStock(updates: { productId: string; quantity: number }[]) {
    const operations = updates.map((update) =>
      this.prisma.product.update({
        where: { id: update.productId },
        data: {
          stock: {
            increment: update.quantity,
          },
        },
      }),
    );

    return await this.prisma.$transaction(operations);
  }

  async reserveStock(productId: string, quantity: number) {
    return await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) throw new Error('Product not found');
      if (product.stock < quantity)
        throw new Error('Insufficient stock for reservation');

      return await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });
    });
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}
