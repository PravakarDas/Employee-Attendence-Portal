# Admin Panel - Usage Guide

## Quick Start

### 1. Prerequisites
- MongoDB instance running (local or cloud)
- Node.js installed
- Backend and frontend dependencies installed

### 2. Configuration

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret_key
PORT=5000
```

#### Frontend (.env.local)
```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### 3. Start the Application

Terminal 1 - Backend:
```bash
cd backend
npm install
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Admin Panel

1. Open browser: `http://localhost:3000`
2. Login with admin credentials
3. Navigate to `/admin` or click the logo

## Features Available

### Employee Management

#### Create Employee
1. Click "Add Employee" button
2. Fill in the form:
   - Name (required)
   - Email (required, must be unique)
   - Password (required, minimum 6 characters)
   - Department (required)
   - Role (employee/manager/admin)
3. Click "Create Employee"
4. Success notification will appear

#### Edit Employee
1. Find employee in the list
2. Click "Edit" button
3. Update fields as needed
4. Leave password blank to keep current password
5. Click "Update Employee"

#### Delete Employee
1. Find employee in the list
2. Click "Delete" button
3. Confirm deletion in modal
4. Note: Cannot delete the last admin user

#### Search Employees
- Type in search box at the top
- Searches: name, email, department
- Updates automatically as you type

### Attendance Management

#### View Attendance Records
1. Go to "Attendance Management" tab
2. Select employee or "All Employees"
3. Set date range
4. View records with:
   - Check-in time
   - Check-out time
   - Total hours worked
   - Status

## API Endpoints Used

All endpoints require admin authentication:

```
GET    /api/employees              - List employees with pagination
GET    /api/employees/stats        - Get statistics
GET    /api/employees/:id          - Get single employee
POST   /api/employees              - Create new employee
PUT    /api/employees/:id          - Update employee
DELETE /api/employees/:id          - Delete employee
GET    /api/attendance/employee/:id - Get employee attendance
```

## Database Structure

### Employees Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (employee|manager|admin),
  department: String,
  faceEmbedding: Array,
  faceRegisteredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Collection
```javascript
{
  _id: ObjectId,
  employee_id: ObjectId (ref: Employee),
  check_in: Date,
  check_out: Date,
  total_hours: Number,
  date: Date,
  status: String (active|completed|absent|leave),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

✓ JWT-based authentication
✓ Role-based access control (admin only)
✓ Password hashing with bcrypt
✓ Input validation on frontend and backend
✓ Protection against last admin deletion
✓ CORS and rate limiting configured
✓ Email uniqueness validation
✓ Secure password requirements

## Troubleshooting

### Cannot connect to database
- Check MongoDB URI in backend/.env
- Ensure MongoDB is running
- Check network connectivity

### API calls failing
- Verify backend is running on port 5000
- Check frontend .env.local has correct API URL
- Verify JWT token is valid (try logging out and back in)

### Admin panel not accessible
- Ensure logged in user has admin role
- Check browser console for errors
- Verify token is being sent in Authorization header

### Employee creation fails
- Check for duplicate email
- Ensure all required fields are filled
- Verify password meets minimum length (6 characters)
- Check backend logs for detailed errors

## Development Tips

### Adding New Fields to Employee
1. Update backend model: `backend/src/models/Employee.js`
2. Update frontend forms: `CreateEmployeeModal.jsx` and `EditEmployeeModal.jsx`
3. Update validation in: `frontend/src/utils/validation.js`
4. Update table display in: `EmployeeManagement.jsx`

### Testing CRUD Operations
```bash
# Use the seed script to create test data
cd database-seed
npm install
node seedDataSimple.js
```

### Monitoring Database Operations
- Check backend console for MongoDB queries
- Use MongoDB Compass for visual database inspection
- Enable Morgan logging in development mode

## Next Steps

Potential enhancements:
- Export attendance reports to Excel/CSV
- Bulk employee import
- Advanced search and filtering
- Employee performance analytics
- Email notifications
- Activity audit logs
- Department management UI
