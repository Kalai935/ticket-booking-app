const pool = require('./db');

const sql = `
-- Drop tables if they exist to start fresh (Optional, but good for testing)
DROP TABLE IF EXISTS booking_seats;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS shows;

-- 1. Table for Shows
CREATE TABLE shows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    total_seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table for Bookings
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    show_id INT REFERENCES shows(id),
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table for Specific Seats
CREATE TABLE booking_seats (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id),
    seat_number INT NOT NULL,
    UNIQUE(booking_id, seat_number) 
);
`;

async function createTables() {
    try {
        console.log("Connecting to database...");
        await pool.query(sql);
        console.log("✅ SUCCESS: Tables created successfully!");
    } catch (err) {
        console.error("❌ ERROR:", err);
    } finally {
        pool.end();
    }
}

createTables();