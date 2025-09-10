# 🚀 Worklyn - Modern Job Portal Platform

A full-stack job portal application built with React and Node.js, featuring secure authentication, role-based access control, and modern UI/UX design.

![Worklyn](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)

## 🌟 Features

### For Job Seekers (Candidates)
- **User Registration & Authentication** with email verification
- **Advanced Job Search** with filters (location, company, keywords)
- **Save Jobs** for later application
- **Easy Job Applications** with resume upload
- **Application Tracking** - monitor application status
- **Personalized Dashboard** to manage saved jobs and applications

### For Employers (Recruiters)
- **Company Management** - add and manage company profiles
- **Job Posting** with rich text descriptions and requirements
- **Application Management** - review and update application statuses
- **Hiring Status Control** - open/close job positions
- **Recruiter Dashboard** to manage all posted jobs

### Security & Performance
- **JWT Authentication** with secure HTTP-only cookies
- **Input Validation** with Zod schemas
- **Rate Limiting** to prevent abuse
- **Password Hashing** with bcrypt
- **Email Verification** with OTP system
- **Error Handling** with comprehensive logging
- **CORS Protection** with origin validation
- **Password Reset** functionality

## 🏗️ Tech Stack

### Frontend
- **React 19** - Modern UI library with latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Router 7** - Client-side routing
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Axios** - HTTP client with interceptors
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** with **Express 5** - Server framework
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending
- **Winston** - Logging system
- **Helmet** - Security headers
- **Multer** - File upload handling
- **Cloudinary** - Image/file storage

### DevOps & Tools
- **ESLint** - Code linting
- **Nodemon** - Development auto-restart
- **Morgan** - HTTP request logging
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- Email SMTP server (Gmail, SendGrid, etc.)
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/worklyn.git
   cd worklyn
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   **Server Environment** (`server/.env`):
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGO_URI=YOUR_MONGODV_URL
   
   # JWT Configuration
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   JWT_EXPIRES_IN=7d
   
   # CORS
   ALLOWED_ORIGINS=http://localhost:5173
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SENDER_EMAIL=your-email@gmail.com
   
   # Cloudinary (for file uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

   **Client Environment** (`client/.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1 - Start backend server
   cd server
   npm run dev
   
   # Terminal 2 - Start frontend client
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
worklyn/
├── client/                  # Frontend React application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── api/           # API service functions
│   │   ├── components/    # Reusable UI components
│   │   │   └── ui/        # Base UI components (Radix)
│   │   ├── context/       # React context providers
│   │   ├── data/          # Static data files
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Page layout components
│   │   ├── lib/           # Utility libraries
│   │   ├── pages/         # Route page components
│   │   │   └── auth/      # Authentication pages
│   │   └── utils/         # Helper functions
│   ├── package.json
│   └── vite.config.js
│
└── server/                  # Backend Node.js application
    ├── src/
    │   ├── config/         # Configuration files
    │   ├── controllers/    # Route controllers
    │   ├── middlewares/    # Express middlewares
    │   ├── models/         # MongoDB models
    │   ├── routes/         # Express routes
    │   ├── utils/          # Utility functions
    │   └── validators/     # Input validation schemas
    ├── logs/               # Application logs
    ├── uploads/            # File upload directory
    └── package.json
```

## 🔐 Authentication Flow

1. **Registration**: User creates account with email verification
2. **Email Verification**: OTP sent to email for account activation
3. **Login**: JWT token issued and stored in HTTP-only cookies
4. **Authorization**: Protected routes check JWT validity
5. **Password Reset**: Secure OTP-based password recovery

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/send-verify-otp` - Resend verification OTP
- `POST /api/auth/send-reset-code` - Send password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP

### Job Management
- `GET /api/jobs` - Get jobs with filters and pagination
- `GET /api/jobs/:id` - Get single job details
- `POST /api/jobs` - Create new job (recruiters only)
- `PATCH /api/jobs/hiring-status` - Update job status
- `DELETE /api/jobs/:id` - Delete job (recruiters only)
- `GET /api/jobs/get-my-jobs` - Get recruiter's jobs

### Applications
- `POST /api/applications/apply` - Apply to job
- `GET /api/applications` - Get user's applications
- `PATCH /api/applications/status` - Update application status

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Add new company (recruiters only)

### Saved Jobs
- `GET /api/saved-jobs` - Get saved jobs
- `POST /api/saved-jobs` - Save a job
- `DELETE /api/saved-jobs/:id` - Remove saved job

## 🛡️ Security Features

- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Protection**: MongoDB with Mongoose ODM
- **XSS Protection**: Input sanitization and CSP headers
- **Rate Limiting**: Prevents brute force attacks
- **Secure Headers**: Helmet.js security headers
- **CORS Protection**: Configurable origin validation
- **File Upload Security**: Type and size restrictions
- **Password Security**: bcrypt hashing with salt rounds
- **JWT Security**: HTTP-only cookies with expiration

