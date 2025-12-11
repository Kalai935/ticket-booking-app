# System Design Document: Ticket Booking Platform

## 1. High-Level Architecture
The system follows a **3-Tier Architecture** designed for scalability and data integrity.

- **Client (Frontend):** React.js + Vite. Hosted on Vercel. Uses Optimistic UI patterns (Polling) for real-time seat updates.
- **Server (Backend):** Node.js + Express. Stateless REST API. Hosted on Render.
- **Database:** PostgreSQL (Neon.tech). Relational model with ACID compliance.

### Concurrency Handling Strategy (Critical)
To prevent "Double Booking" (Race Conditions):
1.  **Database Level:** We use `UNIQUE` constraints on `(show_id, seat_number)` in the `booking_seats` table.
2.  **Transaction Level:** The booking logic is wrapped in a `BEGIN...COMMIT` transaction block.
3.  **Process:**
    - Step 1: Lock target rows.
    - Step 2: Check existence.
    - Step 3: Insert if empty, else Rollback.
    - This ensures that even if two requests hit the server at the exact same millisecond, the database serializes the writes.

## 2. Database Schema & Scaling
- **Normalization:** Data is split into `Shows`, `Bookings`, and `Booking_Seats` to reduce redundancy.
- **Scaling Strategy:**
    - **Read Replicas:** Since the `GET /shows` traffic is much higher than `POST /bookings`, we would use Read Replicas for fetching data.
    - **Sharding:** For a production scale (RedBus level), we would shard the database based on `show_id` or `region` to distribute write loads.

## 3. Tech Stack Choices
- **Postgres over MongoDB:** Chosen for strict schema enforcement and transactional integrity (ACID), which is non-negotiable for booking systems.
- **Polling over WebSockets:** Chosen for implementation simplicity and reliability on serverless/free-tier hosting where long-lived WebSocket connections are often terminated.

## 4. Future Improvements
- **Redis Caching:** Cache the `GET /shows` response to reduce DB load.
- **Payment Gateway:** Webhook integration for Stripe/Razorpay.