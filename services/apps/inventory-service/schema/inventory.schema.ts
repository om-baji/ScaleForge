import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  price: z.string().or(z.number()).transform((val) => BigInt(val)),
  stock: z.string().or(z.number()).transform((val) => parseInt(val.toString()))
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.string().or(z.number()).transform((val) => BigInt(val)).optional(),
  stock: z.string().or(z.number()).transform((val) => parseInt(val.toString())).optional()
});

export const stockUpdateSchema = z.object({
  quantity: z.string().or(z.number()).transform((val) => parseInt(val.toString()))
});

export const stockReduceSchema = z.object({
  quantity: z.string().or(z.number()).transform((val) => {
    const num = parseInt(val.toString());
    if (num <= 0) throw new Error("Quantity must be greater than 0");
    return num;
  })
});

export const bulkUpdateSchema = z.object({
  updates: z.array(z.object({
    productId: z.string().uuid("Invalid product ID"),
    quantity: z.number().int()
  })).min(1, "Updates array cannot be empty")
});

export const paramsSchema = z.object({
  id: z.string().uuid("Invalid product ID")
});

export const lowStockQuerySchema = z.object({
  threshold: z.string().transform((val) => parseInt(val)).optional()
});