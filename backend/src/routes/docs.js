import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const router = express.Router();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mini-CRM API",
      version: "1.0.0",
      description: "API docs for the Mini CRM (auto-generated via swagger-jsdoc)",
    },
    servers: [{ url: "http://localhost:4000" }],
  },
  // Scan all route files for annotations
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
