# 📧 Mini CRM Campaigns (MERN + Redis Queue)

A lightweight CRM-like campaign system built with the **MERN stack** and **Upstash Redis**.  
It demonstrates **segment-based targeting, message queueing, async delivery, retry handling, and live campaign stats**.

---

## Tech Stack

- **Frontend:** React (Vite) + CSS (custom-styled, fallback from Tailwind)  
- **Backend:** Node.js + Express (ESM imports)  
- **Database:** MongoDB (Mongoose ODM)  
- **Queue:** Upstash Redis (`@upstash/redis`) for delivery jobs  
- **Worker:** Node.js service consuming Redis queue  
- **Auth:** JWT (simple Dev Login for local testing)  
- **Vendor:** Simulator endpoint (random `SENT` / `FAILED` to mimic Twilio/Msg91/etc.)  

---

## 🔄 System Architecture

### Flow

1. **Frontend (React UI)**  
   👉 User creates a new campaign

2. **Backend (Express API)**  
   - Stores audience + communication logs in **MongoDB**  
   - Pushes message jobs into **Redis Queue**

3. **Redis Queue (Upstash)**  
   - Holds jobs until a **Worker Service** picks them up

4. **Worker Service (Node.js)**  
   - Dequeues jobs from Redis  
   - Sends them to **Vendor Simulator**

5. **Vendor Simulator (Mock SMS/Email provider)**  
   - Randomly returns **SENT** or **FAILED**

6. **Callback Handling (Backend API again)**  
   - If **SENT** → update MongoDB logs + stats  
   - If **FAILED** → retry job (up to 3 times)  
   - After 3 failures → mark as permanently failed  

7. **Frontend (React UI)**  
   👉 Fetches updated campaign stats & logs in real time  

---

## ✨ Features

- Create and manage campaigns from the UI  
- Segment-based customer targeting  
- Asynchronous delivery with Redis queue  
- Retry mechanism for failed deliveries  
- Vendor simulator integration  
- Live campaign stats and logs  
- JWT-based authentication (for dev/demo use)  

---

## ⚡ Worker Service

- Consumes jobs from **Upstash Redis**  
- Sends messages to **Vendor Simulator**  
- Handles **retries** with exponential backoff  
- Updates campaign stats in **MongoDB**  

---
## Architecture
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/2940b4b0-4e87-4366-960f-e653298af136" />


## 🛠️ Installation & Setup

```bash
# Clone repository
git clone 
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install

---
