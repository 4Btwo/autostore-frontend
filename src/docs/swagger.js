import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API AutoStore",
    version: "2.0.0",
    description: "API do marketplace AutoStore — peças automotivas",
  },
  servers: [
    {
      url: process.env.BACKEND_URL || "http://localhost:3000",
      description: "Servidor ativo",
    },
    {
      url: "http://localhost:3000",
      description: "Desenvolvimento local",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token Firebase ID Token",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
