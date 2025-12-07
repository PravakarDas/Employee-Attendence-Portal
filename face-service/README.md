# Face Recognition Microservice

This service provides face detection and recognition using InsightFace (ArcFace + RetinaFace).

## Setup

1. **Create virtual environment:**
```bash
python -m venv venv
```

2. **Activate virtual environment:**
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Download InsightFace models:**
The models will be automatically downloaded on first run (~200MB).

5. **Run the service:**
```bash
python app.py
```

Or using uvicorn:
```bash
uvicorn app:app --host 0.0.0.0 --port 5001 --reload
```

## API Endpoints

### Health Check
- **GET** `/` - Check service status

### Extract Embedding
- **POST** `/embed`
- Body: `{ "image": "base64_encoded_image" }`
- Returns: `{ "embedding": [512 floats], "confidence": 0.99, "bbox": [x1,y1,x2,y2] }`

### Detect Faces
- **POST** `/detect`
- Body: `{ "image": "base64_encoded_image" }`
- Returns: `{ "faces_detected": 1, "faces": [...] }`

### Compare Embeddings
- **POST** `/compare`
- Body: `{ "embedding1": [...], "embedding2": [...] }`
- Returns: `{ "similarity": 0.87, "is_match": true }`

## Model Info

- **Detection**: RetinaFace (part of buffalo_l)
- **Recognition**: ArcFace ResNet100 (512-dim embeddings)
- **Accuracy**: State-of-the-art on LFW benchmark
- **Speed**: ~100-200ms per image on CPU

## Notes

- Service runs on port 5001 by default (backend runs on 5000)
- First run will download models (~200MB)
- For GPU acceleration, install onnxruntime-gpu and set CUDA provider
- Adjust FACE_MATCH_THRESHOLD in .env based on your testing
