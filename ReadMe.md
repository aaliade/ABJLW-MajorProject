


### Node Js Setup

Linux commands to setup node:
```
sudo apt install nodejs
sudo apt install npm

```
_Node Js version should be above 14.6.0_
```
node -v
```

# TRASHNAV 🗑️🚛

### Optimizing garbage collection routes using user-generated data.

---

## 📌 Table of Contents
1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Setup & Installation](#-setup--installation)
6. [Core Activities](#-core-activities)
7. [API Endpoints](#-api-endpoints)
8. [Database Schema](#-database-schema)
9. [Security & Privacy](#-security--privacy)
10. [Contributing](#-contributing)
11. [License](#-license)

---

## 🚀 Project Overview
This **Next.js (TypeScript) application** allows users to:
✅ Take & upload photos of garbage.  
✅ Help optimize garbage collection routes.  
✅ Earn rewards for participation.  

We use **cookies** for anonymous user tracking and store data in a **Neon database via Drizzle ORM**.

---

## ✨ Features
- **User Contributions**: Upload images of garbage with location data.
- **Route Optimization**: AI-based garbage truck routing.
- **Gamification**: Users earn points & rewards.
- **Data Privacy**: No personal data is collected, only cookies.
- **Admin Dashboard**: Monitor & analyze waste patterns.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js (TypeScript), Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Anonymous user tracking via cookies
- **Storage**: Cloudinary for image uploads
- **Deployment**: Vercel

---

## 📂 Project Structure
```
/src  
  /app  
    /api  -> API routes (image upload, rewards, tracking)  
    /components  -> UI components  
    /hooks  -> Custom React hooks  
    /models  -> Drizzle ORM database models  
    /styles  -> Tailwind CSS styles  
    /utils  -> Helper functions  
```

---

## ⚙️ Setup & Installation
### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-repo.git
cd your-repo
```

### 2️⃣ Install dependencies
```bash
pnpm install
```

### 3️⃣ Setup environment variables
Create a `.env.local` file and add:
```
DATABASE_URL=your_neon_db_url
CLOUDINARY_API_KEY=your_cloudinary_key
```

### 4️⃣ Run the development server
```bash
pnpm dev
```

---

## 📌 Core Activities
### 1️⃣ User Image Upload
- Users take photos and upload garbage images.
- Stored securely on Cloudinary.

### 2️⃣ Garbage Route Optimization
- System calculates the most **efficient garbage collection routes**.
- Uses AI-based pathfinding algorithms.

### 3️⃣ User Tracking (Cookies)
- A **unique identifier** (not personal data) is stored via cookies.
- If cookies are cleared, we use **fingerprinting** as a fallback.

### 4️⃣ Reward System
- Users earn **points** for uploading images.
- Points can be redeemed for **badges or discounts**.

### 5️⃣ Admin Dashboard
- Monitor **garbage distribution** & track **collection efficiency**.
- View **leaderboards** & user engagement.

---

## 📡 API Endpoints
| Endpoint                  | Method | Description |
|---------------------------|--------|-------------|
| `/api/upload`             | POST   | Uploads an image |
| `/api/route`              | GET    | Fetch optimized garbage collection routes |
| `/api/rewards`            | POST   | Add points for user actions |
| `/api/leaderboard`        | GET    | Retrieve top users |

---

## 🗄️ Database Schema
### Users Table
| Column   | Type     | Description       |
|----------|---------|------------------|
| `id`     | Serial  | Primary Key      |
| `user_id` | String  | Unique ID       |
| `points` | Integer | Reward points    |

### Garbage Uploads Table
| Column     | Type    | Description            |
|------------|--------|------------------------|
| `id`       | Serial | Primary Key            |
| `image_url` | String | Cloudinary Image URL |
| `lat`      | Float  | Latitude               |
| `lng`      | Float  | Longitude              |

---

## 🔐 Security & Privacy
✅ No personal data collected  
✅ Uses **cookies** and **anonymous identifiers**  
✅ Secure API endpoints with validation  
✅ All images stored **securely**  

---

## 👨‍💻 Contributing
1. Fork the repo  
2. Create a new branch (`feature-name`)  
3. Commit your changes  
4. Open a Pull Request  

---

## 📜 License
MIT License - Open-source and free to use.  

---
