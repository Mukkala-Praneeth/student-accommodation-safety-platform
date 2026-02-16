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
- Profile Management with Password Change

### 📊 Safety Reporting System
- Verified Student Reporting
- Anonymous Public Identity ("Verified Resident")
- Categorized Incident Reporting:
  - Food Safety
  - Water Quality
  - Hygiene
  - Security
  - Infrastructure
- Cloudinary Image Evidence Upload
- Report Edit & Delete

### 👍 Upvote & Confirm System
- "I experienced this too" confirmation button
- Toggle upvote (click to confirm, click again to remove)
- Users cannot upvote their own reports
- Upvote count displayed on all report cards
- Optimistic UI updates for instant feedback

### 🧠 Accountability Architecture
- Reports linked to verified users (Prevents fake reviews)
- One user → Multiple reports tracking
- Upvote validation prevents fake confirmations
- Foundation for Trust Score & Anti-Spam Detection

### 📈 Dashboard System
- Real-time Report Data
- Safety Risk Classification Ready
- Accommodation Risk Visibility
- Paginated Report Listing

### 👤 User Profile
- View profile info (name, email, role, member since)
- Edit display name
- Change password securely
- Activity stats (total reports, upvotes received)

### 🏢 Owner Dashboard
- View reports against owned properties
- Respond to safety concerns
- Property management

### 🛡 Admin Moderation Panel
- Review submitted reports
- Approve or reject reports
- User management

---

## 🛠 Tech Stack

### 🌐 Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Library |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| React Router | Navigation |
| Context API | State Management |

### ⚙ Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Web Framework |
| MongoDB Atlas | Cloud Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt | Password Security |
| Cloudinary | Image Storage |

---

## 🧱 System Architecture

Frontend (React + TypeScript)
     ↓
Auth Context + Protected Routes
     ↓
Backend (Express REST API)
     ↓
Auth Middleware (JWT Verification)
     ↓
MongoDB Atlas (Users + Reports + Accommodations)
     ↓
Cloudinary (Image Storage)

---

## 📂 Project Structure

client/                              # React Frontend
├── src/
│   ├── components/
│   │   ├── ImageWithFallback.tsx     # Image display with loading & error states
│   │   ├── ImageGallery.tsx          # Gallery with empty state placeholder
│   │   ├── ReportCard.tsx            # Memoized report card component
│   │   ├── UpvoteButton.tsx          # Upvote toggle with optimistic updates
│   │   ├── ErrorBoundary.tsx         # Graceful error handling wrapper
│   │   └── ImageUpload.tsx           # Cloudinary upload component
│   ├── pages/
│   │   ├── Home.tsx                  # Landing page
│   │   ├── Login.tsx                 # Student login
│   │   ├── Register.tsx              # Student registration
│   │   ├── Dashboard.tsx             # Main dashboard with reports
│   │   ├── MyReports.tsx             # User reports with pagination
│   │   ├── Profile.tsx               # User profile management
│   │   ├── ReportIncident.tsx        # Submit new safety report
│   │   ├── AccommodationDetail.tsx   # Single accommodation with reports
│   │   ├── AccommodationList.tsx     # Search & browse accommodations
│   │   ├── AdminDashboard.tsx        # Admin moderation panel
│   │   ├── OwnerDashboard.tsx        # Owner property management
│   │   ├── OwnerLogin.tsx            # Owner login
│   │   └── OwnerRegister.tsx         # Owner registration
│   ├── contexts/
│   │   └── AuthContext.tsx           # Authentication state management
│   └── App.tsx                       # Router & app entry
│
server/                              # Express Backend
├── models/
│   ├── User.js                      # User schema
│   ├── Report.js                    # Report schema with upvotes
│   └── Accommodation.js             # Accommodation schema
├── middleware/
│   ├── authMiddleware.js            # JWT verification
│   └── adminMiddleware.js           # Admin role check
├── routes/
│   └── auth.js                      # Authentication routes
├── config/
│   ├── db.js                        # MongoDB connection
│   └── cloudinary.js                # Cloudinary configuration
└── server.js                        # Express app & all API routes

---

## 🔥 Implemented Features

✅ User Signup & Login API
✅ JWT Token Generation & Verification
✅ Auth Middleware Protection
✅ Role-Based Access Control (Student / Owner / Admin)
✅ User Collection (MongoDB Atlas)
✅ Report Collection (MongoDB Atlas)
✅ Accommodation Collection (MongoDB Atlas)
✅ User → Report Relational Mapping
✅ Protected Report Submission
✅ Cloudinary Image Evidence Upload
✅ My Reports with Pagination
✅ Report Edit & Delete
✅ Admin Moderation Panel (Approve / Reject)
✅ Owner Dashboard & Property Management
✅ Accommodation Search & Ratings
✅ Upvote & Confirm Reports ("I experienced this too")
✅ User Profile Page (Edit Name, Change Password, Stats)
✅ Image Error Handling (ImageWithFallback component)
✅ Error Boundaries for Graceful Crash Recovery
✅ Performance Optimizations (React.memo, useCallback, Pagination, DB Indexing)

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/signup | Register new user | No |
| POST | /api/auth/login | Login user | No |

### Reports
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/reports | Submit new report | Yes |
| GET | /api/reports/my-reports | Get user reports (paginated) | Yes |
| PUT | /api/reports/:id | Update report | Yes |
| DELETE | /api/reports/:id | Delete report | Yes |
| POST | /api/reports/:id/upvote | Toggle upvote on report | Yes |

### Profile
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/profile | Get profile with stats | Yes |
| PUT | /api/profile | Update display name | Yes |
| PUT | /api/profile/password | Change password | Yes |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/reports | Get all reports | Admin |
| PUT | /api/admin/reports/:id | Approve/Reject report | Admin |

### Owner
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/owner/reports | Get reports for owned properties | Owner |

---

## ⚡ Installation Guide

### Prerequisites
- Node.js (v16 or higher)
- npm
- MongoDB Atlas account
- Cloudinary account
- Git

### 1. Clone Repository
git clone https://github.com/YOUR_USERNAME/student-accommodation-safety-platform.git
cd student-accommodation-safety-platform

### 2. Backend Setup
cd server
npm install

Create server/.env file:
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
PORT=5000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Start backend:
npm start

### 3. Frontend Setup
cd client
npm install

Create client/.env file:
VITE_API_URL=http://localhost:5000

Start frontend:
npm run dev

### 4. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🚀 Future Roadmap

- [ ] Safety Trust Score Algorithm (0-100 dynamic scoring per accommodation)
- [ ] Email Notifications (signup, report status change, owner alerts)
- [ ] Accommodation Comparison Tool (side-by-side comparison)
- [ ] Interactive Map View with Safety Colored Pins
- [ ] Export & Share Reports (PDF download, WhatsApp sharing)
- [ ] Report Analytics Dashboard (Charts, Trends, Heatmaps)
- [ ] Anonymous Commenting on Reports

---

## 🌍 Real-World Impact

| Stakeholder | Benefit |
|-------------|---------|
| 👨‍🎓 Students | Make safer housing choices based on verified data |
| 👨‍👩‍👧 Parents | Verify accommodation safety before enrollment |
| 🏢 Good Hostels | Build genuine reputation with authentic reviews |
| 🏛️ Society | Improve overall student housing standards |
| 🏫 Universities | Partner for student welfare initiatives |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

---

## 👨‍💻 Author

**Praneeth M**
Full Stack Developer | MERN Stack | Problem Solver

---

## ⭐ If You Like This Project

Give it a ⭐ on GitHub!

---

**Made with ❤️ for student safety and welfare**