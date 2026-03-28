# Ref Model Tests (Minimal)

Use IDs from previous responses.

## 1) Grade
POST http://localhost:5000/api/grades
```json
{
  "gradeName": "Grade 10",
  "description": "Grade 10"
}
```

## 2) Subject
POST http://localhost:5000/api/subjects
```json
{
  "subjectName": "Mathematics",
  "description": "Math"
}
```

## 3) Register Teacher (creates User + Teacher refs User)
POST http://localhost:5000/api/auth/register
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

## 4) Register Student (creates User + Student refs User, Grade)
POST http://localhost:5000/api/auth/register
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

## 5) Register Donor (creates User + Donor refs User)
POST http://localhost:5000/api/auth/register
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

## 6) Study Material (refs Subject, Grade, Teacher)
POST http://localhost:5000/api/study-materials
```json
{
  "title": "Algebra Basics",
  "description": "Chapter 1",
  "subjectId": "<SUBJECT_ID>",
  "gradeId": "<GRADE_ID>",
  "teacherId": "<TEACHER_ID>",
  "materialType": "PDF",
  "fileUrl": "https://example.com/algebra.pdf"
}
```

## 7) Study Session (refs Subject, Grade, Teacher)
POST http://localhost:5000/api/study-sessions
```json
{
  "title": "Live Algebra Class",
  "description": "Session 1",
  "subjectId": "<SUBJECT_ID>",
  "gradeId": "<GRADE_ID>",
  "teacherId": "<TEACHER_ID>",
  "date": "2026-04-01",
  "startTime": "10:00",
  "endTime": "11:00",
  "meetingLink": "https://meet.example.com/session-1"
}
```

## 8) Quiz (refs Subject, Grade, Teacher)
POST http://localhost:5000/api/quizzes
```json
{
  "title": "Algebra Quiz 1",
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

## 9) Feedback (refs Student, Teacher) - login as student first
POST http://localhost:5000/api/feedback
```json
{
  "teacherId": "<TEACHER_ID>",
  "rating": 5,
  "comment": "Great class"
}
```

## 10) Complaint (refs Student) - login as student first
POST http://localhost:5000/api/complaints
```json
{
  "subject": "Video issue",
  "description": "Session video not loading",
  "category": "Video/Content Issue"
}
```

## 11) Donation (refs Donor) - login as donor first
POST http://localhost:5000/api/donations
```json
{
  "amount": 100,
  "paymentMethod": "Card",
  "message": "Support for students"
}
```

## 12) Announcement (refs Subject, Grade)
POST http://localhost:5000/api/announcements
```json
{
  "title": "Exam Update",
  "message": "Exam starts next week",
  "postedBy": "<ADMIN_USER_ID>",
  "targetRole": "student",
  "subjectId": "<SUBJECT_ID>",
  "gradeId": "<GRADE_ID>",
  "status": "Active"
}
```
