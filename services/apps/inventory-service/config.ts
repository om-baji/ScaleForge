import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Inventory API",
      version: "1.0.0",
      description: "API documentation for the Inventory Management System",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Local development server",
      },
    ],
    components: {
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            sku: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            stock: { type: "integer" },
          },
          required: ["name", "sku", "price", "stock"],
        },
        StockUpdate: {
          type: "object",
          properties: {
            quantity: { type: "integer" },
          },
          required: ["quantity"],
        },
        BulkStockUpdate: {
          type: "object",
          properties: {
            updates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string", format: "uuid" },
                  quantity: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./routes/inventory.routes.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
