# Troubleshooting: Dashboard Shows 0 Employees

## Problem
The admin dashboard displays 0 employees even though the database contains 10 employees.

## Diagnostic Steps

### 1. Check Browser Console
Open the browser console (press F12) and look for:

**Expected logs when everything works:**
```
Loading employee stats...
Stats response: {success: true, data: {total: 10, admins: 1, employees: 9, departments: [...]}}
Stats data: {total: 10, admins: 1, employees: 9, departments: [...]}
```

**If you see errors:**
- `Failed to load stats: Error: Network Error` → Backend not running or wrong URL
- `Failed to load stats: Error: Request failed with status code 401` → JWT token issue
- `Failed to load stats: Error: Request failed with status code 500` → Backend database issue
- `Stats fetch unsuccessful: {success: false, error: "..."}` → Backend returned error

### 2. Verify Backend is Running

**Check backend status:**
```bash
cd backend
npm run dev
```

**Expected output:**
```
Server is running on port 5000
Environment: development
✓ MongoDB Connected: <your-cluster>.mongodb.net
API health check: http://localhost:5000/health
```

**If you see errors:**
- `✗ Database connection error` → Check MongoDB URI in `backend/.env`
- Port 5000 already in use → Kill existing process or change port
- Module not found → Run `npm install` in backend directory

### 3. Test Backend API Directly

**Test the stats endpoint:**
```bash
# First, login to get a token (replace with your admin credentials)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}'

# Copy the token from response, then test stats endpoint
curl http://localhost:5000/api/employees/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "admins": 1,
    "employees": 9,
    "departments": [...]
  }
}
```

### 4. Check Frontend Environment

**Verify `.env.local` exists:**
```bash
cd frontend
cat .env.local
```

**Should contain:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**If file doesn't exist:**
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### 5. Check MongoDB Database

**Verify employees exist in database:**
```bash
# If using MongoDB shell
mongosh "your_mongodb_uri"
use attendance_portal
db.employees.countDocuments()  # Should return 10
db.employees.find({})         # Should show all employees
```

**Or using MongoDB Compass:**
1. Connect to your cluster
2. Open `attendance_portal` database
3. Open `employees` collection
4. Verify 10 documents exist

### 6. Check JWT Token

**In browser console:**
```javascript
localStorage.getItem('token')
```

**If null or expired:**
1. Logout and login again
2. Token should be refreshed
3. Try accessing admin dashboard again

### 7. Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload admin dashboard
4. Look for request to `/api/employees/stats`
5. Check:
   - Status: Should be 200 OK
   - Response: Should contain employee data
   - Headers: Should include `Authorization: Bearer <token>`

## Common Issues and Solutions

### Issue 1: CORS Error
**Symptom:** Console shows CORS policy error
**Solution:** 
1. Check backend is running on port 5000
2. Verify CORS is enabled in `backend/src/app.js`
3. Make sure frontend URL is allowed in CORS config

### Issue 2: 401 Unauthorized
**Symptom:** Stats API returns 401
**Solution:**
1. Logout and login again
2. Check user has admin role in database
3. Verify JWT_SECRET in `backend/.env` matches

### Issue 3: 500 Internal Server Error
**Symptom:** Backend returns 500 error
**Solution:**
1. Check backend console for error details
2. Verify MongoDB connection is working
3. Check database has correct collections

### Issue 4: Database Empty
**Symptom:** API works but returns 0 employees
**Solution:**
1. Check if employees exist in database
2. Run seed script to populate data:
   ```bash
   cd database-seed
   npm install
   node seedDataSimple.js
   ```

### Issue 5: Wrong API URL
**Symptom:** Network error or timeout
**Solution:**
1. Check `frontend/.env.local` has correct API URL
2. Verify backend port matches (default 5000)
3. Restart frontend: `npm run dev`

## Quick Fix Checklist

- [ ] Backend is running (`cd backend && npm run dev`)
- [ ] MongoDB is connected (check backend console)
- [ ] Frontend is running (`cd frontend && npm run dev`)
- [ ] `.env.local` exists with correct API URL
- [ ] Logged in as admin user
- [ ] JWT token is valid (logout/login if needed)
- [ ] Database has employee records
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls

## Still Not Working?

**Collect debug information:**

1. **Backend logs:**
   - Copy entire backend console output
   - Look for database connection status
   - Check for any error messages

2. **Frontend console logs:**
   - Copy all console.log outputs
   - Include any error messages
   - Note the stats response

3. **API test results:**
   - Result of login API call
   - Result of stats API call with token
   - Network tab screenshot

4. **Database verification:**
   - Count of employees in database
   - Sample employee document
   - Database name and collection names

Share this information for further assistance!

## Expected Data Flow

```
Browser (Admin Dashboard)
  ↓ GET /api/employees/stats + JWT Token
Backend API (Express.js)
  ↓ Verify JWT Token
  ↓ Check Admin Role
  ↓ Query MongoDB
MongoDB Database
  ↓ Return count and aggregations
Backend API
  ↓ Format Response
Browser
  ↓ Display Stats
```

Any break in this chain will cause the dashboard to show 0 employees.
