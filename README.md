# OpenLesson - Volunteer Teaching Platform

A comprehensive web application that connects volunteer teachers with underprivileged students, providing a platform for learning, mentorship, and donations.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Testing Instruction Report](#testing-instruction-report)

---

## Overview

OpenLesson is a MERN (MongoDB, Express, React, Node.js) stack application that facilitates educational support through:
- **Students**: Access study materials, attempt quizzes, join live sessions, and provide feedback
- **Teachers**: Create and manage study materials, conduct quizzes and online sessions, track student progress
- **Donors**: Make donations, track contribution history, support educational campaigns
- **Admins**: Manage users, grades, subjects, announcements, and system-wide operations

---

## Features

### Student Module
- User registration and authentication
- Access study materials and study sessions
- Take quizzes and track scores
- Join Zoom-based live classes
- Submit feedback and complaints
- View grades and progress

### Teacher Module
- Teacher registration with CV upload
- Create and manage study materials
- Design and administer quizzes
- Schedule and conduct online sessions
- Monitor student progress
- Manage announcements

### Donation Module
- Secure payment integration (PayHere)
- Donation tracking and history
- Subscription management
- Campaign-based donations

### Admin Module
- User management (approve/reject users)
- Manage grades, subjects, and announcements
- Handle complaints and feedback
- View system analytics

---

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email**: Nodemailer
- **AI Integration**: Google Generative AI
- **Payment**: PayHere API
- **Video Conferencing**: Zoom API

### Frontend
- **Framework**: React.js 19.2.4
- **Build Tool**: Vite
- **Routing**: React Router DOM 7.13.1
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Management**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React

### Tools & DevOps
- **Version Control**: GitHub
- **Code Editor**: Visual Studio Code
- **Dev Environment**: Nodemon
- **Tunneling**: ngrok

---

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas account)
- npm or yarn
- Git

### Backend Setup

#### 1. Clone and Navigate to Backend
```bash
cd openlesson/backend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Create Environment File
Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Admin Credentials (for seeding)
ADMIN_EMAIL=admin@openlesson.com
ADMIN_PASSWORD=YourStrongPassword

# Email Service (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Payment Gateway (PayHere)
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
PAYHERE_NOTIFY_URL=https://your_domain/api/payments/payhere/notify

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Zoom Configuration
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

#### 4. Connect to MongoDB
Ensure MongoDB is running:
- **Local MongoDB**: `mongod`
- **MongoDB Atlas**: Ensure network access is configured

#### 5. Seed Initial Admin User
```bash
npm run seed:admin
```

#### 6. Run Backend Server
```bash
# Development mode (with live reload)
npm run dev

# Production mode
npm start
```

The backend will start on `http://localhost:5000`

---

### Frontend Setup

#### 1. Navigate to Frontend Directory
```bash
cd openlesson/frontend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Create Environment File
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

#### 4. Run Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

#### 5. Build for Production
```bash
npm run build
```

---

## Project Structure

```
openlesson/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app configuration
│   │   ├── config/
│   │   │   └── db.js           # MongoDB connection
│   │   ├── controllers/        # Business logic
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Custom middleware
│   │   ├── utils/              # Helper functions
│   │   └── scripts/            # Utility scripts
│   ├── server.js               # Entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom hooks
│   │   └── assets/             # Images and static files
│   ├── vite.config.js
│   ├── package.json
│   └── .env
└── README.md
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Response Format
All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Authentication

### Authentication Method
The API uses **JWT (JSON Web Tokens)** for authentication.

### Getting a Token
1. Register or login using the `/api/auth/login` endpoint
2. The response will include a JWT token
3. Include the token in all subsequent requests in the Authorization header

### Using the Token
Include the token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### Token Storage
- Store the token in localStorage on the client side
- Include it in all API requests to protected endpoints
- Token expires in 7 days

### User Types
- `student`: Student accounts
- `teacher`: Teacher accounts
- `donor`: Donor accounts
- `admin`: Administrator accounts

---

## API Endpoints

### 1. Authentication Routes (`/api/auth`)

#### Register User
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "student",
  "phone": "+1234567890",
  "address": "123 Main St",
  "cv": "(file upload - for teachers only)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "userType": "student",
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

**Status Codes:**
- `201` Created
- `400` Bad Request
- `409` Email already exists

---

#### Login User
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "userType": "student",
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

**Status Codes:**
- `200` OK
- `401` Invalid credentials
- `404` User not found

---

#### Get Current User
```
GET /api/auth/me
```

**Authentication:** Required ✓

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "student",
    "status": "active"
  }
}
```

**Status Codes:**
- `200` OK
- `401` Not authorized

---

#### Change Password
```
PUT /api/auth/password
```

**Authentication:** Required ✓

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Status Codes:**
- `200` OK
- `400` Invalid current password
- `401` Not authorized

---

### 2. Student Routes (`/api/students`)

#### Get My Profile
```
GET /api/students/my-profile
```

**Authentication:** Required ✓

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "student_id",
    "userId": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "student@example.com",
    "phone": "+1234567890",
    "grade": "10",
    "parentContact": "+9876543210",
    "status": "active",
    "profilePictureUrl": "path/to/image.jpg"
  }
}
```

**Status Codes:**
- `200` OK
- `401` Not authorized

---

#### Update My Profile
```
PUT /api/students/my-profile
```

**Authentication:** Required ✓

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "grade": "10",
  "parentContact": "+9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated student profile */ },
  "message": "Profile updated successfully"
}
```

**Status Codes:**
- `200` OK
- `401` Not authorized

---

#### Upload Profile Picture
```
PUT /api/students/upload-picture
```

**Authentication:** Required ✓

**Request:** Form Data
- `profilePicture`: Image file

**Response:**
```json
{
  "success": true,
  "data": { /* updated student profile with new image URL */ }
}
```

**Status Codes:**
- `200` OK
- `400` Invalid file
- `401` Not authorized

---

#### Get Student Profile by ID
```
GET /api/students/profile/:id
```

**Authentication:** Required ✓

**Path Parameters:**
- `id`: Student ID

**Response:**
```json
{
  "success": true,
  "data": { /* student profile */ }
}
```

**Status Codes:**
- `200` OK
- `404` Student not found

---

#### Admin: Get All Students
```
GET /api/students/admin/all
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Response:**
```json
{
  "success": true,
  "data": [ /* array of student profiles */ ]
}
```

**Status Codes:**
- `200` OK
- `403` Not authorized

---

#### Admin: Get Student Details
```
GET /api/students/admin/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Path Parameters:**
- `id`: Student ID

**Response:**
```json
{
  "success": true,
  "data": { /* student profile with additional admin info */ }
}
```

---

#### Admin: Update Student Status
```
PUT /api/students/admin/:id/status
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Status Codes:**
- `200` OK
- `403` Not authorized

---

#### Admin: Delete Student
```
DELETE /api/students/admin/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Path Parameters:**
- `id`: Student ID

**Status Codes:**
- `200` OK
- `403` Not authorized

---

### 3. Teacher Routes (`/api/teachers`)

#### Get All Teachers (Public)
```
GET /api/teachers
```

**Response:**
```json
{
  "success": true,
  "data": [ /* array of teacher profiles */ ]
}
```

---

#### Get My Teacher Profile
```
GET /api/teachers/my-profile
```

**Authentication:** Required ✓

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "teacher_id",
    "userId": "user_id",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "teacher@example.com",
    "qualifications": "M.Sc Computer Science",
    "experience": "5",
    "subject": "Computer Science",
    "bio": "Experienced teacher",
    "cvUrl": "path/to/cv.pdf",
    "status": "approved",
    "profilePictureUrl": "path/to/image.jpg"
  }
}
```

---

#### Get Teacher Profile by ID
```
GET /api/teachers/profile/:id
```

**Authentication:** Required ✓

**Path Parameters:**
- `id`: Teacher ID

---

#### Update Teacher Profile
```
PUT /api/teachers/:id
```

**Authentication:** Required ✓

**Request Body:**
```json
{
  "qualifications": "M.Sc",
  "experience": "5",
  "subject": "Computer Science",
  "bio": "Teacher bio"
}
```

---

#### Admin: Get All Teachers
```
GET /api/teachers/admin/all
```

**Authentication:** Required ✓
**Authorization:** Admin only

---

#### Admin: Get Teacher Details
```
GET /api/teachers/admin/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

---

#### Admin: Approve Teacher
```
PUT /api/teachers/admin/:id/approve
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Request Body:**
```json
{
  "status": "approved"
}
```

---

#### Admin: Reject Teacher
```
PUT /api/teachers/admin/:id/reject
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Request Body:**
```json
{
  "status": "rejected",
  "rejectionReason": "Qualifications not verified"
}
```

---

#### Admin: Download Teacher CV
```
GET /api/teachers/:id/cv-download
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Response:** PDF file download

---

### 4. Quiz Routes (`/api/quizzes`)

#### Create Quiz
```
POST /api/quizzes
```

**Authentication:** Required ✓
**Authorization:** Teacher, Admin

**Request Body:**
```json
{
  "title": "Math Quiz",
  "description": "Basic mathematics",
  "subject": "Mathematics",
  "grade": "10",
  "questions": [
    {
      "question": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": "4",
      "points": 10
    }
  ],
  "totalPoints": 10,
  "duration": 30,
  "dueDate": "2024-12-31"
}
```

---

#### Get All Quizzes
```
GET /api/quizzes
```

**Response:**
```json
{
  "success": true,
  "data": [ /* array of quizzes */ ]
}
```

---

#### Get Quiz by ID
```
GET /api/quizzes/:id
```

**Path Parameters:**
- `id`: Quiz ID

---

#### Update Quiz
```
PUT /api/quizzes/:id
```

**Authentication:** Required ✓
**Authorization:** Teacher, Admin

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "questions": [ /* updated questions */ ]
}
```

---

#### Delete Quiz
```
DELETE /api/quizzes/:id
```

**Authentication:** Required ✓
**Authorization:** Teacher, Admin

---

### 5. Study Material Routes (`/api/study-materials`)

#### Create Study Material
```
POST /api/study-materials
```

**Authentication:** Required ✓
**Authorization:** Teacher, Admin

**Request Body:**
```json
{
  "title": "Introduction to Python",
  "description": "Basics of Python programming",
  "subject": "Computer Science",
  "grade": "10",
  "content": "Long form content or HTML",
  "fileUrl": "path/to/file.pdf",
  "fileType": "pdf",
  "duration": 45
}
```

---

#### Get All Study Materials
```
GET /api/study-materials
```

**Response:**
```json
{
  "success": true,
  "data": [ /* array of study materials */ ]
}
```

---

#### Get Study Material by ID
```
GET /api/study-materials/:id
```

**Path Parameters:**
- `id`: Study Material ID

---

#### Update Study Material
```
PUT /api/study-materials/:id
```

**Authentication:** Required ✓
**Authorization:** Teacher, Admin

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "content": "Updated content"
}
```

---

#### Delete Study Material
```
DELETE /api/study-materials/:id
```

**Authentication:** Required ✓
**Authorization:** Teacher, Admin

---

### 6. Study Session Routes (`/api/study-sessions`)

#### Get All Study Sessions
```
GET /api/study-sessions
```

**Authentication:** Required ✓
**Authorization:** Teacher, Admin

**Response:**
```json
{
  "success": true,
  "data": [ /* array of study sessions */ ]
}
```

---

#### Get Study Session by ID
```
GET /api/study-sessions/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "session_id",
    "title": "Math Class",
    "description": "Session description",
    "teacher": "teacher_id",
    "subject": "Mathematics",
    "grade": "10",
    "scheduledDate": "2024-12-20",
    "startTime": "10:00",
    "endTime": "11:00",
    "zoomLink": "https://zoom.us/...",
    "zoomMeetingId": "123456789",
    "status": "scheduled",
    "attendees": [ /* array of student IDs */ ]
  }
}
```

---

#### Create Study Session
```
POST /api/study-sessions
```

**Authentication:** Required ✓
**Authorization:** Teacher, Admin

**Request Body:**
```json
{
  "title": "Math Class",
  "description": "Session description",
  "subject": "Mathematics",
  "grade": "10",
  "scheduledDate": "2024-12-20",
  "startTime": "10:00",
  "endTime": "11:00"
}
```

The API will automatically create a Zoom meeting and provide the link.

---

#### Update Study Session
```
PUT /api/study-sessions/:id
```

**Authentication:** Required ✓
**Authorization:** Teacher, Admin

**Request Body:**
```json
{
  "title": "Updated Title",
  "scheduledDate": "2024-12-21",
  "startTime": "14:00"
}
```

---

#### Delete Study Session
```
DELETE /api/study-sessions/:id
```

**Authentication:** Required ✓
**Authorization:** Teacher, Admin

---

### 7. Announcement Routes (`/api/announcements`)

#### Get All Announcements
```
GET /api/announcements
```

**Response:**
```json
{
  "success": true,
  "data": [ /* array of announcements */ ]
}
```

---

#### Get Announcement by ID
```
GET /api/announcements/:id
```

**Path Parameters:**
- `id`: Announcement ID

---

#### Create Announcement
```
POST /api/announcements
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Request Body:**
```json
{
  "title": "System Maintenance",
  "content": "System will be under maintenance...",
  "priority": "high",
  "targetAudience": "all",
  "expiryDate": "2024-12-31"
}
```

---

#### Update Announcement
```
PUT /api/announcements/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

---

#### Delete Announcement
```
DELETE /api/announcements/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

---

### 8. Grade Routes (`/api/grades`)

#### Get All Grades
```
GET /api/grades
```

**Response:**
```json
{
  "success": true,
  "data": [ /* array of grades */ ]
}
```

---

#### Get Grade by ID
```
GET /api/grades/:id
```

**Path Parameters:**
- `id`: Grade ID

---

#### Create Grade
```
POST /api/grades
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Request Body:**
```json
{
  "student": "student_id",
  "subject": "Mathematics",
  "grade": "A",
  "score": "95",
  "semester": "1",
  "academicYear": "2024"
}
```

---

#### Update Grade
```
PUT /api/grades/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Request Body:**
```json
{
  "grade": "B",
  "score": "85"
}
```

---

#### Delete Grade
```
DELETE /api/grades/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

---

### 9. Subject Routes (`/api/subjects`)

#### Get All Subjects
```
GET /api/subjects
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "subject_id",
      "name": "Mathematics",
      "code": "MATH101",
      "description": "Basic mathematics"
    }
  ]
}
```

---

#### Get Subject by ID
```
GET /api/subjects/:id
```

---

#### Create Subject
```
POST /api/subjects
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Request Body:**
```json
{
  "name": "Computer Science",
  "code": "CS101",
  "description": "Introduction to computer science"
}
```

---

#### Update Subject
```
PUT /api/subjects/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

---

#### Delete Subject
```
DELETE /api/subjects/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

---

### 10. Donor Routes (`/api/donors`)

#### Get Donor Profile
```
GET /api/donors/profile/:id
```

**Authentication:** Required ✓

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "donor_id",
    "userId": "user_id",
    "firstName": "David",
    "lastName": "Johnson",
    "email": "donor@example.com",
    "phone": "+1234567890",
    "organization": "Tech Corp",
    "address": "123 Business St",
    "subscriptionActive": true,
    "subscriptionAmount": 5000,
    "subscriptionFrequency": "monthly",
    "totalDonated": 25000
  }
}
```

---

#### Update Donor Profile
```
PUT /api/donors/profile/:id
```

**Authentication:** Required ✓

**Request Body:**
```json
{
  "firstName": "David",
  "lastName": "Johnson",
  "organization": "Tech Corp",
  "address": "123 Business St",
  "phone": "+1234567890"
}
```

---

#### Set Donor Subscription
```
PUT /api/donors/subscription/:id
```

**Authentication:** Required ✓

**Request Body:**
```json
{
  "subscriptionAmount": 5000,
  "subscriptionFrequency": "monthly"
}
```

---

#### Toggle Donor Subscription
```
PATCH /api/donors/subscription/:id/toggle
```

**Authentication:** Required ✓

**Request Body:**
```json
{
  "subscriptionActive": false
}
```

---

#### Admin: Get All Donors
```
GET /api/donors
```

**Authentication:** Required ✓
**Authorization:** Admin only

---

#### Admin: Get Donor Details
```
GET /api/donors/admin/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

---

#### Admin: Update Donor
```
PUT /api/donors/admin/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

---

#### Admin: Delete Donor
```
DELETE /api/donors/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

---

### 11. Donation Routes (`/api/donations`)

#### Create Donation
```
POST /api/donations
```

**Authentication:** Required ✓
**Authorization:** Donor only

**Request Body:**
```json
{
  "amount": 5000,
  "currency": "LKR",
  "paymentMethod": "payhere",
  "campaign": "Education Fund",
  "notes": "Supporting underprivileged students"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "donation_id",
    "donor": "donor_id",
    "amount": 5000,
    "currency": "LKR",
    "status": "pending",
    "paymentMethod": "payhere",
    "transactionId": "TXN123456",
    "createdAt": "2024-12-15T10:30:00Z"
  }
}
```

---

#### Get My Donations
```
GET /api/donations/my/:donorId
```

**Authentication:** Required ✓
**Authorization:** Donor only

**Path Parameters:**
- `donorId`: Donor ID

**Response:**
```json
{
  "success": true,
  "data": [ /* array of donor's donations */ ]
}
```

---

#### Admin: Get All Donations
```
GET /api/donations
```

**Authentication:** Required ✓
**Authorization:** Admin only

---

#### Admin: Get Donations by Donor
```
GET /api/donations/donor/:donorId
```

**Authentication:** Required ✓
**Authorization:** Admin only

---

#### Admin: Get Donation by ID
```
GET /api/donations/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

---

#### Admin: Update Donation Status
```
PUT /api/donations/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Request Body:**
```json
{
  "status": "completed"
}
```

---

#### Delete Donation
```
DELETE /api/donations/:id
```

**Authentication:** Required ✓
**Authorization:** Donor or Admin

---

### 12. Payment Routes (`/api/payments/payhere`)

#### Initiate Payment
```
POST /api/payments/payhere/pay
```

**Authentication:** Required ✓

**Request Body:**
```json
{
  "donation_id": "donation_id",
  "return_url": "http://localhost:5173/donation-result"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentForm": "HTML form for PayHere payment",
    "redirectUrl": "https://sandbox.payhere.lk/pay/..."
  }
}
```

---

#### Payment Notification (Webhook)
```
POST /api/payments/payhere/notify
```

**Request Body:**
```json
{
  "merchant_id": "1234928",
  "order_id": "donation_id",
  "payhere_amount": "5000",
  "payhere_currency": "LKR",
  "status_code": "2",
  "md5sig": "hash_value"
}
```

---

### 13. Feedback Routes (`/api/feedback`)

#### Get All Feedback
```
GET /api/feedback
```

**Response:**
```json
{
  "success": true,
  "data": [ /* array of feedback */ ]
}
```

---

#### Get Feedback by ID
```
GET /api/feedback/:id
```

---

#### Create Feedback
```
POST /api/feedback
```

**Authentication:** Required ✓

**Request Body:**
```json
{
  "title": "Great Experience",
  "message": "The study materials are excellent",
  "rating": 5,
  "studentId": "student_id"
}
```

---

#### Update Feedback
```
PUT /api/feedback/:id
```

**Authentication:** Required ✓

**Request Body:**
```json
{
  "title": "Updated Title",
  "message": "Updated message",
  "rating": 4
}
```

---

#### Delete Feedback
```
DELETE /api/feedback/:id
```

**Authentication:** Required ✓

---

### 14. Complaint Routes (`/api/complaints`)

#### Get All Complaints
```
GET /api/complaints
```

**Response:**
```json
{
  "success": true,
  "data": [ /* array of complaints */ ]
}
```

---

#### Get Complaint by ID
```
GET /api/complaints/:id
```

---

#### Create Complaint
```
POST /api/complaints
```

**Authentication:** Required ✓

**Request Body:**
```json
{
  "title": "Issue with Study Material",
  "description": "The PDF is corrupted",
  "category": "technical",
  "studentId": "student_id",
  "relatedItem": "material_id"
}
```

---

#### Update Complaint Status
```
PUT /api/complaints/:id
```

**Authentication:** Required ✓
**Authorization:** Admin only

**Request Body:**
```json
{
  "status": "resolved",
  "resolution": "Material has been fixed"
}
```

---

#### Delete Complaint
```
DELETE /api/complaints/:id
```

**Authentication:** Required ✓

---

## Environment Variables

### Backend `.env` File

```env
# Server Configuration
PORT=5000                                    # Server port
NODE_ENV=development                         # Node environment

# Database
MONGODB_URI=mongodb+srv://user:pass...       # MongoDB connection string

# JWT Authentication
JWT_SECRET=your_secret_key_here              # Secret key for JWT signing
JWT_EXPIRE=7d                                # Token expiration time

# Admin Credentials
ADMIN_EMAIL=admin@openlesson.com             # Default admin email
ADMIN_PASSWORD=YourStrongPassword            # Default admin password

# Email Service
EMAIL_USER=your_email@gmail.com              # Sender email
EMAIL_PASSWORD=your_app_password             # Email app password

# Payment Gateway
PAYHERE_MERCHANT_ID=1234928                  # PayHere merchant ID
PAYHERE_MERCHANT_SECRET=your_secret          # PayHere merchant secret
PAYHERE_NOTIFY_URL=https://your_domain/...   # PayHere webhook URL

# Frontend Configuration
FRONTEND_URL=http://localhost:5173           # Frontend URL for CORS

# Zoom Configuration
ZOOM_ACCOUNT_ID=your_account_id              # Zoom account ID
ZOOM_CLIENT_ID=your_client_id                # Zoom client ID
ZOOM_CLIENT_SECRET=your_client_secret        # Zoom client secret

# AI Service
GEMINI_API_KEY=your_api_key                  # Google Gemini API key
```

### Frontend `.env` File

```env
VITE_API_URL=http://localhost:5000           # Backend API URL
```

---

## Deployment

This section documents the deployment of the OpenLesson application to production environments.

### Live URLs

| Component | Platform | URL | Status |
|-----------|----------|-----|--------|
| **Backend API** | Render | https://openlesson.onrender.com | ✅ Deployed |
| **Frontend Application** | Vercel | https://openlesson-sooty.vercel.app | ✅ Deployed |

---

### Backend Deployment (Render)

#### Prerequisites

- GitHub account with repository pushed
- Render account (https://render.com)
- MongoDB Atlas connection string
- All backend environment variables ready

#### Step-by-Step Setup

**1. Prepare GitHub Repository**
```bash
# Ensure all code is committed and pushed
git add .
git commit -m "Production ready"
git push origin main
```

**2. Create Render Account**
- Go to https://render.com
- Sign up with GitHub
- Authorize Render to access your repositories

**3. Create Web Service on Render**
- Click "New +" → "Web Service"
- Select your `openlesson` repository
- Click "Connect"

**4. Configure Web Service**
- **Name**: `openlesson-backend` (or preferred name)
- **Environment**: `Node`
- **Root Directory**: `backend` ← **Important!**
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- Click "Create Web Service"

**5. Configure Environment Variables**

Once service is created, go to **Settings** → **Environment** and add:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/openlesson

# Node Environment
NODE_ENV=production
PORT=5000

# Authentication
JWT_SECRET=your_jwt_secret_key_here
ADMIN_PASSWORD=your_admin_password

# Email Service
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@openlesson.com

# Google AI Service
GOOGLE_API_KEY=your_google_api_key

# Zoom Integration
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_ACCOUNT_ID=your_zoom_account_id

# PayHere Payment Gateway
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
PAYHERE_CHECKOUT_URL=https://sandbox.payhere.lk/pay/checkout
PAYHERE_NOTIFY_URL=https://openlesson.onrender.com/api/payments/payhere/notify

# URLs
FRONTEND_URL=https://openlesson-sooty.vercel.app
BACKEND_PUBLIC_URL=https://openlesson.onrender.com
API_PUBLIC_URL=https://openlesson.onrender.com
```

**6. Deploy**
- Click "Manual Deploy" → "Deploy latest commit"
- Wait 2-3 minutes for deployment to complete
- Check "Deployments" tab for status
- Once deployed, you'll see a green checkmark

**7. Verify Deployment**

Test the backend with:
```bash
curl https://openlesson.onrender.com/api/subjects
```

Expected response: JSON array of subjects (or empty array if no data)

---

### Frontend Deployment (Vercel)

#### Prerequisites

- GitHub account with repository pushed
- Vercel account (https://vercel.com)
- Backend deployed and running (for environment variables)

#### Step-by-Step Setup

**1. Push Frontend Code to GitHub**
```bash
git add .
git commit -m "Production ready"
git push origin main
```

**2. Create Vercel Account**
- Go to https://vercel.com
- Click "Sign Up"
- Choose "Sign Up with GitHub"
- Authorize Vercel to access your repositories

**3. Import Project**
- Click "New Project"
- Select `openlesson` repository
- Click "Import"

**4. Configure Build Settings**

Vercel should auto-detect, but verify:
- **Framework Preset**: Vite ✓
- **Root Directory**: `frontend` ← **Important!**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**5. Add Environment Variables**

Before deploying, add these in the **Environment Variables** section:

```env
VITE_API_URL=https://openlesson.onrender.com
VITE_API_BASE_URL=https://openlesson.onrender.com
```

Click "Add" for each variable.

**6. Deploy**
- Click "Deploy"
- Wait 2-3 minutes for build and deployment
- You'll receive a deployment URL like `https://openlesson-sooty.vercel.app`

**7. Verify Deployment**
- Visit the deployment URL
- Register/login with test credentials
- Verify API calls are working (check browser Console)

---

### Environment Variables Summary

#### Backend Environment Variables (Required)

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NODE_ENV` | Environment type | `production` |
| `JWT_SECRET` | Token signing key | `your-secret-key` |
| `FRONTEND_URL` | CORS allowed origin | `https://openlesson-sooty.vercel.app` |
| `SENDGRID_API_KEY` | Email service | `SG.xxxxx` |
| `GOOGLE_API_KEY` | Google Generative AI | `AIzaSyxxx` |
| `PAYHERE_MERCHANT_ID` | Payment gateway | `xxx` |
| `PAYHERE_MERCHANT_SECRET` | Payment secret | `secret` |
| `ZOOM_CLIENT_ID` | Video conference | `xxxxx` |

#### Frontend Environment Variables (Required)

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API endpoint | `https://openlesson.onrender.com` |
| `VITE_API_BASE_URL` | Payment API endpoint | `https://openlesson.onrender.com` |

---

### Deployment Troubleshooting

#### Backend Issues

| Issue | Solution |
|-------|----------|
| Build fails with `ENOENT` | Set Root Directory to `backend` in Render |
| `FRONTEND_URL not configured` CORS error | Update CORS environment variable |
| MongoDB connection fails | Verify `MONGODB_URI` is correct and IP is whitelisted |
| API returns 404 | Verify backend routes have `/api/` prefix |

#### Frontend Issues

| Issue | Solution |
|-------|----------|
| Build fails - `UNRESOLVED_IMPORT` | Check file imports for case sensitivity (Linux is case-sensitive) |
| API calls return 404 | Verify `VITE_API_URL` is set and includes `/api/` segment |
| CORS errors | Update backend `FRONTEND_URL` to match Vercel URL (without trailing slash) |
| Blank page or no data loads | Check browser Console (F12) for API errors |

---

### Post-Deployment Checklist

- [x] Backend deployed and accessible at `https://openlesson.onrender.com`
- [x] Frontend deployed and accessible at `https://openlesson-sooty.vercel.app`
- [x] All environment variables configured
- [x] CORS properly configured on backend
- [x] CORS frontend URL matches deployed frontend
- [x] Database connection working
- [x] Email service configured
- [x] Payment gateway tested
- [x] Authentication working
- [x] API endpoints responding correctly
- [x] Frontend loading data from backend
- [x] SSL/HTTPS enabled on both platforms

---

### Testing the Deployed Application

**1. Test Backend API**
```bash
# Get all subjects
curl https://openlesson.onrender.com/api/subjects

# Login
curl -X POST https://openlesson.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

**2. Test Frontend Application**
- Visit https://openlesson-sooty.vercel.app
- Register a new account
- Login with credentials
- Navigate through different pages
- Verify all data loads correctly
- Test payment flow (if implemented)

**3. Monitor Deployment**

**Render Dashboard**:
- Go to Deployments → Check logs for errors
- Check Metrics for CPU/Memory usage
- Monitor error tracking

**Vercel Dashboard**:
- Go to Deployments → View build logs
- Check Analytics for page performance
- Monitor error tracking

---

## Testing Instruction Report

This section explains how to run unit, integration, and performance tests in the backend.

### 1. How to run unit tests

1. Open terminal in `backend` folder.
2. Install dependencies:

```bash
npm install
```

3. Run unit tests:

```bash
npm run test:unit
```

### 2. Integration testing setup and execution

Integration tests verify route/controller/database behavior together.

1. Ensure backend dependencies are installed:

```bash
npm install
```

2. Run integration tests:

```bash
npm run test:integration
```

Notes:
1. The current integration setup uses `mongodb-memory-server` in test files.
2. First run may download MongoDB binaries depending on environment.

### 3. Performance testing setup and execution

Use Artillery load testing for API throughput and latency checks.

1. Ensure backend is running:

```bash
npm run dev
```

2. In another terminal (still in `backend`), run load test:

```bash
npm run perf:load
```

3. Optional performance test suite command:

```bash
npm run test:performance
```

### 4. Testing environment configuration details

Required test/runtime configuration:
1. Node.js environment with npm dependencies installed.
2. Backend scripts from `backend/package.json`:
  1. `test:unit`
  2. `test:integration`
  3. `test:performance`
  4. `perf:load`
3. Jest config at `backend/jest.config.js`:
  1. `testEnvironment: "node"`
  2. `roots: ["<rootDir>/src/tests"]`
  3. `testMatch: ["**/*.test.js"]`
4. Performance test config at `backend/src/tests/performance/artillery/load.yml`.
5. Environment variables in `backend/.env` should be present when tests depend on auth, DB, or third-party integrations.

---

## Common Issues & Solutions

### MongoDB Connection Error
**Problem:** Cannot connect to MongoDB
**Solution:**
1. Ensure MongoDB is running locally or check MongoDB Atlas status
2. Verify connection string in `.env`
3. Check network access settings in MongoDB Atlas

### JWT Token Expired
**Problem:** 401 Unauthorized - Token expired
**Solution:**
1. User needs to login again to get a new token
2. Implement token refresh logic on frontend

### CORS Errors
**Problem:** Cross-Origin Request Blocked
**Solution:**
1. Ensure `FRONTEND_URL` is correctly set in backend `.env`
2. Check CORS middleware configuration in `src/app.js`

### File Upload Errors
**Problem:** File upload fails
**Solution:**
1. Check multer configuration in `src/middleware/upload.js`
2. Ensure `uploads/` directory exists and has write permissions
3. Verify file size limits

---

## Testing the API

### Using Postman or cURL

**Login Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

**Using Token in Request:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer your_jwt_token_here"
```

---

## Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [React Documentation](https://react.dev)
- [Mongoose Documentation](https://mongoosejs.com)
- [JWT Documentation](https://jwt.io)

---

## Support & Troubleshooting

For issues or questions:
1. Check the GitHub Issues page
2. Review error messages in server logs
3. Check `.env` file configuration
4. Verify MongoDB connection
5. Clear browser cache and localStorage

---

## License

This project is licensed under the ISC License.

---

## Contributors

- Development Team: OpenLesson Contributors

---

**Last Updated:** December 2024
**Version:** 1.0.0