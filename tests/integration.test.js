const request = require("supertest");
const app = require("../app"); // ต้องตรงกับชื่อไฟล์ app.js ที่ path ก่อนหน้า

describe("Integration Test: User & Authentication", () => {
    
    // เคลียร์ข้อมูลหรือ Setup ก่อนเริ่ม (Optional)

    test("POST /users - create user", async () => {
        const res = await request(app)
            .post("/users")
            .send({
                name: "Test User",
                email: "test@mail.com",
                password: "123456"
            });
        
        // ถ้ายัง Error 404 ให้ลอง console.log(res.body) ดูว่า Server ตอบอะไรกลับมา
        if (res.statusCode !== 201) {
            console.log("Debug Error:", res.status, res.body);
        }

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("id");
    });

    test("POST /login - login user", async () => {
        const res = await request(app)
            .post("/login")
            .send({
                email: "test@mail.com",
                password: "123456"
            });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
    });

    test("POST /login - login failed (wrong password)", async () => {
        const res = await request(app)
            .post("/login")
            .send({
                email: "test@mail.com",
                password: "wrongpassword"
            });
        expect(res.statusCode).toBe(401);
    });
});