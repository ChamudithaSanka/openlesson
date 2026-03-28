# System Tests (Minimal)

Base URL: http://localhost:5000

## 1) Seed admin (one-time)
`npm run seed:admin`

## 2) Admin login
POST /api/auth/login
```json
{
  "email": "<ADMIN_EMAIL>",
  "password": "<ADMIN_PASSWORD>",
  "userType": "admin"
}
```
Use token as: `Authorization: Bearer <ADMIN_TOKEN>`

## 3) Create grade (admin)
POST /api/grades
```json
{
  "gradeName": "Grade 10",
  "description": "Grade 10"
}
```

## 4) Create subject (admin)
POST /api/subjects
```json
{
  "subjectName": "Mathematics",
  "description": "Math"
}
```

## 5) Register teacher
POST /api/auth/register
```json
{
  "email": "teacher@test.com",
  "password": "pass123",
  "userType": "teacher",
  "fullName": "Teacher One",
  "phone": "1111111111",
  "qualification": "B.Ed"
}
```

## 6) Teacher login
POST /api/auth/login
```json
{
  "email": "teacher@test.com",
  "password": "pass123",
  "userType": "teacher"
}
```
Use token as: `Authorization: Bearer <TEACHER_TOKEN>`

## 7) Register student
POST /api/auth/register
```json
{
  "email": "student@test.com",
  "password": "pass123",
  "userType": "student",
  "fullName": "Student One",
  "phone": "2222222222",
  "gradeId": "<GRADE_ID>"
}
```

## 8) Student login
POST /api/auth/login
```json
{
  "email": "student@test.com",
  "password": "pass123",
  "userType": "student"
}
```
Use token as: `Authorization: Bearer <STUDENT_TOKEN>`

## 9) Register donor
POST /api/auth/register
```json
{
  "email": "donor@test.com",
  "password": "pass123",
  "userType": "donor",
  "fullName": "Donor One",
  "phone": "3333333333",
  "companyName": "Donor Org"
}
```

## 10) Donor login
POST /api/auth/login
```json
{
  "email": "donor@test.com",
  "password": "pass123",
  "userType": "donor"
}
```
Use token as: `Authorization: Bearer <DONOR_TOKEN>`

## 11) Teacher creates quiz (teacher/admin)
POST /api/quizzes
```json
{
  "title": "Quiz 1",
  "description": "Basics",
  "subjectId": "<SUBJECT_ID>",
  "gradeId": "<GRADE_ID>",
  "duration": 30,
  "createdBy": "<TEACHER_ID>",
  "questions": [
    {
      "questionText": "2 + 2 = ?",
      "questionType": "single",
      "options": ["3", "4", "5", "6"],
      "correctAnswers": [1]
    }
  ]
}
```

## 12) Student creates feedback (student only)
POST /api/feedback
```json
{
  "teacherId": "<TEACHER_ID>",
  "rating": 5,
  "comment": "Great class"
}
```

## 13) Student creates complaint (student only)
POST /api/complaints
```json
{
  "subject": "Video issue",
  "description": "Session video not loading",
  "category": "Video/Content Issue"
}
```

## 14) Donor creates donation (donor only)
POST /api/donations
```json
{
  "amount": 100,
  "paymentMethod": "Card",
  "message": "Support for students"
}
```

## 15) Admin-only quick checks
GET /api/donors
GET /api/donations
GET /api/feedback
