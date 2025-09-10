# 📧 Mini CRM Campaigns (MERN + Redis Queue)

A lightweight CRM-like campaign system built with the MERN stack + Upstash Redis.  
It demonstrates **segment-based targeting, message queueing, async delivery, retry handling, and live campaign stats**.

---

## 🚀 Tech Stack

- **Frontend:** React (Vite) + CSS (custom-styled, fallback from Tailwind)  
- **Backend:** Node.js + Express (ESM imports)  
- **Database:** MongoDB (Mongoose ODM)  
- **Queue:** Upstash Redis (`@upstash/redis`) for delivery jobs  
- **Worker:** Node.js service consuming Redis queue  
- **Auth:** JWT (simple Dev Login for local testing)  
- **Vendor:** Simulator endpoint (random SENT/FAILED to mimic Twilio/Msg91/etc.)  

---

## 🔄 System Architecture

```mermaid
flowchart TD
    A[Frontend (React UI)] -->|Create Campaign| B[Backend API (Express)]
    B -->|Insert Audience & CommLogs| C[(MongoDB)]
    B -->|Enqueue Log IDs| D[(Upstash Redis Queue)]
    D -->|RPOP| E[Worker Service]
    E -->|Send Message| F[Vendor Simulator]
    F -->|Callback / Update| B
    B -->|Update Stats & Logs| C
    B -->|Fetch Stats/Logs| A
