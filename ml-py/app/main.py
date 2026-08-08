"""
FastAPI Machine Learning Service for Fish Identification Platform
Steps 15, 16, 25 & 26 Implementation

Exposes RESTful endpoints:
- GET / : API Welcome & status info
- GET /health : Service health check & model status
- POST /predict : Image file upload for fish species identification
"""

import os
import sys
import time
import logging
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.predictor import get_predictor

# Logging Configuration (Step 26)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("fish_ml_service")

# Initialize FastAPI App
app = FastAPI(
    title="Fish Identification ML Service",
    description="PyTorch EfficientNet-B0 Fish Species Identification API",
    version="1.0.0"
)

# CORS Configuration (Step 25 Security)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to specific domains in production env if desired
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_MIME_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

@app.on_event("startup")
async def startup_event():
    """Load PyTorch model into memory on startup."""
    logger.info("Initializing Fish ML Service...")
    try:
        predictor = get_predictor()
        logger.info(f"Model loaded successfully with {predictor.num_classes} species classes.")
    except Exception as e:
        logger.error(f"Failed to load PyTorch model during startup: {str(e)}")

@app.get("/", tags=["Health"])
def root_endpoint():
    """Welcome endpoint."""
    return {
        "service": "Fish Identification ML Service",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint required by Step 15."""
    try:
        predictor = get_predictor()
        is_loaded = predictor.model is not None and predictor.num_classes > 0
        return {
            "status": "healthy" if is_loaded else "unhealthy",
            "model_loaded": is_loaded,
            "num_classes": predictor.num_classes
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "model_loaded": False, "error": str(e)}
        )

@app.post("/predict", tags=["Prediction"])
async def predict_fish_species(image: UploadFile = File(...)):
    """
    Predict fish species from uploaded image file.
    Accepts multipart/form-data with 'image'.
    """
    start_time = time.time()
    logger.info(f"Prediction started for uploaded file: {image.filename}")

    # Step 16: Input Validation - Check file existence
    if not image or not image.filename:
        logger.warning("Rejected prediction request: No file uploaded.")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": "No image file uploaded"}
        )

    # Step 16: Extension Validation
    file_ext = Path(image.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        logger.warning(f"Rejected prediction request: Unsupported extension '{file_ext}'")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": f"Unsupported image format '{file_ext}'. Allowed formats: PNG, JPG, JPEG, WEBP"}
        )

    # Read image contents
    image_bytes = await image.read()

    # Step 16: File Size Limit Check
    if len(image_bytes) > MAX_FILE_SIZE:
        logger.warning(f"Rejected prediction request: File size {len(image_bytes)} bytes exceeds 10MB limit.")
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"success": False, "error": "File size exceeds 10MB limit"}
        )

    if len(image_bytes) == 0:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": "Uploaded file is empty"}
        )

    # Step 13 & 14: Run PyTorch Model Inference
    try:
        predictor = get_predictor()
        result = predictor.predict(image_bytes)
    except Exception as e:
        logger.error(f"Inference error during prediction: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": "Model inference failed"}
        )

    inference_time = round(time.time() - start_time, 3)

    if not result.get("success", False):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=result
        )

    # Format JSON Response strictly according to Step 15 requirements
    if result.get("identified", False):
        pred_info = result["prediction"]
        # Convert confidence float (0..1) to percentage number (0..100)
        formatted_pred = {
            "name": pred_info["name"].replace("_", " "),
            "confidence": round(pred_info["confidence"] * 100.0, 2)
        }
        
        formatted_alts = []
        for alt in result.get("alternatives", []):
            formatted_alts.append({
                "name": alt["name"].replace("_", " "),
                "confidence": round(alt["confidence"] * 100.0, 2)
            })

        logger.info(f"Model inference completed in {inference_time}s | Species: {formatted_pred['name']} ({formatted_pred['confidence']}%)")

        return {
            "success": True,
            "identified": True,
            "prediction": formatted_pred,
            "alternatives": formatted_alts,
            "inference_time_seconds": inference_time
        }
    else:
        top_cand = result.get("top_candidate", {})
        top_name = top_cand.get("name", "").replace("_", " ") if top_cand else ""
        top_conf = round(top_cand.get("confidence", 0.0) * 100.0, 2) if top_cand else 0.0

        formatted_alts = []
        for alt in result.get("alternatives", []):
            formatted_alts.append({
                "name": alt["name"].replace("_", " "),
                "confidence": round(alt["confidence"] * 100.0, 2)
            })

        logger.info(f"Model inference completed in {inference_time}s | Unconfident identification (Top: {top_name} {top_conf}%)")

        return {
            "success": True,
            "identified": False,
            "prediction": None,
            "message": "Unable to confidently identify this fish. Please upload a clearer image.",
            "top_candidate": {
                "name": top_name,
                "confidence": top_conf
            },
            "alternatives": formatted_alts,
            "inference_time_seconds": inference_time
        }
