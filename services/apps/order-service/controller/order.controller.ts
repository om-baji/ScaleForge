import { ApiError } from "@shared/handlers";
import { type Request, type Response } from "express";
import {
  createOrderSchema,
  paramsSchema,
  updateOrderStatusSchema,
} from "../schema/order.schema";
import OrderService from "../service/order.service";

class OrderControllerClass {
  private static instance: OrderControllerClass | null = null;

  static getInstance() {
    if (!this.instance) this.instance = new OrderControllerClass();
    return this.instance;
  }

  async getHealth(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        service: "Orders Service",
        status: "OK",
        time: new Date().toISOString(),
      },
    });
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    const parseResult = createOrderSchema.safeParse(req.body);
    if (!parseResult.success)
      throw new ApiError(400, parseResult.error.message);

    const { userId, items } = parseResult.data;
    const order = await OrderService.createOrder(userId, items);

    res.status(201).json({
      success: true,
      data: order,
    });
  }

  async getOrder(req: Request, res: Response): Promise<void> {
    const parseResult = paramsSchema.safeParse(req.params);
    if (!parseResult.success)
      throw new ApiError(400, parseResult.error.message);

    const { id } = parseResult.data;
    const order = await OrderService.getOrder(id);
    if (!order) throw new ApiError(404, "Order not found");

    res.json({
      success: true,
      data: order,
    });
  }

  async getUserOrders(req: Request, res: Response): Promise<void> {
    const parseResult = paramsSchema.safeParse(req.params);
    if (!parseResult.success)
      throw new ApiError(400, parseResult.error.message);

    const { id } = parseResult.data;
    const orders = await OrderService.getUserOrders(id);

    res.json({
      success: true,
      data: orders,
    });
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    const paramsResult = paramsSchema.safeParse(req.params);
    const bodyResult = updateOrderStatusSchema.safeParse(req.body);

    if (!paramsResult.success)
      throw new ApiError(400, paramsResult.error.message);
    if (!bodyResult.success) throw new ApiError(400, bodyResult.error.message);

    const { id } = paramsResult.data;
    const { status } = bodyResult.data;

    const order = await OrderService.updateOrderStatus(id, status);
    res.json({
      success: true,
      data: order,
    });
  }

  async cancelOrder(req: Request, res: Response): Promise<void> {
    const parseResult = paramsSchema.safeParse(req.params);
    if (!parseResult.success)
      throw new ApiError(400, parseResult.error.message);

    const { id } = parseResult.data;
    const order = await OrderService.cancelOrder(id);

    res.json({
      success: true,
      data: order,
    });
  }
}

const OrderController = OrderControllerClass.getInstance();
export default OrderController;
