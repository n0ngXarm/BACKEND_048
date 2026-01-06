const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BackEnd API (Pro Version)",
      version: "1.0.0",
      description: "API Documentation for Food Ordering System",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // ชี้ไปที่ไฟล์ Routes เพื่อดึง Comment มาสร้าง Docs
  apis: [path.join(__dirname, "../routes/*.js")], 
};

const specs = swaggerJsdoc(options);

module.exports = specs;