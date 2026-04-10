# OpenLesson - Quick Setup Guide

Fast setup instructions to get the OpenLesson platform running locally.

## Prerequisites

✓ Node.js v14+ installed
✓ MongoDB running (local or MongoDB Atlas)
✓ Git installed
✓ npm or yarn

---

## Backend Setup (5 minutes)

### Step 1: Navigate to Backend
```bash
cd openlesson/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create .env File
Create `backend/.env` with:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/openlesson

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Admin
ADMIN_EMAIL=admin@openlesson.com
ADMIN_PASSWORD=Admin@123456

# Frontend URL
FRONTEND_URL=http://localhost:5173

# External Services (Optional for full features)
PAYHERE_MERCHANT_ID=1234928
PAYHERE_MERCHANT_SECRET=your_secret
ZOOM_ACCOUNT_ID=your_zoom_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_secret
```

### Step 4: Seed Admin User
```bash
npm run seed:admin
```

You should see:
```
✓ Admin user created successfully
```

### Step 5: Start Development Server
```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

---

## Frontend Setup (5 minutes)

### Step 1: Navigate to Frontend
```bash
cd openlesson/frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create .env File
Create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000
```

### Step 4: Start Development Server
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Verify Installation

### Backend Health Check
```bash
curl http://localhost:5000/api/auth/me
```

Expected: 401 (No token - that's OK!)

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@openlesson.com",
    "password": "Admin@123456"
  }'
```

Expected: JWT token in response

---

## First Steps in the App

### 1. Access Frontend
Open browser: `http://localhost:5173`

### 2. Login as Admin
- Email: `admin@openlesson.com`
- Password: `Admin@123456`

### 3. Create Test Users
- Register as Student
- Register as Teacher
- Register as Donor

### 4. Test Features
- Create announcements (Admin)
- Add study materials (Teacher)
- Create quizzes (Teacher)
- Schedule sessions (Teacher)

---

## Common Issues

### MongoDB Connection Failed
```
Error: connect EREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running: `mongod`
- Or use MongoDB Atlas connection string in `.env`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:**
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

### CORS Error in Frontend
```
Access to XMLHttpRequest blocked by CORS
```
**Solution:**
- Ensure `FRONTEND_URL` is set in backend `.env`
- Restart backend server

### Token Expired
- User needs to login again
- Tokens expire after 7 days

### Files Not Uploading
**Solution:**
- Ensure `uploads/` folder exists in backend
- Check folder permissions
- Verify max file size in `.env`

---

## Available Commands

### Backend
```bash
npm run dev       # Development with hot reload
npm start         # Production mode
npm run seed:admin    # Create admin user
npm run cleanup:indexes   # Clean up DB indexes
```

### Frontend
```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # Check code quality
npm run preview   # Preview production build
```

---

## Environment Variables Quick Reference

### Backend `.env`

| Variable | Example | Required |
|----------|---------|----------|
| PORT | 5000 | Yes |
| NODE_ENV | development | Yes |
| MONGODB_URI | mongodb+srv://user:pass@... | Yes |
| JWT_SECRET | random_string_here | Yes |
| JWT_EXPIRE | 7d | Yes |
| ADMIN_EMAIL | admin@openlesson.com | Yes |
| ADMIN_PASSWORD | Admin@123456 | Yes |
| FRONTEND_URL | http://localhost:5173 | Yes |
| PAYHERE_MERCHANT_ID | 123456 | No |
| PAYHERE_MERCHANT_SECRET | secret | No |
| ZOOM_ACCOUNT_ID | zoom_id | No |
| ZOOM_CLIENT_ID | client_id | No |
| ZOOM_CLIENT_SECRET | secret | No |

### Frontend `.env`

| Variable | Example | Required |
|----------|---------|----------|
| VITE_API_URL | http://localhost:5000 | Yes |

---

## Project Structure

```
openlesson/
├── backend/
│   ├── src/
│   │   ├── controllers/    (Business logic)
│   │   ├── models/         (Database schemas)
│   │   ├── routes/         (API endpoints)
│   │   ├── middleware/     (Auth, upload, etc)
│   │   └── utils/          (Helper functions)
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/     (React components)
│   │   ├── pages/          (Page components)
│   │   ├── hooks/          (Custom hooks)
│   │   └── assets/         (Images, etc)
│   ├── package.json
│   └── .env
└── README.md
```

---

## Development Workflow

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

### 3. Open Browser
Go to: `http://localhost:5173`

### 4. Start Coding!
- Backend changes auto-reload (nodemon)
- Frontend changes auto-reload (Vite HMR)

---

## Building for Production

### Build Backend
No special build needed for Node.js. Deploy server.js directly.

### Build Frontend
```bash
cd frontend
npm run build
```

Output in `frontend/dist/` - ready to deploy!

---

## Database Setup

### Using MongoDB Locally

**Windows:**
```bash
mongod
```

**Mac (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo systemctl start mongodb
```

### Using MongoDB Atlas (Cloud)

1. Create account at [mongodb.com](https://mongodb.com)
2. Create cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

Format:
```
mongodb+srv://username:password@cluster.mongodb.net/database
```

---

## API Base URL

```
http://localhost:5000/api
```

### Common Endpoints for Testing

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

**Students:**
- `GET /api/students/my-profile` - Get student profile
- `PUT /api/students/my-profile` - Update profile

**Teachers:**
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/my-profile` - Get teacher profile

**Quizzes:**
- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create quiz (teacher/admin)

**Study Materials:**
- `GET /api/study-materials` - Get all materials
- `POST /api/study-materials` - Create material (teacher/admin)

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for full API reference.

---

## Testing with Postman

### 1. Import Environment
Create new environment in Postman with:
```json
{
  "base_url": "http://localhost:5000/api",
  "token": ""
}
```

### 2. Login to Get Token
- Request: `POST {{base_url}}/auth/login`
- Body:
  ```json
  {
    "email": "admin@openlesson.com",
    "password": "Admin@123456"
  }
  ```
- Copy token from response

### 3. Set Token
Set in Postman environment:
```
token: <token_from_response>
```

### 4. Use Token in Requests
Add header:
```
Authorization: Bearer {{token}}
```

---

## Debugging

### Backend Logs
Check console output in terminal running `npm run dev`

### Frontend Errors
Check browser console:
- Chrome/Edge: `F12` → Console tab
- Firefox: `F12` → Console tab

### MongoDB Issues
Check MongoDB is running and accessible:
```bash
mongosh
```

### Network Issues
Check if ports are open:
```bash
# Backend
curl http://localhost:5000

# Frontend
curl http://localhost:5173
```

---

## Next Steps

1. ✓ Setup complete!
2. Read [README.md](README.md) for detailed documentation
3. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for full API reference
4. Start building features!

---

## Support

### Getting Help
1. Check README.md and API_DOCUMENTATION.md
2. Check browser console for errors
3. Check backend terminal logs
4. Verify `.env` configuration

### Common Questions

**Q: How do I add a new route?**
A: Create file in `src/routes/`, establish the route pattern, add controller, and import in `src/app.js`

**Q: How do I add a new model?**
A: Create Mongoose schema in `src/models/`, define fields and validation

**Q: How do I protect routes?**
A: Use middleware from `src/middleware/auth.js` - `protect` for auth, `authorize` for roles

**Q: How do I handle file uploads?**
A: Use setup in `src/middleware/upload.js` and Multer configuration

---

**Ready to start? Run:**

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Open browser
http://localhost:5173
```

Happy coding! 🚀
