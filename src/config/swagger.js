// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Food Delivery API',
      version: '1.0.0',
      description: 'API Documentation',
    },
    servers: [
      { url: 'http://localhost:5000/api' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // ⚠️ สำคัญ: ต้องชี้ path ไปที่ src/routes เพราะเรารันจาก root
  apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;