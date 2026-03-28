# OpenLesson API Testing Guide

## Base URL
```
http://localhost:5000
```

---

## Authentication Endpoints

### 1. Register User (Student)

**URL:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "student@test.com",
  "password": "pass123",
  "userType": "student",
  "fullName": "John Student",
  "gradeId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "student@test.com",
    "userType": "student",
    "fullName": "John Student"
  }
}
```

---

### 2. Register User (Teacher)

**URL:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "teacher@test.com",
  "password": "pass123",
  "userType": "teacher",
  "fullName": "Jane Teacher",
  "phone": "9876543210",
  "qualification": "B.S. Computer Science"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Teacher registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "teacher@test.com",
    "userType": "teacher",
    "fullName": "Jane Teacher"
  }
}
```

---

### 3. Register User (Donor)

**URL:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "donor@test.com",
  "password": "pass123",
  "userType": "donor",
  "fullName": "ABC Charity",
  "phone": "9876543210",
  "companyName": "ABC Foundation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donor registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "donor@test.com",
    "userType": "donor",
    "fullName": "ABC Charity"
  }
}
```

---

### 4. Login User (Student)

**URL:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "student@test.com",
  "password": "pass123",
  "userType": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "student@test.com",
    "userType": "student",
    "profile": {
      "_id": "profile_id",
      "userId": "user_id",
      "fullName": "John Student",
      "phone": "9876543210",
      "gradeId": "grade_id",
      "status": "active"
    }
  }
}
```

---

### 5. Login User (Teacher)

**URL:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "teacher@test.com",
  "password": "pass123",
  "userType": "teacher"
}
```

---

### 6. Login User (Donor)

**URL:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "donor@test.com",
  "password": "pass123",
  "userType": "donor"
}
```

---

### 7. Get Current User Profile

**URL:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token_from_login>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "student@test.com",
    "userType": "student",
    "profile": {
      "_id": "profile_id",
      "userId": "user_id",
      "fullName": "John Student",
      "phone": "9876543210",
      "gradeId": "grade_id",
      "status": "active"
    }
  }
}
```

---

## Student Endpoints (Protected)

### 1. Get Student Profile

**URL:** `GET /api/students/profile/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "student": {
    "_id": "profile_id",
    "userId": "user_id",
    "fullName": "John Student",
    "phone": "9876543210",
    "gradeId": "grade_id",
    "status": "active"
  }
}
```

---

### 2. Update Student Profile

**URL:** `PUT /api/students/profile/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Updated",
  "phone": "1111111111"
}
```

---

## Teacher Endpoints

### 1. List All Teachers

**URL:** `GET /api/teachers`

**Response:**
```json
{
  "success": true,
  "count": 2,
  "teachers": [
    {
      "_id": "teacher_id",
      "userId": "user_id",
      "fullName": "Jane Teacher",
      "phone": "9876543210",
      "qualification": "B.S. Computer Science",
      "status": "Approved"
    }
  ]
}
```

---

### 2. Get Teacher Profile (Protected)

**URL:** `GET /api/teachers/profile/:id`

**Headers:**
```
Authorization: Bearer <token>
```

---

### 3. Update Teacher Profile (Protected)

**URL:** `PUT /api/teachers/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "Jane Updated",
  "qualification": "M.S. Computer Science"
}
```

---

## Donor Endpoints

### 1. List All Donors (Protected)

**URL:** `GET /api/donors`

**Headers:**
```
Authorization: Bearer <token>
```

---

### 2. Get Donor Profile (Protected)

**URL:** `GET /api/donors/profile/:id`

**Headers:**
```
Authorization: Bearer <token>
```

---

### 3. Update Donor Profile (Protected)

**URL:** `PUT /api/donors/profile/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "XYZ Charity Updated",
  "phone": "1111111111"
}
```

---

### 4. Update Donor Status (Protected)

**URL:** `PUT /api/donors/:id/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "Inactive"
}
```

---

## Testing Workflow

1. **Register a user** (student/teacher/donor) - Get token
2. **Login with credentials** - Verify token returned
3. **Get Current User** - Use token in header to fetch profile
4. **Update Profile** - Modify user data
5. **List All** - Get all users of type

## Error Responses

### Missing Required Fields
```json
{
  "success": false,
  "message": "Email, password, and userType are required"
}
```

### Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Email Already Exists
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Unauthorized (No Token)
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### Invalid Token
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```
