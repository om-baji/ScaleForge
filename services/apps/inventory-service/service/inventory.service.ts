import {prisma} from "@shared/db"

class Inventory {
    private static instance: Inventory | null = null;
    
    static getInstance() {
        if (!this.instance) this.instance = new Inventory();
        return this.instance;
    }

    async createProduct(data: {
        name: string;
        sku: string;
        description?: string;
        price: bigint;
        stock: number;
    }) {
        return await prisma.product.create({
            data
        });
    }

    async getProduct(id: string) {
        return await prisma.product.findUnique({
            where: { id }
        });
    }

    async getProductBySku(sku: string) {
        return await prisma.product.findUnique({
            where: { sku }
        });
    }

    async getAllProducts() {
        return await prisma.product.findMany();
    }

    async updateProduct(id: string, data: {
        name?: string;
        description?: string;
        price?: bigint;
        stock?: number;
    }) {
        return await prisma.product.update({
            where: { id },
            data
        });
    }

    async deleteProduct(id: string) {
        return await prisma.product.delete({
            where: { id }
        });
    }

    async updateStock(productId: string, quantity: number) {
        return await prisma.product.update({
            where: { id: productId },
            data: {
                stock: {
                    increment: quantity
                }
            }
        });
    }

    async reduceStock(productId: string, quantity: number) {
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            throw new Error('Product not found');
        }

        if (product.stock < quantity) {
            throw new Error('Insufficient stock');
        }

        return await prisma.product.update({
            where: { id: productId },
            data: {
                stock: {
                    decrement: quantity
                }
            }
        });
    }

    async checkStock(productId: string) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { stock: true }
        });
        return product?.stock || 0;
    }

    async getLowStockProducts(threshold: number = 10) {
        return await prisma.product.findMany({
            where: {
                stock: {
                    lt: threshold
                }
            }
        });
    }

    async isInStock(productId: string, quantity: number = 1) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { stock: true }
        });
        return (product?.stock || 0) >= quantity;
    }

    async bulkUpdateStock(updates: { productId: string; quantity: number }[]) {
        const operations = updates.map(update => 
            prisma.product.update({
                where: { id: update.productId },
                data: {
                    stock: {
                        increment: update.quantity
                    }
                }
            })
        );

        return await prisma.$transaction(operations);
    }

    async reserveStock(productId: string, quantity: number) {
        return await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
                where: { id: productId }
            });

            if (!product) {
                throw new Error('Product not found');
            }

            if (product.stock < quantity) {
                throw new Error('Insufficient stock for reservation');
            }

            return await tx.product.update({
                where: { id: productId },
                data: {
                    stock: {
                        decrement: quantity
                    }
                }
            });
        });
    }

    async disconnect() {
        await prisma.$disconnect();
    }
}

const InventoryService = Inventory.getInstance();

export default InventoryService;