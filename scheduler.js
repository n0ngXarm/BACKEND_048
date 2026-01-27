const cron = require('node-cron');
const db = require('./src/config/db');

// Export a function that registers cron jobs
module.exports = function registerCronJobs() {
    // ตั้งเวลาทำงานทุกเที่ยงคืน (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('⏰ Running Cron Job: Checking subscription status...');
        try {
            // อัปเดต User ที่วันหมดอายุ (subscription_end_date) น้อยกว่าเวลาปัจจุบัน ให้ is_plus_member = false
            const sql = `
                UPDATE tbl_customers 
                SET is_plus_member = 0 
                WHERE is_plus_member = 1 
                AND subscription_end_date < NOW()
            `;
            const [result] = await db.query(sql);
            
            if (result.affectedRows > 0) {
                console.log(`✅ Downgraded ${result.affectedRows} users from Plus to Normal.`);
            } else {
                console.log('ℹ️ No subscriptions expired today.');
            }
        } catch (error) {
            console.error('🔥 Cron Job Error:', error);
        }
    });
    console.log('✅ Cron jobs registered');
};