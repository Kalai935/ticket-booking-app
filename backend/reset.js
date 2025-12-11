const pool = require('./db');

async function resetDb() {
    try {
        console.log("🗑️  Clearing all bookings...");
        
        // 1. Delete seats first (because they belong to bookings)
        await pool.query('DELETE FROM booking_seats');
        
        // 2. Delete bookings next
        await pool.query('DELETE FROM bookings');
        
        console.log("✅ SUCCESS: All seats are now empty!");
    } catch (err) {
        console.error("❌ ERROR:", err);
    } finally {
        pool.end();
    }
}

resetDb();