# 🎯 Student Accommodation Safety Platform

A production-quality full-stack web application designed to ensure safety and transparency in student accommodations (Hostels, PGs, Private Student Housing).

This platform enables **verified students** to report safety issues securely, helps future students make informed decisions, and creates accountability for accommodation providers.

---

## 🚀 Why This Platform Exists

Students often choose accommodation based on:
- Fake or manipulated online reviews
- Broker influence
- Misleading advertisements
- Lack of verified safety data

This leads to real-world risks:
- Food poisoning incidents
- Poor sanitation
- Unsafe infrastructure
- Security threats
- Water quality issues

This platform introduces **verified, accountable, student-driven safety intelligence**.

---

## ⭐ Core Features

### 🔐 Authentication & Security
- JWT-based Secure Authentication
- Password Hashing using bcrypt
- Role-Based User System (Student / Owner / Admin)
- Protected API Routes

---

### 📊 Safety Reporting System
- Verified Student Reporting
- Anonymous Public Identity ("Verified Resident")
- Categorized Incident Reporting:
  - Food Safety
  - Water Quality
  - Hygiene
  - Security
  - Infrastructure
- Evidence Upload UI Support

---

### 🧠 Accountability Architecture
- Reports linked to verified users (Prevents fake reviews)
- One user → Multiple reports tracking
- Foundation for Trust Score & Anti-Spam Detection

---

### 📈 Dashboard System
- Real-time Report Data
- Safety Risk Classification Ready
- Accommodation Risk Visibility

---

## 🛠 Tech Stack

### 🌐 Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Context API (Auth State)

---

### ⚙ Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose ODM

---

### 🔐 Security Layer
- JWT Authentication
- bcrypt Password Hashing
- Auth Middleware Protection
- Token-based Session Management

---

## 🧱 System Architecture

```
Frontend (React)
     ↓
Auth Context + Protected Routes
     ↓
Backend (Express REST API)
     ↓
Auth Middleware (JWT Verification)
     ↓
MongoDB Atlas (Users + Reports Collections)
```

---

## 📂 Project Structure

```
client/   → React Frontend
server/   → Express Backend + MongoDB Models + Auth Middleware
```

---

## 🔥 Current Implemented Backend Features

✅ User Signup & Login API  
✅ JWT Token Generation  
✅ Auth Middleware Protection  
✅ User Collection (MongoDB Atlas)  
✅ Report Collection (MongoDB Atlas)  
✅ User → Report Relational Mapping  
✅ Protected Report Submission  

---

## 🚀 Future Roadmap

- My Reports Dashboard
- Admin Moderation Panel
- Automatic Risk Classification Engine
- Image Evidence Upload (Cloud Storage)
- Email / Notification Alerts
- Trust Score for Review Authenticity

---

## 🌍 Real-World Impact

👨‍🎓 Students → Make safer housing choices  
👨‍👩‍👧 Parents → Verify accommodation safety  
🏢 Good Hostels → Build real reputation  
🏛 Society → Improve student housing standards  

---

## ⚡ Installation Guide

### Backend Setup
```
cd server
npm install
npm start
```

### Frontend Setup
```
cd client
npm install
npm run dev
```

---

## 👨‍💻 Author

**Praneeth M**  
Full Stack Developer | MERN Stack | Problem Solver  

---

## ⭐ If You Like This Project

Give it a ⭐ on GitHub!
