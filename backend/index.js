const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. Create a Show (For Admin)
// This creates a new bus trip or movie show
app.post('/api/shows', async (req, res) => {
    const { name, start_time, total_seats } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO shows (name, start_time, total_seats) VALUES ($1, $2, $3) RETURNING *',
            [name, start_time, total_seats]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Get All Shows (For Users)
// This lists all available trips
app.get('/api/shows', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM shows ORDER BY start_time ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Booked Seats for a Specific Show
// This tells the frontend which seats to turn "Gray" (unavailable)
app.get('/api/shows/:id/seats', async (req, res) => {
    const { id } = req.params;
    try {
        // We only care about seats that are PENDING or CONFIRMED
        const query = `
            SELECT bs.seat_number 
            FROM booking_seats bs 
            JOIN bookings b ON bs.booking_id = b.id 
            WHERE b.show_id = $1 AND b.status IN ('PENDING', 'CONFIRMED')
        `;
        const result = await pool.query(query, [id]);
        // Return just an array of numbers, e.g., [1, 5, 20]
        res.json(result.rows.map(row => row.seat_number));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. BOOK SEATS (The Core Logic)
// This handles concurrency to prevent overbooking
app.post('/api/bookings', async (req, res) => {
    const { show_id, user_id, seat_numbers } = req.body; // seat_numbers comes as [1, 2]
    
    // We need a dedicated client for transactions
    const client = await pool.connect();

    try {
        // Start the "Transaction" - this locks the steps together
        await client.query('BEGIN');

        // Step A: Check if ANY of the requested seats are already taken
        const checkQuery = `
            SELECT bs.seat_number 
            FROM booking_seats bs 
            JOIN bookings b ON bs.booking_id = b.id 
            WHERE b.show_id = $1 
            AND bs.seat_number = ANY($2::int[])
            AND b.status IN ('PENDING', 'CONFIRMED')
        `;
        
        const checkResult = await client.query(checkQuery, [show_id, seat_numbers]);

        if (checkResult.rows.length > 0) {
            // CONFLICT! Someone booked one of these seats while you were looking
            await client.query('ROLLBACK'); // Cancel everything
            return res.status(409).json({ 
                message: "One or more seats are already booked", 
                bookedSeats: checkResult.rows.map(r => r.seat_number) 
            });
        }

        // Step B: If seats are free, Create the Booking Record
        const bookingRes = await client.query(
            'INSERT INTO bookings (user_id, show_id, status) VALUES ($1, $2, $3) RETURNING id',
            [user_id, show_id, 'CONFIRMED']
        );
        const bookingId = bookingRes.rows[0].id;

        // Step C: Reserve the specific seats
        for (const seat of seat_numbers) {
            await client.query(
                'INSERT INTO booking_seats (booking_id, seat_number) VALUES ($1, $2)',
                [bookingId, seat]
            );
        }

        // Save everything permanently
        await client.query('COMMIT');
        res.status(201).json({ message: "Booking Confirmed", bookingId });

    } catch (err) {
        // If anything goes wrong (database error), undo everything
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: "Booking Failed" });
    } finally {
        client.release(); // Release the connection back to the pool
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});