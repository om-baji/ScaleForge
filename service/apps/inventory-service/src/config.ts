import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
/**
 * @swagger
 * tags:
 *   - name: Inventory
 *     description: Inventory management
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         sku:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *           example: 1500
 *         stock:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - sku
 *         - price
 *         - stock
 *       properties:
 *         name:
 *           type: string
 *         sku:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *         stock:
 *           type: integer
 */

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "REST API documentation for our service",
    },
    servers: [
      {
        url: "http://localhost:4000/api/v1",
        description: "Local server",
      },
    ],
  },
  apis: [
    path.join(__dirname, "../routes/**/*.ts"), // your route files
  ],
};

export default swaggerJsdoc(options);
