# 🎟️ Ticket Booking System (MERN + Postgres)

A production-grade Ticket Booking System simulating platforms like **RedBus** or **BookMyShow**. This project features a high-performance backend capable of handling **concurrent booking requests** to prevent race conditions (double bookings) and a modern, responsive frontend with real-time feedback.

---

## 🚀 Live Demo

- **Frontend (Live App):** [https://ticket-booking-app-olive.vercel.app/](https://ticket-booking-app-olive.vercel.app/)
- **Backend (API):** [https://ticket-backend-j8o6.onrender.com/api/shows](https://ticket-backend-j8o6.onrender.com/api/shows)
- **Video Walkthrough:** [PASTE YOUR YOUTUBE/DRIVE LINK HERE]

> **Note:** The backend is hosted on Render's Free Tier. It may take **50-60 seconds to "wake up"** on the first request. Please be patient if the initial load takes a moment!

---

## 🌟 Key Features

### 🛡️ Core Functionality
- **Admin:** Create new shows/trips with custom seat capacities.
- **User:** View available trips and book specific seats.
- **Real-time Status:** Visual indicators for Available (White), Selected (Indigo), and Booked (Dark) seats.

### ⚡ Concurrency Handling (The "Innovation")
- **ACID Transactions:** Uses PostgreSQL transactions (`BEGIN` ... `COMMIT`) to ensure atomicity.
- **Race Condition Prevention:** Implements logic to check seat availability *inside* the transaction block. If two users try to book the same seat simultaneously, the database locks the rows, processes the first request, and rejects the second with a `409 Conflict` error.

### 🎨 Modern UI/UX
- **Glassmorphism Design:** Modern, clean interface with blur effects.
- **Optimistic UI:** Instant visual feedback with animated Modals (Popups) for success or failure states.
- **Responsive:** Fully functional on Mobile and Desktop.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | TypeScript, Context API, Lucide React Icons |
| **Backend** | Node.js | Express.js REST API |
| **Database** | PostgreSQL | Neon.tech (Cloud), `pg` library for raw SQL queries |
| **Deployment** | Vercel & Render | CI/CD via GitHub |

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
- Node.js (v16+)
- PostgreSQL Database (Local or Cloud URL)

### 1. Clone the Repository
```bash
git clone https://github.com/Kalai935/ticket-booking-app.git
cd ticket-booking-app

2. Backend Setup
```bash
cd backend
npm install

# Create a .env file
echo "DATABASE_URL=your_postgres_connection_string" > .env

# Initialize Database Tables
node init.js

# Start Server
node index.js

Server runs on: http://localhost:5000

3. Frontend Setup

cd ../frontend
npm install

# Start React Dev Server
npm run dev

App runs on: http://localhost:5173

💾 Database Schema
The system uses a normalized relational schema to ensure data integrity.
-- Shows Table
CREATE TABLE shows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    total_seats INT NOT NULL
);

-- Bookings Table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    show_id INT REFERENCES shows(id),
    status VARCHAR(20) DEFAULT 'CONFIRMED'
);

-- Seats Table (The Concurrency Controller)
CREATE TABLE booking_seats (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id),
    seat_number INT NOT NULL,
    UNIQUE(booking_id, seat_number) -- Prevents duplicate entries
);

📖 API Documentation

1. Get All Shows
Endpoint: GET /api/shows
Response: List of all available trips.

2. Get Booked Seats
Endpoint: GET /api/shows/:id/seats
Response: Array of seat numbers that are already taken (e.g., [1, 5, 20]).

3. Create Booking (Transactional)

Endpoint: POST /api/bookings
Body: { "show_id": 1, "user_id": 123, "seat_numbers": [1, 2] }
Returns:
201 Created: Booking successful.
409 Conflict: "One or more seats are already booked" (Concurrency protection).

✅ Assumptions & Limitations
Auth: User authentication is mocked (random User IDs are generated per session) as per assignment scope.

Payment: The system assumes immediate confirmation upon booking (Payment Gateway integration is out of scope).

Timezone: All times are handled in UTC/Server time.

📞 Contact
Developer: Kalai M
GitHub: https://github.com/Kalai935

