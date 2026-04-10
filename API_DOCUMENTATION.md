# OpenLesson API Documentation

Complete reference guide for all API endpoints available in the OpenLesson platform.

## Table of Contents

1. [Base Information](#base-information)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Endpoints by Category](#endpoints-by-category)

---

## Base Information

### Base URL
```
http://localhost:5000/api
```

### API Version
Version: 1.0.0

### Content-Type
All requests should include:
```
Content-Type: application/json
```

### Rate Limiting
Currently no rate limiting is implemented.

---

## Authentication

### JWT Token Format

Tokens are passed in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Token Structure

The JWT token contains:
- User ID
- Email
- User Type (student, teacher, donor, admin)
- Issued At (iat)
- Expiration (exp)

### Token Expiration

- Default expiration: 7 days
- Configurable via `JWT_EXPIRE` in environment variables

### User Types

| Type | Description |
|------|-------------|
| `student` | Student users with access to study materials and quizzes |
| `teacher` | Teachers who can create content and sessions |
| `donor` | Donors who can make contributions |
| `admin` | Administrators with full system access |

---

## Response Format

### Success Response

All successful responses follow this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "property": "value"
  }
}
```

### Error Response

Error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input parameters |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 500 | Server Error - Internal server error |

---

## Error Handling

### Common Error Scenarios

#### 1. Missing Authentication Token

**Request:**
```
GET /api/students/my-profile
```

**Response (401):**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

#### 2. Invalid Token

**Request:**
```
GET /api/students/my-profile
Authorization: Bearer invalid_token
```

**Response (401):**
```json
{
  "success": false,
  "message": "Token verification failed"
}
```

#### 3. Insufficient Permissions

**Request:**
```
POST /api/announcements
Authorization: Bearer student_token
```

**Response (403):**
```json
{
  "success": false,
  "message": "Not authorized for this operation"
}
```

#### 4. Resource Not Found

**Request:**
```
GET /api/students/admin/invalid_id
```

**Response (404):**
```json
{
  "success": false,
  "message": "Student not found"
}
```

---

## Endpoints by Category

### 1. Authentication (`/api/auth`)

#### 1.1 Register User

```
POST /api/auth/register
```

**Public Endpoint**

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | User email address |
| password | string | Yes | Password (min 6 chars) |
| firstName | string | Yes | First name |
| lastName | string | Yes | Last name |
| userType | string | Yes | Type: student, teacher, donor, admin |
| phone | string | No | Phone number |
| address | string | No | Address |
| cv | file | Conditional | CV file (required for teachers) |

**Example Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "student",
  "phone": "+1234567890",
  "address": "123 Main Street"
}
```

**Example Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "userType": "student",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 1.2 Login User

```
POST /api/auth/login
```

**Public Endpoint**

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | User email |
| password | string | Yes | User password |

**Example Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Example Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "userType": "student",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 1.3 Get Current User

```
GET /api/auth/me
```

**Protected Endpoint** - Requires authentication token

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "student",
    "status": "active"
  }
}
```

---

#### 1.4 Change Password

```
PUT /api/auth/password
```

**Protected Endpoint** - Requires authentication token

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| currentPassword | string | Yes | Current password |
| newPassword | string | Yes | New password (min 6 chars) |

**Example Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Example Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 2. Student Management (`/api/students`)

#### 2.1 Get My Profile

```
GET /api/students/my-profile
```

**Protected Endpoint** - Student or Admin

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@student.com",
    "phone": "+1234567890",
    "grade": "10",
    "parentContact": "+0987654321",
    "status": "active",
    "profilePictureUrl": "/uploads/profiles/student_1.jpg",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 2.2 Update My Profile

```
PUT /api/students/my-profile
```

**Protected Endpoint** - Student or Admin

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| firstName | string | No | First name |
| lastName | string | No | Last name |
| phone | string | No | Phone number |
| grade | string | No | Student grade |
| parentContact | string | No | Parent contact |

**Example Request:**
```json
{
  "phone": "+1234567890",
  "grade": "11",
  "parentContact": "+0987654321"
}
```

**Example Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated student profile */ }
}
```

---

#### 2.3 Upload Profile Picture

```
PUT /api/students/upload-picture
```

**Protected Endpoint** - Student

**Content-Type:** `multipart/form-data`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| profilePicture | file | Yes | Image file (JPG, PNG) |

**Example Response (200):**
```json
{
  "success": true,
  "message": "Picture updated successfully",
  "data": {
    "profilePictureUrl": "/uploads/profiles/student_1_new.jpg"
  }
}
```

---

#### 2.4 Get Student Profile by ID

```
GET /api/students/profile/:id
```

**Protected Endpoint** - Any authenticated user

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Student ID |

---

#### 2.5 Update Student Profile by ID

```
PUT /api/students/profile/:id
```

**Protected Endpoint** - Student or Admin

**Parameters:** Same as 2.2

---

#### 2.6 Admin: Get All Students

```
GET /api/students/admin/all
```

**Protected Endpoint** - Admin only

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| status | string | Filter by status (active, inactive) |

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    { /* student 1 */ },
    { /* student 2 */ }
  ]
}
```

---

#### 2.7 Admin: Get Student Details

```
GET /api/students/admin/:id
```

**Protected Endpoint** - Admin only

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Student ID |

---

#### 2.8 Admin: Update Student Status

```
PUT /api/students/admin/:id/status
```

**Protected Endpoint** - Admin only

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | Yes | Status: active, inactive, suspended |

**Example Request:**
```json
{
  "status": "inactive"
}
```

---

#### 2.9 Admin: Update Student

```
PUT /api/students/admin/:id
```

**Protected Endpoint** - Admin only

**Parameters:** Any student profile fields

---

#### 2.10 Admin: Delete Student

```
DELETE /api/students/admin/:id
```

**Protected Endpoint** - Admin only

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Student ID |

---

### 3. Teacher Management (`/api/teachers`)

#### 3.1 Get All Teachers

```
GET /api/teachers
```

**Public Endpoint**

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| subject | string | Filter by subject |
| status | string | Filter by status (approved, pending, rejected) |
| page | number | Page number |

**Example Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Jane",
      "lastName": "Smith",
      "subject": "Mathematics",
      "qualifications": "M.Sc Mathematics",
      "experience": "8",
      "status": "approved"
    }
  ]
}
```

---

#### 3.2 Get My Teacher Profile

```
GET /api/teachers/my-profile
```

**Protected Endpoint** - Teacher

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@teacher.com",
    "qualifications": "M.Sc Mathematics",
    "experience": "8",
    "subject": "Mathematics",
    "bio": "Experienced mathematics teacher",
    "cvUrl": "/uploads/cv/jane_smith_cv.pdf",
    "status": "approved",
    "profilePictureUrl": "/uploads/profiles/teacher_1.jpg"
  }
}
```

---

#### 3.3 Get Teacher Profile by ID

```
GET /api/teachers/profile/:id
```

**Protected Endpoint** - Any authenticated user

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Teacher ID |

---

#### 3.4 Update Teacher Profile

```
PUT /api/teachers/:id
```

**Protected Endpoint** - Teacher or Admin

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| qualifications | string | Qualifications |
| experience | string | Years of experience |
| subject | string | Subject taught |
| bio | string | Teacher bio |

---

#### 3.5 Admin: Get All Teachers

```
GET /api/teachers/admin/all
```

**Protected Endpoint** - Admin only

---

#### 3.6 Admin: Get Teacher Details

```
GET /api/teachers/admin/:id
```

**Protected Endpoint** - Admin only

---

#### 3.7 Admin: Approve Teacher

```
PUT /api/teachers/admin/:id/approve
```

**Protected Endpoint** - Admin only

**Example Request:**
```json
{
  "status": "approved"
}
```

---

#### 3.8 Admin: Reject Teacher

```
PUT /api/teachers/admin/:id/reject
```

**Protected Endpoint** - Admin only

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Must be "rejected" |
| rejectionReason | string | Reason for rejection |

---

#### 3.9 Admin: Download Teacher CV

```
GET /api/teachers/:id/cv-download
```

**Protected Endpoint** - Admin only

**Response:** PDF file download

---

### 4. Quiz Management (`/api/quizzes`)

#### 4.1 Create Quiz

```
POST /api/quizzes
```

**Protected Endpoint** - Teacher, Admin

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Quiz title |
| description | string | No | Quiz description |
| subject | string | Yes | Subject |
| grade | string | Yes | Grade level |
| questions | array | Yes | Array of question objects |
| totalPoints | number | Yes | Total points |
| duration | number | Yes | Duration in minutes |
| dueDate | date | No | Due date |

**Question Object:**
```json
{
  "question": "What is 2+2?",
  "options": ["3", "4", "5", "6"],
  "correctAnswer": "4",
  "points": 10
}
```

**Example Request:**
```json
{
  "title": "Mathematics Quiz 01",
  "description": "Basic arithmetic",
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

#### 4.2 Get All Quizzes

```
GET /api/quizzes
```

**Public Endpoint**

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| subject | string | Filter by subject |
| grade | string | Filter by grade |
| page | number | Page number |

---

#### 4.3 Get Quiz by ID

```
GET /api/quizzes/:id
```

**Public Endpoint**

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Quiz ID |

---

#### 4.4 Update Quiz

```
PUT /api/quizzes/:id
```

**Protected Endpoint** - Quiz creator, Admin

**Parameters:** Any quiz fields

---

#### 4.5 Delete Quiz

```
DELETE /api/quizzes/:id
```

**Protected Endpoint** - Quiz creator, Admin

---

### 5. Study Materials (`/api/study-materials`)

#### 5.1 Create Study Material

```
POST /api/study-materials
```

**Protected Endpoint** - Teacher, Admin

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Material title |
| description | string | No | Description |
| subject | string | Yes | Subject |
| grade | string | Yes | Grade level |
| content | string | No | HTML or text content |
| fileUrl | string | No | File URL |
| fileType | string | No | File type (pdf, doc, etc) |
| duration | number | No | Duration in minutes |

---

#### 5.2 Get All Study Materials

```
GET /api/study-materials
```

**Public Endpoint**

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| subject | string | Filter by subject |
| grade | string | Filter by grade |
| page | number | Page number |

---

#### 5.3 Get Study Material by ID

```
GET /api/study-materials/:id
```

**Public Endpoint**

---

#### 5.4 Update Study Material

```
PUT /api/study-materials/:id
```

**Protected Endpoint** - Creator, Admin

---

#### 5.5 Delete Study Material

```
DELETE /api/study-materials/:id
```

**Protected Endpoint** - Creator, Admin

---

### 6. Study Sessions (`/api/study-sessions`)

#### 6.1 Create Study Session

```
POST /api/study-sessions
```

**Protected Endpoint** - Teacher, Admin

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Session title |
| description | string | No | Description |
| subject | string | Yes | Subject |
| grade | string | Yes | Grade level |
| scheduledDate | date | Yes | Session date |
| startTime | time | Yes | Start time |
| endTime | time | Yes | End time |

**Note:** Zoom link is auto-generated

---

#### 6.2 Get All Study Sessions

```
GET /api/study-sessions
```

**Protected Endpoint** - Teacher, Admin

---

#### 6.3 Get Study Session by ID

```
GET /api/study-sessions/:id
```

**Public Endpoint**

**Example Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Mathematics Class",
    "subject": "Mathematics",
    "grade": "10",
    "scheduledDate": "2024-12-20",
    "startTime": "10:00",
    "endTime": "11:00",
    "zoomLink": "https://zoom.us/...",
    "zoomMeetingId": "123456789",
    "status": "scheduled",
    "attendees": []
  }
}
```

---

#### 6.4 Update Study Session

```
PUT /api/study-sessions/:id
```

**Protected Endpoint** - Organizer, Admin

---

#### 6.5 Delete Study Session

```
DELETE /api/study-sessions/:id
```

**Protected Endpoint** - Organizer, Admin

---

### 7. Announcements (`/api/announcements`)

#### 7.1 Create Announcement

```
POST /api/announcements
```

**Protected Endpoint** - Admin only

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Announcement title |
| content | string | Yes | Announcement content |
| priority | string | Yes | Priority (low, medium, high) |
| targetAudience | string | Yes | Audience (all, students, teachers, donors) |
| expiryDate | date | No | Expiry date |

---

#### 7.2 Get All Announcements

```
GET /api/announcements
```

**Public Endpoint**

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| priority | string | Filter by priority |
| page | number | Page number |

---

#### 7.3 Get Announcement by ID

```
GET /api/announcements/:id
```

**Public Endpoint**

---

#### 7.4 Update Announcement

```
PUT /api/announcements/:id
```

**Protected Endpoint** - Admin only

---

#### 7.5 Delete Announcement

```
DELETE /api/announcements/:id
```

**Protected Endpoint** - Admin only

---

### 8. Grades (`/api/grades`)

#### 8.1 Create Grade

```
POST /api/grades
```

**Protected Endpoint** - Admin only

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student | string | Yes | Student ID |
| subject | string | Yes | Subject |
| grade | string | Yes | Letter grade (A, B, C, etc) |
| score | number | Yes | Numeric score |
| semester | string | Yes | Semester |
| academicYear | string | Yes | Academic year |

---

#### 8.2 Get All Grades

```
GET /api/grades
```

**Public Endpoint**

---

#### 8.3 Get Grade by ID

```
GET /api/grades/:id
```

**Public Endpoint**

---

#### 8.4 Update Grade

```
PUT /api/grades/:id
```

**Protected Endpoint** - Admin only

---

#### 8.5 Delete Grade

```
DELETE /api/grades/:id
```

**Protected Endpoint** - Admin only

---

### 9. Subjects (`/api/subjects`)

#### 9.1 Create Subject

```
POST /api/subjects
```

**Protected Endpoint** - Admin only

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Subject name |
| code | string | Yes | Subject code |
| description | string | No | Description |

---

#### 9.2 Get All Subjects

```
GET /api/subjects
```

**Public Endpoint**

---

#### 9.3 Get Subject by ID

```
GET /api/subjects/:id
```

**Public Endpoint**

---

#### 9.4 Update Subject

```
PUT /api/subjects/:id
```

**Protected Endpoint** - Admin only

---

#### 9.5 Delete Subject

```
DELETE /api/subjects/:id
```

**Protected Endpoint** - Admin only

---

### 10. Donors (`/api/donors`)

#### 10.1 Get Donor Profile

```
GET /api/donors/profile/:id
```

**Protected Endpoint** - Donor, Admin

---

#### 10.2 Update Donor Profile

```
PUT /api/donors/profile/:id
```

**Protected Endpoint** - Donor, Admin

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| firstName | string | First name |
| lastName | string | Last name |
| phone | string | Phone number |
| organization | string | Organization name |
| address | string | Address |

---

#### 10.3 Set Donor Subscription

```
PUT /api/donors/subscription/:id
```

**Protected Endpoint** - Donor

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| subscriptionAmount | number | Yes | Amount in native currency |
| subscriptionFrequency | string | Yes | Frequency (monthly, quarterly, yearly) |

---

#### 10.4 Toggle Donor Subscription

```
PATCH /api/donors/subscription/:id/toggle
```

**Protected Endpoint** - Donor

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| subscriptionActive | boolean | Yes | Active status |

---

#### 10.5 Admin: Get All Donors

```
GET /api/donors
```

**Protected Endpoint** - Admin only

---

#### 10.6 Admin: Get Donor Details

```
GET /api/donors/admin/:id
```

**Protected Endpoint** - Admin only

---

#### 10.7 Admin: Update Donor

```
PUT /api/donors/admin/:id
```

**Protected Endpoint** - Admin only

---

#### 10.8 Admin: Delete Donor

```
DELETE /api/donors/:id
```

**Protected Endpoint** - Admin only

---

### 11. Donations (`/api/donations`)

#### 11.1 Create Donation

```
POST /api/donations
```

**Protected Endpoint** - Donor

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| amount | number | Yes | Donation amount |
| currency | string | Yes | Currency code (LKR, USD, etc) |
| paymentMethod | string | Yes | Payment method (payhere, etc) |
| campaign | string | No | Campaign name |
| notes | string | No | Additional notes |

**Example Request:**
```json
{
  "amount": 5000,
  "currency": "LKR",
  "paymentMethod": "payhere",
  "campaign": "Education Fund",
  "notes": "Supporting underprivileged students"
}
```

**Example Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "donor": "507f1f77bcf86cd799439012",
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

#### 11.2 Get My Donations

```
GET /api/donations/my/:donorId
```

**Protected Endpoint** - Donor

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| donorId | string | Donor ID |

---

#### 11.3 Admin: Get All Donations

```
GET /api/donations
```

**Protected Endpoint** - Admin only

---

#### 11.4 Admin: Get Donations by Donor

```
GET /api/donations/donor/:donorId
```

**Protected Endpoint** - Admin only

---

#### 11.5 Admin: Get Donation by ID

```
GET /api/donations/:id
```

**Protected Endpoint** - Admin only

---

#### 11.6 Admin: Update Donation Status

```
PUT /api/donations/:id
```

**Protected Endpoint** - Admin only

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Status (pending, completed, failed) |

---

#### 11.7 Delete Donation

```
DELETE /api/donations/:id
```

**Protected Endpoint** - Donor, Admin

---

### 12. Payments (`/api/payments/payhere`)

#### 12.1 Initiate Payment

```
POST /api/payments/payhere/pay
```

**Protected Endpoint** - Donor

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| donation_id | string | Yes | Donation ID |
| return_url | string | Yes | Return URL after payment |

**Example Request:**
```json
{
  "donation_id": "507f1f77bcf86cd799439011",
  "return_url": "http://localhost:5173/donation-result"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "redirectUrl": "https://sandbox.payhere.lk/pay/...",
    "merchant_id": "1234928"
  }
}
```

---

#### 12.2 Payment Webhook

```
POST /api/payments/payhere/notify
```

**Webhook Endpoint** - Called by PayHere

This endpoint updates donation status based on payment verification.

---

### 13. Feedback (`/api/feedback`)

#### 13.1 Get All Feedback

```
GET /api/feedback
```

**Protected Endpoint** - Admin

---

#### 13.2 Get Feedback by ID

```
GET /api/feedback/:id
```

**Protected Endpoint**

---

#### 13.3 Create Feedback

```
POST /api/feedback
```

**Protected Endpoint** - Student

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Feedback title |
| message | string | Yes | Feedback message |
| rating | number | Yes | Rating (1-5) |

---

#### 13.4 Update Feedback

```
PUT /api/feedback/:id
```

**Protected Endpoint** - Author

---

#### 13.5 Delete Feedback

```
DELETE /api/feedback/:id
```

**Protected Endpoint** - Author, Admin

---

### 14. Complaints (`/api/complaints`)

#### 14.1 Get All Complaints

```
GET /api/complaints
```

**Protected Endpoint** - Admin

---

#### 14.2 Get Complaint by ID

```
GET /api/complaints/:id
```

**Protected Endpoint**

---

#### 14.3 Create Complaint

```
POST /api/complaints
```

**Protected Endpoint** - Authenticated user

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Complaint title |
| description | string | Yes | Complaint description |
| category | string | Yes | Category (technical, content, behavior, etc) |

---

#### 14.4 Update Complaint Status

```
PUT /api/complaints/:id
```

**Protected Endpoint** - Admin

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Status (open, in-progress, resolved, closed) |
| resolution | string | Resolution details |

---

#### 14.5 Delete Complaint

```
DELETE /api/complaints/:id
```

**Protected Endpoint** - Author, Admin

---

## Rate Limiting

Currently, no rate limiting is implemented. Future versions may include:
- Request throttling
- IP-based rate limiting
- User-based rate limiting

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
```
?page=1&limit=10
```

**Response Includes:**
```json
{
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

## Filtering

List endpoints support filtering by various parameters. Examples:

```
GET /api/students/admin/all?status=active
GET /api/quizzes?subject=Mathematics&grade=10
GET /api/teachers?subject=Science&status=approved
```

---

## Sorting

Some endpoints support sorting:

```
GET /api/donations?sortBy=amount&sortOrder=desc
```

---

## Testing Guide

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "userType": "student"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Protected Request:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Webhook Events

### PayHere Payment Notification

Triggered when a payment is completed or fails.

**Payload:**
```json
{
  "merchant_id": "1234928",
  "order_id": "donation_id",
  "payhere_amount": "5000",
  "payhere_currency": "LKR",
  "status_code": "2",
  "status_message": "Payment successful",
  "md5sig": "hash_signature"
}
```

---

## Versioning

Current API Version: 1.0.0

Future versions will maintain backward compatibility where possible.

---

## Deprecated Endpoints

None currently deprecated.

---

## Terms of Service

- API is provided for educational purposes
- Rate limiting may be implemented in future versions
- API terms may change with notice

---

**Last Updated:** December 2024
**Version:** 1.0.0
