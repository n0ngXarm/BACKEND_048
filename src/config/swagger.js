// src/config/swagger.js

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
        // ⚠️ แก้ตรงนี้! เปลี่ยนจาก "http://localhost:5000" เป็น "/"
        url: "/", 
        description: "Auto-detect Server (Local & Production)",
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
  apis: [path.join(__dirname, "../routes/*.js")], 
};

const specs = swaggerJsdoc(options);

module.exports = specs;