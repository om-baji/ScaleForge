import { z } from "zod";

export const paramsSchema = z.object({
    id: z.string().uuid()
});

export const createOrderSchema = z.object({
    userId: z.string().uuid(),
    items: z.array(
        z.object({
            productId: z.string().uuid(),
            quantity: z.number().int().positive()
        })
    ).min(1)
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED"])
});
