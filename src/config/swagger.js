const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Food Ordering - BackEnd_048 API",
      version: "4.0.4",
      description: "REST API for the Food Ordering System",
      termsOfService: "https://github.com/n0ngXarm/BackEnd_048#readme",
      contact: {
        name: "Pisitpong-(n0ngXarm)",
        email: "68319010048@cmtc.ac.th",
        url: "https://github.com/n0ngXarm",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    externalDocs: {
      description: "Find more info on GitHub",
      url: "https://github.com/n0ngXarm/BackEnd_048",
    },
    servers: [
      { url: "/", description: "Auto-detect Server (Local & Production)" },
      { url: "http://localhost:3000", description: "Local" },
    ],
    tags: [
      { name: "Auth", description: "Authentication and authorization" },
      { name: "Customers", description: "Customer related endpoints" },
      { name: "Menus", description: "Menu and food items" },
      { name: "Orders", description: "Order creation and tracking" },
      { name: "Restaurants", description: "Restaurant management" },
      { name: "Payments", description: "Payment processing" },
      { name: "Users", description: "User management" },
    ],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      parameters: {
        idParam: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "Resource ID",
        },
      },
      responses: {
        UnauthorizedError: {
          description: "JWT is missing or invalid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string", example: "Unauthorized" } },
              },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
        },
        ValidationError: {
          description: "Validation failed",
        },
      },
      requestBodies: {
        LoginRequest: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string", example: "user123" },
                  password: { type: "string", example: "P@ssw0rd" },
                },
              },
            },
          },
        },
      },
      schemas: {
        Customer: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            fullname: { type: "string", example: "Somsri" },
            lastname: { type: "string", example: "Meewang" },
            username: { type: "string", example: "user123" },
            password: { type: "string", example: "password123" },
            phone_number: { type: "string", example: "0812345678" },
            gmail: { type: "string", example: "somsri@test.com" },
            address: { type: "string", example: "123 Bangkok" },
            status: { type: "string", example: "active" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Menu: {
          type: "object",
          properties: {
            menu_id: { type: "integer", example: 10 },
            restaurant_id: { type: "integer", example: 1 },
            menu_name: { type: "string", example: "Krapow Moo" },
            description: { type: "string", example: "Spicy basil pork" },
            price: { type: "number", example: 50.0 },
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
            total_price: { type: "number", example: 100.0 },
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
            payment_amount: { type: "number", example: 100.0 },
            payment_status: { type: "string", example: "Paid" },
            payment_date: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/**/*.js")],
};

const specs = swaggerJsdoc(options);

module.exports = specs;