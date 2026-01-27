const jwt = require('jsonwebtoken');

// จำลอง Database สำหรับเก็บ Refresh Token (ใน Production ควรใช้ Redis หรือ SQL)
let refreshTokens = [];

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'access_secret_key', // ควรตั้งค่าใน .env
        { expiresIn: '15m' } // Access Token อายุสั้น
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key', // ควรตั้งค่าใน .env
        { expiresIn: '7d' } // Refresh Token อายุยาว
    );
};

exports.register = async (req, res) => {
    // Placeholder เพื่อป้องกัน Error จาก Route เก่าที่เรียกหา register
    res.status(501).json({ message: "Register not implemented" });
};

exports.login = async (req, res) => {
    // รับค่าจาก Body
    const { username, password } = req.body;

    // TODO: เพิ่ม Logic ตรวจสอบ Username/Password กับ Database จริงที่นี่
    // ตัวอย่าง Mock User เพื่อให้ API ทำงานได้ตามสเปค
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = {
        id: 1,
        username: username,
        role: 'user'
    };

    // สร้าง Token ทั้งสองแบบ
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // เก็บ Refresh Token ไว้ในระบบ (Whitelist)
    refreshTokens.push(refreshToken);

    // ส่ง Response ตามสเปค
    res.json({
        user,
        accessToken,
        refreshToken
    });
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ message: "Refresh Token required" });

    // ตรวจสอบว่า Token มีอยู่ในระบบหรือไม่
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ message: "Invalid Refresh Token" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key', (err, user) => {
        if (err) return res.status(403).json({ message: "Token expired or invalid" });

        // Token Rotation: ลบอันเก่า สร้างอันใหม่
        refreshTokens = refreshTokens.filter(t => t !== refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.push(newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    });
};

exports.logout = async (req, res) => {
    // Placeholder เพื่อป้องกัน Error จาก Route เก่า
    res.json({ message: "Logout successful" });
};