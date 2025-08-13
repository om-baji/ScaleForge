import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Order API",
      version: "1.0.0",
      description: "API documentation for Orders and Inventory system",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local development server",
      },
    ],
  },
  apis: ["./routes/**/*.ts"], 
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

