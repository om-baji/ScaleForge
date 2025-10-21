import express from "express";
import InventoryController from "../controllers/inventory.controller";

const inventoryRouter = express.Router();

/**
 * @swagger
 * /inventory/health:
 *   get:
 *     summary: Get health status
 *     tags: [Inventory]
 */
inventoryRouter.get("/health", InventoryController.getHealth);

/**
 * @swagger
 * /inventory/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 */
inventoryRouter.post("/products", InventoryController.createProduct);

/**
 * @swagger
 * /inventory/products:
 *   get:
 *     summary: Get all products
 *     tags: [Inventory]
 */
inventoryRouter.get("/products", InventoryController.getAllProducts);

/**
 * @swagger
 * /inventory/products/low-stock:
 *   get:
 *     summary: Get low stock products
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Stock threshold limit
 */
inventoryRouter.get(
  "/products/low-stock",
  InventoryController.getLowStockProducts,
);

/**
 * @swagger
 * /inventory/products/stock/bulk-update:
 *   patch:
 *     summary: Bulk update stock
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 */
inventoryRouter.patch(
  "/products/stock/bulk-update",
  InventoryController.bulkUpdateStock,
);

/**
 * @swagger
 * /inventory/products/{id}:
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
 */
inventoryRouter.get("/products/:id", InventoryController.getProduct);

/**
 * @swagger
 * /inventory/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 */
inventoryRouter.put("/products/:id", InventoryController.updateProduct);

/**
 * @swagger
 * /inventory/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
inventoryRouter.delete("/products/:id", InventoryController.deleteProduct);

/**
 * @swagger
 * /inventory/products/{id}/stock:
 *   patch:
 *     summary: Update product stock
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
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 */
inventoryRouter.patch("/products/:id/stock", InventoryController.updateStock);

/**
 * @swagger
 * /inventory/products/{id}/stock/reduce:
 *   patch:
 *     summary: Reduce product stock
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
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 */
inventoryRouter.patch(
  "/products/:id/stock/reduce",
  InventoryController.reduceStock,
);

/**
 * @swagger
 * /inventory/products/{id}/stock/check:
 *   get:
 *     summary: Check product stock
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
inventoryRouter.get(
  "/products/:id/stock/check",
  InventoryController.checkStock,
);

/**
 * @swagger
 * /inventory/products/{id}/stock/reserve:
 *   patch:
 *     summary: Reserve product stock
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
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 */
inventoryRouter.patch(
  "/products/:id/stock/reserve",
  InventoryController.reserveStock,
);

export default inventoryRouter;
