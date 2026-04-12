# Deployment Checklist - OpenLesson

## ✅ Changes Already Made ✅

### Backend
- [x] CORS configured to accept FRONTEND_URL environment variable
- [x] Graceful shutdown handling added
- [x] `.env.example` created with all required variables

### Frontend  
- [x] All hardcoded `http://localhost:5000` URLs replaced with `import.meta.env.VITE_API_URL`
- [x] All API calls now support environment variables
- [x] `.env.example` created

---

## 🚀 NEXT STEPS: Deploy to Render & Vercel

### Step 1: Push Code to GitHub
```bash
cd c:\Users\adeep\OneDrive\Desktop\openlesson
git add .
git commit -m "Prepare for production deployment - add env vars and fix CORS"
git push origin main
```

---

### Step 2: Deploy Backend to Render

1. **Go to**: https://render.com
2. **Sign in** with GitHub account
3. **Create New Web Service**:
   - Name: `openlesson-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables** (copy from `.env.example`):
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/openlesson
   JWT_SECRET=your-secret-key-min-32-chars
   SENDGRID_API_KEY=SG.xxx
   GOOGLE_API_KEY=xxx
   ZOOM_ACCOUNT_ID=xxx
   ZOOM_CLIENT_ID=xxx
   ZOOM_CLIENT_SECRET=xxx
   NODE_ENV=production
   FRONTEND_URL=https://openlesson.vercel.app (SET THIS AFTER FRONTEND URL IS READY)
   PAYHERE_MERCHANT_ID=xxx
   PAYHERE_ENV=live
   MONGODB_URI=mongodb+srv://...
   ```

5. **Click Deploy** → Wait 2-3 minutes
6. **Save your backend URL**: `https://openlesson-backend.onrender.com`

---

### Step 3: Deploy Frontend to Vercel

1. **Go to**: https://vercel.com
2. **Sign in** with GitHub account
3. **Add Project** → Import your repository
4. **Configure**:
   - Framework: `Vite`
   - Root Directory: `frontend/`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Add Environment Variables**:
   ```
   VITE_API_URL=https://openlesson-backend.onrender.com/api
   VITE_API_BASE_URL=https://openlesson-backend.onrender.com
   ```

6. **Click Deploy** → Wait 1-2 minutes
7. **Save your frontend URL**: `https://openlesson.vercel.app`

---

### Step 4: Update Render FRONTEND_URL (Critical!)

1. **Go back to Render Dashboard** → Your backend service
2. **Click Environment** → Edit `FRONTEND_URL` variable
3. **Change to**: `https://openlesson.vercel.app` (your actual Vercel URL)
4. **Redeploy automatically** or manual redeploy

---

## 🧪 Verification Tests

After deployment, test these:

### Backend Health
```bash
curl https://openlesson-backend.onrender.com/api/auth
```
Should return some response (not 404)

### Frontend Console Check
1. Open your Vercel frontend URL
2. Press `F12` to open Developer Tools
3. Check Console tab for errors
4. Look for CORS errors (should be none)

### API Call Test
In browser console, run:
```javascript
fetch('https://openlesson-backend.onrender.com/api/auth')
  .then(r => r.json())
  .then(d => console.log('Success:', d))
  .catch(e => console.error('Error:', e))
```

### Login Test
1. Go to your frontend URL
2. Try to login
3. Should redirect to dashboard (not show CORS error)

---

## 🆘 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| **CORS Error 403** | Update `FRONTEND_URL` in Render backend with correct Vercel URL |
| **API calls fail** | Check `VITE_API_URL` is set correctly in Vercel (must have `/api` at end) |
| **MongoDB connection fails** | Verify connection string & whitelist IP in MongoDB Atlas (use `0.0.0.0/0` for testing) |
| **Build fails on Vercel** | Check `npm install` works locally in frontend folder |
| **Build fails on Render** | Check `npm install` works locally in backend folder |
| **404 on API endpoints** | Verify backend started successfully - check Render logs |

---

## 📋 Environment Variables Reference

### For Render (Backend)
```
MONGODB_URI                          ← Get from MongoDB Atlas
JWT_SECRET                           ← Generate strong random string
SENDGRID_API_KEY                    ← From SendGrid dashboard
GOOGLE_API_KEY                      ← From Google Cloud Console
ZOOM_ACCOUNT_ID                     ← From Zoom App Marketplace
ZOOM_CLIENT_ID                      ← From Zoom App Marketplace
ZOOM_CLIENT_SECRET                  ← From Zoom App Marketplace
PAYHERE_MERCHANT_ID                 ← From PayHere merchant dashboard
PAYHERE_ENV                         ← 'live' for production, 'sandbox' for testing
FRONTEND_URL                        ← Your Vercel frontend URL (e.g., https://openlesson.vercel.app)
NODE_ENV                            ← 'production'
```

### For Vercel (Frontend)
```
VITE_API_URL=https://openlesson-backend.onrender.com/api
VITE_API_BASE_URL=https://openlesson-backend.onrender.com
```

---

## 📚 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **App Logs in Render**: Dashboard → Your Service → Logs
- **App Logs in Vercel**: Dashboard → Your Project → Deployments → View Logs

---

## ✨ Auto-Deployment Setup (Optional)

Both Render and Vercel automatically deploy when you push to GitHub:

```bash
git add .
git commit -m "Fix deployments"
git push origin main
```

The services will detect the push and auto-deploy within 1-2 minutes.

---

## 🎯 Final Checklist

- [ ] Code pushed to GitHub with all changes
- [ ] Backend deployed on Render with all env variables
- [ ] Frontend deployed on Vercel with API URL env variable
- [ ] Backend CORS updated with frontend URL
- [ ] No CORS errors in browser console
- [ ] Login works end-to-end
- [ ] Database queries work
- [ ] File uploads work (if applicable)
- [ ] Render logs show no errors
- [ ] Vercel logs show successful build

---

**Deployment complete when:**
- Backend URL works: `https://your-backend.onrender.com`
- Frontend URL works: `https://your-frontend.vercel.app`
- Frontend can call backend APIs without CORS errors
- Login/Authentication works correctly

🎉 **You're ready to deploy!**
