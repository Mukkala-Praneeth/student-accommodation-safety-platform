# Student Accommodation Safety Platform

A comprehensive, production-quality web application built to ensure the safety and well-being of students in various accommodations (hostels, PGs, private student housing). 

This platform allows students to report safety issues anonymously but securely, view safety classifications of different accommodations, and enables accommodation owners to respond to complaints with counter-evidence.

## 🎯 Core Features

- **User Authentication:** Secure registration and login for students, owners, and administrators.
- **Safety Classification:** Dynamic safety badges (Safe, Risky, High Risk) based on real-time report analysis.
- **Anonymous Verified Reporting:** Verified residents can report issues anonymously to prevent retaliation.
- **Categorized Reporting:** Report issues across various categories: Food, Water, Hygiene, Security, and Infrastructure.
- **Evidence Management:** Upload image evidence for incidents (UI simulation implemented).
- **Owner Resolution System:** Accommodation owners can view complaints, respond, provide counter-evidence, and dispute claims.
- **Admin Dashboard:** Centralized view for administrators to monitor high-risk accommodations and handle disputes.
- **Search & Filter:** Find accommodations easily by name, location, or safety status.

## 💻 Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** React Icons (Lucide React / Feather)
- **Routing:** React Router DOM
- **State Management:** React Context API

## 📂 Project Structure

```
├── src/
│   ├── components/      # Reusable UI components (Header, Footer, Cards)
│   ├── contexts/        # Global state (Auth, Accommodations)
│   ├── pages/           # Route components (Home, Dashboard, Admin, etc.)
│   ├── App.tsx          # Main application component & Routing setup
│   ├── index.css        # Global styles & Tailwind imports
│   └── main.tsx         # React entry point
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
└── vite.config.ts       # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install project dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## 🔐 Demo Credentials

The application uses simulated local state for demonstration. You can register a new account or use the standard flows to explore:
- **Student Flow:** Register as a new user, view the dashboard, and submit reports.
- **Admin Flow:** Navigate to the `/admin` route to see the centralized management dashboard.

## 🏗️ Architecture Notes

This repository contains the complete Frontend Implementation of the platform. For a full production deployment, this frontend should be connected to:
- A backend API (Node.js/Express, Python/Django, etc.)
- A relational database (PostgreSQL) for structured data (Users, Accommodations, Reports)
- Cloud storage (AWS S3) for evidence image uploads
- A mapping service (Google Maps API / Mapbox) for the geographical views.
