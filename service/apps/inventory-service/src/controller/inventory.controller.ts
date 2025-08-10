import { Request, Response } from "express";
import db from "@shared/db";
import { ApiError } from "@handlers/utils";

class Inventory {
  private static instance: Inventory | null = null;

  static getInstance(): Inventory {
    if (!Inventory.instance) {
      Inventory.instance = new Inventory();
    }
    return Inventory.instance;
  }

  public getAll = async (req: Request, res: Response) => {
    const products = await db.product.findMany();
    res.status(200).json(products);
  };

  public getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await db.product.findUnique({ where: { id } });
    if (!product) throw new ApiError(404, "Product not found");
    res.status(200).json(product);
  };

  public create = async (req: Request, res: Response) => {
    const { name, sku, description, price, stock } = req.body;
    const product = await db.product.create({
      data: { name, sku, description, price: BigInt(price), stock },
    });
    res.status(201).json(product);
  };

  public update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, sku, description, price, stock } = req.body;
    const product = await db.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(sku && { sku }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: BigInt(price) }),
        ...(stock !== undefined && { stock }),
      },
    });
    res.status(200).json(product);
  };

  public delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await db.product.delete({ where: { id } });
    res.status(200).send("Deleted");
  };
}

export default Inventory.getInstance();
