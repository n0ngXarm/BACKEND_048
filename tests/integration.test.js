const request = require("supertest");
const app = require("../index"); // อ้างอิงไฟล์ index.js (ถ้าไฟล์วางอยู่คนละโฟลเดอร์ ให้แก้ path ตรงนี้)

// สร้างตัวแปรสำหรับเก็บข้อมูลทดสอบ
// ใช้ Date.now() ต่อท้ายชื่อ เพื่อให้ไม่ซ้ำกันเวลารัน Test หลายรอบ
const uniqueId = Date.now();
const testUser = {
    username: `user_${uniqueId}`,
    password: "password123",
    fullname: "Test User Integration"
};

let userToken = ""; // ตัวแปรสำหรับเก็บ Token ไว้ใช้ใน Test ถัดไป

describe("Integration Test: Auth & User Flow", () => {
    
    // 1. ทดสอบสมัครสมาชิก (Register)
    test("POST /auth/register - Should register new user", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({
                username: testUser.username,
                password: testUser.password,
                fullname: testUser.fullname
            });
        
        // Debug: ถ้า Error ให้แสดงผลลัพธ์ออกมาดู
        if (res.statusCode !== 201) {
            console.log("Register Error Response:", res.body);
        }

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User registered successfully");
    });

    // 2. ทดสอบเข้าสู่ระบบ (Login)
    test("POST /auth/login - Should login successfully", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                username: testUser.username,
                password: testUser.password
            });

        if (res.statusCode !== 200) {
            console.log("Login Error Response:", res.body);
        }

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body).toHaveProperty("message", "Login successful");

        // เก็บ Token ไว้ใช้ใน Test ที่ต้องยืนยันตัวตน
        userToken = res.body.token;
    });

    // 3. ทดสอบ Login ผิดพลาด (รหัสผ่านผิด)
    test("POST /auth/login - Should fail with wrong password", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                username: testUser.username,
                password: "wrongpassword"
            });
        
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("message", "Invalid credentials");
    });

    // 4. ทดสอบเข้าถึง Route ที่ต้องใช้ Token (GET /customers)
    test("GET /customers - Should access protected route with token", async () => {
        const res = await request(app)
            .get("/customers")
            .set("Authorization", `Bearer ${userToken}`); // แนบ Token ไปใน Header

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy(); // ต้องได้ค่ากลับมาเป็น Array
    });

    // 5. ทดสอบเข้าถึง Route โดยไม่มี Token
    test("GET /customers - Should deny access without token", async () => {
        const res = await request(app)
            .get("/customers");
            // ไม่ได้แนบ Authorization header

        expect(res.statusCode).toBe(401);
    });
});