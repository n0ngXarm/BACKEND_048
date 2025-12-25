const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BackEnd API Documentation",
      version: "1.0.0",
      description: "เอกสาร API สำหรับจัดการข้อมูลผู้ใช้ (CRUD Users)",
    },
    servers: [
      {
        url: "http://localhost:5000", // URL ของ Server เรา
      },
    ],
  },
  // ระบุ Path ของไฟล์ Route ที่เราเขียน Comment ไว้
  apis: [path.join(__dirname, "/routes/*.js")], 
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };