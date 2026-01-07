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
        url: "/", // สำหรับ Vercel (Auto-detect)
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
      // 👇👇👇 โซน Schemas ที่พี่ขอมา (พิมพ์เขียวกันลืม) 👇👇👇
      schemas: {
        Customer: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            fullname: { type: "string", example: "Somsri" },
            lastname: { type: "string", example: "Meewang" },
            username: { type: "string", example: "user123" },
            phone_number: { type: "string", example: "0812345678" },
            gmail: { type: "string", example: "somsri@test.com" },
            address: { type: "string", example: "123 Bangkok" },
            status: { type: "string", example: "active" },
          },
        },
        Menu: {
          type: "object",
          properties: {
            menu_id: { type: "integer", example: 10 },
            restaurant_id: { type: "integer", example: 1 },
            menu_name: { type: "string", example: "Krapow Moo" },
            description: { type: "string", example: "Spicy basil pork" },
            price: { type: "number", example: 50.00 },
            category: { type: "string", example: "Main Dish" },
          },
        },
        Order: {
          type: "object",
          properties: {
            order_id: { type: "integer", example: 501 },
            customer_id: { type: "integer", example: 1 },
            menu_id: { type: "integer", example: 10 },
            quantity: { type: "integer", example: 2 },
            total_price: { type: "number", example: 100.00 },
            order_status: { type: "string", example: "Processing" },
            order_date: { type: "string", format: "date-time" },
          },
        },
        Restaurant: {
          type: "object",
          properties: {
            restaurant_id: { type: "integer", example: 1 },
            restaurant_name: { type: "string", example: "Krua Khun Mae" },
            address: { type: "string", example: "Chiang Mai" },
            phone: { type: "string", example: "053-123456" },
            menu_description: { type: "string", example: "Authentic Thai Food" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            payment_id: { type: "integer", example: 99 },
            order_id: { type: "integer", example: 501 },
            payment_method: { type: "string", example: "Scan QR" },
            payment_amount: { type: "number", example: 100.00 },
            payment_status: { type: "string", example: "Paid" },
            payment_date: { type: "string", format: "date-time" },
          },
        },
      },
      // 👆👆👆 จบโซน Schemas 👆👆👆
    },
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

const specs = swaggerJsdoc(options);

module.exports = specs;