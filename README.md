# 🎯 Student Accommodation Safety Platform

A production-quality full-stack web application designed to ensure safety and transparency in student accommodations (Hostels, PGs, Private Student Housing).

This platform enables verified students to report safety issues securely, helps future students make informed decisions, and creates accountability for accommodation providers.

## 🚀 Why This Platform Exists

Students often choose accommodation based on fake or manipulated online reviews, broker influence, misleading advertisements, and lack of verified safety data.

This leads to real-world risks: food poisoning incidents, poor sanitation, unsafe infrastructure, security threats, and water quality issues.

This platform introduces verified, accountable, student-driven safety intelligence.

## ⭐ Features

### 🔐 Authentication & Security
- JWT-based Secure Authentication
- Password Hashing using bcrypt
- Role-Based User System (Student / Owner / Admin)
- Protected API Routes
- Separate login portals for Students and Owners
- Token-based Session Management

### 📊 Student Features
- Submit Safety Reports (Food, Water, Hygiene, Security, Infrastructure)
- Personal Reports Dashboard (My Reports)
- Edit and Delete own reports with modal forms
- View all public reports on Dashboard
- Risk classification and filtering
- Report submission with category selection

### 🏠 Accommodation Owner Features
- Separate Owner Registration and Login
- Owner Dashboard with Analytics (4 tabs)
- Add/Edit/Delete Accommodations
- View Reports on own properties
- Counter fake/incorrect reports with evidence
- Room Occupancy Management
- Amenities and Pricing Management
- Counter Report status tracking

### 🛡️ Admin Features
- Admin Dashboard with Statistics
- Approve/Reject/Delete any report
- View and manage all users
- Ban/Unban users
- Review Counter Reports from owners
- Reports by Issue Type analytics bar chart
- Pending/Approved/Rejected report counts

### 📈 Dashboard System
- Real-time Report Data
- Safety Risk Classification
- Accommodation Risk Visibility
- Issue Type Statistics
- Role-based dashboard views

## 🛠 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Context API (Auth State)
- React Icons

### Backend
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT Authentication
- bcrypt Password Hashing
- Role-based Middleware (Auth, Admin, Owner)

## 📂 Project Structure

```
client/ → React Frontend
├── src/
│ ├── components/ → Header, ProtectedRoute
│ ├── contexts/ → AuthContext
│ ├── pages/
│ │ ├── Login.tsx → Student login
│ │ ├── Register.tsx → Student registration
│ │ ├── Dashboard.tsx → Public reports dashboard
│ │ ├── MyReports.tsx → Personal reports with edit/delete
│ │ ├── ReportIncident.tsx → Submit safety report
│ │ ├── AdminDashboard.tsx → Admin moderation panel
│ │ ├── OwnerLogin.tsx → Owner login
│ │ ├── OwnerRegister.tsx → Owner registration
│ │ └── OwnerDashboard.tsx → Owner management portal
│ └── config.ts → API URL configuration

server/ → Express Backend
├── models/
│ ├── User.js → User model with roles and ban status
│ ├── Report.js → Report model with status and counter fields
│ ├── Accommodation.js → Accommodation model
│ └── CounterReport.js → Counter report model
├── middleware/
│ ├── authMiddleware.js → JWT verification
│ ├── adminMiddleware.js → Admin role check
│ └── ownerMiddleware.js → Owner role check
├── routes/
│ └── auth.js → Authentication routes
└── server.js → Main server with all API routes
```

## 🔥 API Endpoints

### Authentication
```
POST /api/auth/signup → Student registration
POST /api/auth/login → User login (all roles)
POST /api/auth/register-owner → Owner registration
```

### Reports (Student)
```
GET /api/reports → Get all reports
GET /api/reports/my-reports → Get user's own reports
POST /api/reports → Submit new report
PUT /api/reports/:id → Edit own report
DELETE /api/reports/:id → Delete own report
```

### Admin
```
GET /api/admin/stats → Dashboard statistics
GET /api/admin/reports → All reports with user details
PUT /api/admin/reports/:id/status → Approve/reject report
DELETE /api/admin/reports/:id → Delete any report
GET /api/admin/users → All users
PUT /api/admin/users/:id/ban → Ban/unban user
GET /api/admin/counter-reports → All counter reports
PUT /api/admin/counter-reports/:id → Review counter report
```

### Owner
```
GET /api/owner/stats → Owner dashboard stats
GET /api/owner/accommodations → Owner's accommodations
POST /api/owner/accommodations → Add accommodation
PUT /api/owner/accommodations/:id → Update accommodation
DELETE /api/owner/accommodations/:id → Delete accommodation
PUT /api/owner/accommodations/:id/occupancy → Update room occupancy
GET /api/owner/reports → Reports on owner's properties
POST /api/owner/counter-report → Submit counter report
GET /api/owner/counter-reports → Owner's counter reports
```

## ⚡ Installation

### Backend Setup
```bash
cd server
npm install
npm start
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Environment Variables

**Backend (.env):**
```
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
PORT=5000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
```

## 🧱 System Architecture

```
Frontend (React + TypeScript)
↓
Auth Context + Protected Routes + Role-Based Navigation
↓
Backend (Express REST API)
↓
Auth/Admin/Owner Middleware (JWT + Role Verification)
↓
MongoDB Atlas (Users + Reports + Accommodations + CounterReports)
```

## 🌍 Real-World Impact
- 👨‍🎓 Students → Make safer housing choices
- 👨‍👩‍👧 Parents → Verify accommodation safety
- 🏢 Good Hostels → Build real reputation through transparency
- 🏛 Society → Improve student housing standards

## 🚀 Future Roadmap
- Image Evidence Upload (Cloud Storage)
- Email / Notification Alerts
- Trust Score for Review Authenticity
- Advanced Analytics Dashboard
- Mobile App Version

## 👨‍💻 Author
Praneeth M
Full Stack Developer | MERN Stack | Problem Solver

⭐ If you find this project useful, give it a star on GitHub!
