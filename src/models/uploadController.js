class UploadController {
    static async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'กรุณาเลือกไฟล์รูปภาพ' });
            }

            const imageUrl = `/uploads/${req.file.filename}`;

            res.status(200).json({
                message: 'อัปโหลดรูปภาพสำเร็จ',
                imageUrl: imageUrl
            });
        } catch (error) {
            console.error("Upload Error:", error);
            res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปโหลด' });
        }
    }
}

module.exports = UploadController;