import os
import base64
import io
import logging
from typing import List
import numpy as np
from PIL import Image
import cv2
from deepface import DeepFace
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Face Recognition Service",
    description="ML service for face detection and recognition using DeepFace",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class ImageRequest(BaseModel):
    image: str  # base64 encoded image

class EmbeddingResponse(BaseModel):
    success: bool
    embedding: List[float] = None
    confidence: float = None
    bbox: dict = None
    error: str = None

class DetectionResponse(BaseModel):
    success: bool
    faces_detected: int = 0
    faces: List[dict] = []
    error: str = None

class CompareRequest(BaseModel):
    embedding1: List[float]
    embedding2: List[float]

class CompareResponse(BaseModel):
    success: bool
    similarity: float = None
    matched: bool = False
    error: str = None

# Helper functions
def decode_base64_image(base64_string: str) -> np.ndarray:
    """Decode base64 string to image array"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy array (BGR for OpenCV)
        image_array = np.array(image)
        image_bgr = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        
        return image_bgr
    except Exception as e:
        logger.error(f"Error decoding image: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

def cosine_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
    """Calculate cosine similarity between two embeddings"""
    try:
        # Normalize embeddings
        embedding1_norm = embedding1 / np.linalg.norm(embedding1)
        embedding2_norm = embedding2 / np.linalg.norm(embedding2)
        
        # Calculate cosine similarity
        similarity = np.dot(embedding1_norm, embedding2_norm)
        
        return float(similarity)
    except Exception as e:
        logger.error(f"Error calculating similarity: {str(e)}")
        return 0.0

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Face Recognition Service",
        "status": "running",
        "library": "DeepFace (VGG-Face)",
        "version": "1.0.0"
    }

@app.post("/embed", response_model=EmbeddingResponse)
async def extract_embedding(request: ImageRequest):
    """Extract face embedding from image"""
    try:
        logger.info("Extracting face embedding...")
        
        # Decode image
        image_array = decode_base64_image(request.image)
        
        # Save temp image for DeepFace
        temp_path = "temp_face.jpg"
        cv2.imwrite(temp_path, image_array)
        
        try:
            # Extract embedding using DeepFace
            embedding_objs = DeepFace.represent(
                img_path=temp_path,
                model_name="VGG-Face",  # Fast and accurate
                detector_backend="opencv",  # Use opencv for consistency
                enforce_detection=True
            )
            
            if len(embedding_objs) == 0:
                return EmbeddingResponse(
                    success=False,
                    error="No face detected in the image"
                )
            
            if len(embedding_objs) > 1:
                logger.warning(f"Multiple faces detected ({len(embedding_objs)}), using the first one")
            
            # Get the first face embedding and facial area
            face_data = embedding_objs[0]
            embedding = face_data["embedding"]
            facial_area = face_data.get("facial_area", {})
            
            # Create bbox from facial area
            bbox = {
                "x": int(facial_area.get("x", 0)),
                "y": int(facial_area.get("y", 0)),
                "w": int(facial_area.get("w", 0)),
                "h": int(facial_area.get("h", 0))
            }
            
            # Set high confidence since face was detected
            confidence = face_data.get("confidence", 0.95)
            
            logger.info(f"Successfully extracted {len(embedding)}-dimensional embedding with confidence {confidence:.2f}")
            
            return EmbeddingResponse(
                success=True,
                embedding=embedding,
                confidence=confidence,
                bbox=bbox
            )
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
    except Exception as e:
        logger.error(f"Error in extract_embedding: {str(e)}")
        return EmbeddingResponse(
            success=False,
            error=f"Failed to extract embedding: {str(e)}"
        )

@app.post("/detect", response_model=DetectionResponse)
async def detect_faces(request: ImageRequest):
    """Detect all faces in image"""
    try:
        logger.info("Detecting faces...")
        
        # Decode image
        image_array = decode_base64_image(request.image)
        
        # Save temp image for DeepFace
        temp_path = "temp_face_detect.jpg"
        cv2.imwrite(temp_path, image_array)
        
        try:
            # Detect faces using DeepFace
            face_objs = DeepFace.extract_faces(
                img_path=temp_path,
                detector_backend="opencv",  # Fast detection
                enforce_detection=False
            )
            
            faces = []
            for i, face_obj in enumerate(face_objs):
                facial_area = face_obj["facial_area"]
                faces.append({
                    "face_id": i,
                    "bbox": {
                        "x": int(facial_area["x"]),
                        "y": int(facial_area["y"]),
                        "w": int(facial_area["w"]),
                        "h": int(facial_area["h"])
                    },
                    "confidence": float(face_obj.get("confidence", 1.0))
                })
            
            logger.info(f"Detected {len(faces)} face(s)")
            
            return DetectionResponse(
                success=True,
                faces_detected=len(faces),
                faces=faces
            )
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
    except Exception as e:
        logger.error(f"Error in detect_faces: {str(e)}")
        return DetectionResponse(
            success=False,
            error=f"Failed to detect faces: {str(e)}"
        )

@app.post("/compare", response_model=CompareResponse)
async def compare_embeddings(request: CompareRequest):
    """Compare two face embeddings"""
    try:
        logger.info("Comparing embeddings...")
        
        # Convert to numpy arrays
        embedding1 = np.array(request.embedding1)
        embedding2 = np.array(request.embedding2)
        
        # Calculate cosine similarity
        similarity = cosine_similarity(embedding1, embedding2)
        
        # Use face_recognition's compare function (threshold is typically 0.6)
        # But we also return the similarity score
        distance = np.linalg.norm(embedding1 - embedding2)
        matched = distance < 0.6  # Default threshold for face_recognition
        
        logger.info(f"Similarity: {similarity:.4f}, Distance: {distance:.4f}, Matched: {matched}")
        
        return CompareResponse(
            success=True,
            similarity=similarity,
            matched=matched
        )
        
    except Exception as e:
        logger.error(f"Error in compare_embeddings: {str(e)}")
        return CompareResponse(
            success=False,
            error=f"Failed to compare embeddings: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 5001))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting Face Recognition Service on {host}:{port}")
    logger.info("Using DeepFace library with VGG-Face model")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
