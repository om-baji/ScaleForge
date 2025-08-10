import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    description: z.string().optional(),
    price: z.number().int().nonnegative(),
    stock: z.number().int().nonnegative(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    sku: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().int().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
  }),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
