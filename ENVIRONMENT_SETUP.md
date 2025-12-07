# Environment Setup Guide

## Environment Files

This project uses environment variables for configuration. The following files are **NOT tracked by git** and must be created locally:

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
BCRYPT_SALT_ROUNDS=12

# Face Recognition Service
ML_SERVICE_URL=http://localhost:5001
FACE_MATCH_THRESHOLD=0.45
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Face Service (`face-service/.env`)
```env
PORT=5001
HOST=0.0.0.0
MODEL_NAME=VGG-Face
```

## Setup Instructions

1. **Copy example files:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Face Service
   cp face-service/.env.example face-service/.env
   
   # Frontend (create manually)
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > frontend/.env.local
   ```

2. **Update configuration:**
   - Edit `backend/.env` with your MongoDB connection string
   - Update `JWT_SECRET` with a secure random string
   - Adjust other settings as needed

3. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   
   # Face Service
   cd ../face-service
   python -m venv venv
   venv\Scripts\Activate.ps1  # Windows
   pip install -r requirements.txt
   ```

## Security Notes

- **Never commit** `.env` files to version control
- Keep your `JWT_SECRET` secure and unique
- Use strong MongoDB credentials
- Rotate secrets regularly in production
- Use `.env.example` files as templates (these are safe to commit)

## Ignored Files

The following files and directories are ignored by git (see `.gitignore`):

### Environment Files
- `backend/.env`
- `frontend/.env.local`
- `frontend/.env.production.local`
- `frontend/.env.development.local`
- `face-service/.env`

### Python Files
- `face-service/venv/`
- `__pycache__/`
- `*.pyc`
- `.deepface/` (model cache)

### Node.js Files
- `node_modules/`
- `.next/`
- `out/`

### IDE Files
- `.vscode/`
- `.idea/`

### Temporary Files
- `temp_face.jpg`
- `temp_face_detect.jpg`
- `dump/`
- `*.tmp`

### OS Files
- `.DS_Store`
- `Thumbs.db`
- `desktop.ini`
