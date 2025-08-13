import { prisma } from "@shared/db";
import { notificationQueue } from "@shared/queues";

class OrderServiceClass {
    private static instance: OrderServiceClass | null = null;

    static getInstance() {
        if (!this.instance) this.instance = new OrderServiceClass();
        return this.instance;
    }

    async createOrder(userId: string, items: { productId: string; quantity: number }[]) {
        const products = await prisma.product.findMany({
            where: { id: { in: items.map(i => i.productId) } }
        });

        if (products.length !== items.length) throw new Error("Some products were not found");

        products.forEach(p => {
            const requested = items.find(i => i.productId === p.id)?.quantity || 0;
            if (p.stock < requested) throw new Error(`Insufficient stock for ${p.name}`);
        });

        const order = await prisma.$transaction(async tx => {
            const createdOrder = await tx.order.create({
                data: { userId, status: "PENDING" }
            });

            await Promise.all(
                items.map(item => {
                    const product = products.find(p => p.id === item.productId)!;
                    return tx.orderItem.create({
                        data: {
                            orderId: createdOrder.id,
                            productId: product.id,
                            quantity: item.quantity,
                            price: product.price
                        }
                    });
                })
            );

            await Promise.all(
                items.map(item =>
                    tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } }
                    })
                )
            );

            return createdOrder;
        });

        const orderItems = items.map(item => {
            const product = products.find(p => p.id === item.productId)!;
            return {
                name: product.name,
                quantity: item.quantity,
                price: product.price
            };
        });

        notificationQueue.add("ORDER", {
            type: "ORDER_CREATED",
            userId,
            orderId: order.id,
            orderItems,
            total: orderItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
        });

        return order;
    }

    async getOrder(orderId: string) {
        return prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                items: true 
            }
        });
    }

    async getUserOrders(userId: string) {
        return prisma.order.findMany({
            where: { userId },
            include: { items: true },
            orderBy: { createdAt: "desc" }
        });
    }

    async updateOrderStatus(orderId: string, status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELED") {
        return prisma.order.update({
            where: { id: orderId },
            data: { status }
        });
    }

    async cancelOrder(orderId: string) {
        return prisma.$transaction(async tx => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true }
            });

            if (!order) throw new Error("Order not found");

            await Promise.all(
                order.items.map(item =>
                    tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    })
                )
            );

            return tx.order.update({
                where: { id: orderId },
                data: { status: "CANCELED" }
            });
        });
    }

    async disconnect() {
        await prisma.$disconnect();
    }
}

const OrderService = OrderServiceClass.getInstance();

export default OrderService;
