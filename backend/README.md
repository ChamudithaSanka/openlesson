# OpenLesson Backend API - Quiz CRUD Operations

A clean and simple REST API for managing quizzes in an online education platform.

## 📁 Project Structure

```
backend/
├── server.js                    # Main server entry point
├── package.json                 # Dependencies and scripts
├── .env                        # Environment variables (not in git)
├── .gitignore                  # Git ignore file
└── src/
    ├── config/
    │   └── database.js         # MongoDB connection configuration
    ├── controllers/
    │   └── quizController.js   # Quiz business logic (CRUD operations)
    ├── models/
    │   └── Quiz.js             # Quiz schema and model
    └── routes/
        └── quizRoutes.js       # API route definitions
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Edit the `.env` file to match your setup:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/openlesson
```

### 3. Start MongoDB
Make sure MongoDB is running on your local machine.

### 4. Start the Server
```bash
npm start
```

Server will run at: `http://localhost:5000`

## 📮 API Endpoints

### Base URL: `http://localhost:5000/api/quizzes`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/quizzes` | Get all quizzes |
| GET    | `/api/quizzes/:id` | Get single quiz by ID |
| POST   | `/api/quizzes` | Create new quiz |
| PUT    | `/api/quizzes/:id` | Update quiz by ID |
| DELETE | `/api/quizzes/:id` | Delete quiz by ID |

## 📝 Quiz Schema

```javascript
{
  _id: ObjectId,              // Auto-generated
  title: String,              // Required, max 200 chars
  description: String,        // Required
  teacherId: ObjectId,        // Required, reference to Teacher
  subjectId: ObjectId,        // Required, reference to Subject
  gradeId: ObjectId,          // Required, reference to Grade
  status: String,             // 'draft', 'published', or 'archived'
  timeLimit: Number,          // Required, in minutes (min: 1)
  totalPoints: Number,        // Required, min: 0
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

## 🧪 Testing with Postman

### 1. CREATE Quiz (POST)
**URL:** `http://localhost:5000/api/quizzes`  
**Method:** POST  
**Body (JSON):**
```json
{
  "title": "Mathematics Quiz 1",
  "description": "Basic algebra and geometry questions",
  "teacherId": "65a1b2c3d4e5f6789abcdef0",
  "subjectId": "65a1b2c3d4e5f6789abcdef1",
  "gradeId": "65a1b2c3d4e5f6789abcdef2",
  "status": "published",
  "timeLimit": 30,
  "totalPoints": 100
}
```

### 2. GET All Quizzes (GET)
**URL:** `http://localhost:5000/api/quizzes`  
**Method:** GET

### 3. GET Single Quiz (GET)
**URL:** `http://localhost:5000/api/quizzes/QUIZ_ID_HERE`  
**Method:** GET

### 4. UPDATE Quiz (PUT)
**URL:** `http://localhost:5000/api/quizzes/QUIZ_ID_HERE`  
**Method:** PUT  
**Body (JSON):**
```json
{
  "title": "Updated Mathematics Quiz",
  "timeLimit": 45,
  "totalPoints": 150
}
```

### 5. DELETE Quiz (DELETE)
**URL:** `http://localhost:5000/api/quizzes/QUIZ_ID_HERE`  
**Method:** DELETE

## ✅ Response Format

### Success Response
```json
{
  "success": true,
  "message": "Quiz created successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 🔧 Status Codes

- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `404` - Not Found (quiz doesn't exist)
- `500` - Server Error (database issues, etc.)

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB object modeling
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **nodemon** - Auto-restart during development

## 🎯 Features

✅ Clean CRUD operations  
✅ MongoDB schema validation  
✅ Automatic timestamps (createdAt, updatedAt)  
✅ Status field with enum validation  
✅ Comprehensive error handling  
✅ RESTful API design  
✅ Well-commented code for easy maintenance
