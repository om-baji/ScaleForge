import { ApiError } from "@shared/handlers";
import { type Request, type Response } from "express";
import {
    bulkUpdateSchema,
    createProductSchema,
    lowStockQuerySchema,
    paramsSchema,
    stockReduceSchema,
    stockUpdateSchema,
    updateProductSchema
} from "../schema/inventory.schema";
import InventoryService from "../service/inventory.service";

class Inventory {
  private static instance: Inventory | null = null;

  static getInstance() {
    if (!this.instance) this.instance = new Inventory();
    return this.instance;
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    const parseResult = createProductSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      throw new ApiError(400, parseResult.error.message);
    }

    const product = await InventoryService.createProduct(parseResult.data);

    res.status(201).json({
      success: true,
      data: {
        ...product,
        price: product.price.toString(),
      },
    });
  }

  async getProduct(req: Request, res: Response): Promise<void> {
    const parseResult = paramsSchema.safeParse(req.params);
    
    if (!parseResult.success) {
      throw new ApiError(400, parseResult.error.message);
    }
    
    const { id } = parseResult.data;
    const product = await InventoryService.getProduct(id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    res.json({
      success: true,
      data: {
        ...product,
        price: product.price.toString(),
      },
    });
  }

  async getAllProducts(req: Request, res: Response): Promise<void> {
    const products = await InventoryService.getAllProducts();

    res.json({
      success: true,
      data: products.map((product) => ({
        ...product,
        price: product.price.toString(),
      })),
    });
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    const paramsResult = paramsSchema.safeParse(req.params);
    const bodyResult = updateProductSchema.safeParse(req.body);
    
    if (!paramsResult.success) {
      throw new ApiError(400, paramsResult.error.message);
    }
    
    if (!bodyResult.success) {
      throw new ApiError(400, bodyResult.error.message);
    }

    const { id } = paramsResult.data;
    const updateData = bodyResult.data;

    const product = await InventoryService.updateProduct(id, updateData);

    res.json({
      success: true,
      data: {
        ...product,
        price: product.price.toString(),
      },
    });
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    const parseResult = paramsSchema.safeParse(req.params);
    
    if (!parseResult.success) {
      throw new ApiError(400, parseResult.error.message);
    }
    
    const { id } = parseResult.data;
    await InventoryService.deleteProduct(id);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  }

  async updateStock(req: Request, res: Response): Promise<void> {
    const paramsResult = paramsSchema.safeParse(req.params);
    const bodyResult = stockUpdateSchema.safeParse(req.body);
    
    if (!paramsResult.success) {
      throw new ApiError(400, paramsResult.error.message);
    }
    
    if (!bodyResult.success) {
      throw new ApiError(400, bodyResult.error.message);
    }

    const { id } = paramsResult.data;
    const { quantity } = bodyResult.data;

    const product = await InventoryService.updateStock(id, quantity);

    res.json({
      success: true,
      data: {
        ...product,
        price: product.price.toString(),
      },
    });
  }

  async reduceStock(req: Request, res: Response): Promise<void> {
    const paramsResult = paramsSchema.safeParse(req.params);
    const bodyResult = stockReduceSchema.safeParse(req.body);
    
    if (!paramsResult.success) {
      throw new ApiError(400, paramsResult.error.message);
    }
    
    if (!bodyResult.success) {
      throw new ApiError(400, bodyResult.error.message);
    }

    const { id } = paramsResult.data;
    const { quantity } = bodyResult.data;

    const product = await InventoryService.reduceStock(id, quantity);

    res.json({
      success: true,
      data: {
        ...product,
        price: product.price.toString(),
      },
    });
  }

  async checkStock(req: Request, res: Response): Promise<void> {
    const parseResult = paramsSchema.safeParse(req.params);
    
    if (!parseResult.success) {
      throw new ApiError(400, parseResult.error.message);
    }
    
    const { id } = parseResult.data;
    const stock = await InventoryService.checkStock(id);

    res.json({
      success: true,
      data: { stock },
    });
  }

  async getLowStockProducts(req: Request, res: Response): Promise<void> {
    const parseResult = lowStockQuerySchema.safeParse(req.query);
    
    if (!parseResult.success) {
      throw new ApiError(400, parseResult.error.message);
    }
    
    const { threshold = 10 } = parseResult.data;
    const products = await InventoryService.getLowStockProducts(threshold);

    res.json({
      success: true,
      data: products.map((product) => ({
        ...product,
        price: product.price.toString(),
      })),
    });
  }

  async bulkUpdateStock(req: Request, res: Response): Promise<void> {
    const parseResult = bulkUpdateSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      throw new ApiError(400, parseResult.error.message);
    }

    const { updates } = parseResult.data;
    const results = await InventoryService.bulkUpdateStock(updates);

    res.json({
      success: true,
      data: results.map((product) => ({
        ...product,
        price: product.price.toString(),
      })),
    });
  }

  async reserveStock(req: Request, res: Response): Promise<void> {
    const paramsResult = paramsSchema.safeParse(req.params);
    const bodyResult = stockReduceSchema.safeParse(req.body);
    
    if (!paramsResult.success) {
      throw new ApiError(400, paramsResult.error.message);
    }
    
    if (!bodyResult.success) {
      throw new ApiError(400, bodyResult.error.message);
    }

    const { id } = paramsResult.data;
    const { quantity } = bodyResult.data;

    const product = await InventoryService.reserveStock(id, quantity);

    res.json({
      success: true,
      data: {
        ...product,
        price: product.price.toString(),
      },
    });
  }
}

const InventoryController = Inventory.getInstance();

export default InventoryController;