import { Router } from "express";
import { asyncHandler } from "@handlers/utils";
import inventoryController from "../controller/inventory.controller";
import validateResource from "../middleware/validate.middleware";
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  deleteProductSchema,
} from "../validator/zod";

const inventoryRouter = Router();

/**
 * @swagger
 * /api/v1/inventory:
 *   get:
 *     summary: Get all products
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
inventoryRouter.get("/", asyncHandler(inventoryController.getAll));

/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
inventoryRouter.get(
  "/:id",
  validateResource(getProductSchema),
  asyncHandler(inventoryController.getById)
);

/**
 * @swagger
 * /api/v1/inventory:
 *   post:
 *     summary: Create a new product
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 */
inventoryRouter.post(
  "/",
  validateResource(createProductSchema),
  asyncHandler(inventoryController.create)
);

/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 */
inventoryRouter.put(
  "/:id",
  validateResource(updateProductSchema),
  asyncHandler(inventoryController.update)
);

/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
inventoryRouter.delete(
  "/:id",
  validateResource(deleteProductSchema),
  asyncHandler(inventoryController.delete)
);

export default inventoryRouter;
