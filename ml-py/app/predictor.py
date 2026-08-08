"""
Fish Predictor Engine
Step 13 & Step 14 Implementation

Loads trained EfficientNet-B0 PyTorch model (models/fish_model.pth) and
class mapping (models/classes.json) to perform fish species prediction
with confidence threshold enforcement.
"""

import os
import sys
import json
import io
from pathlib import Path
from typing import Union, Dict, Any, List

import torch
import torch.nn as nn
from PIL import Image, UnidentifiedImageError
from torchvision import transforms  # type: ignore
from torchvision.models import efficientnet_b0  # type: ignore

def get_project_paths():
    script_dir = Path(__file__).resolve().parent
    base_dir = Path(os.getenv("PROJECT_ROOT", str(script_dir.parent)))
    models_dir = Path(os.getenv("MODELS_DIR", str(base_dir / "models")))
    return base_dir, models_dir

class FishPredictor:
    def __init__(self):
        self.base_dir, self.models_dir = get_project_paths()
        self.model_path = self.models_dir / "fish_model.pth"
        self.classes_path = self.models_dir / "classes.json"
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        self.model = None
        self.classes_map: Dict[str, str] = {}
        self.num_classes = 0

        # Image Transform Pipeline (Standard ImageNet normalization)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

        self.load_model()

    def load_model(self):
        """Load class mapping and trained model state dict."""
        if not self.classes_path.exists():
            raise FileNotFoundError(f"Classes mapping file missing at {self.classes_path}")
        
        with open(self.classes_path, 'r', encoding='utf-8') as f:
            self.classes_map = json.load(f)
        self.num_classes = len(self.classes_map)

        if not self.model_path.exists():
            raise FileNotFoundError(f"Model file missing at {self.model_path}")

        # Initialize EfficientNet-B0 architecture
        self.model = efficientnet_b0()
        num_features = self.model.classifier[1].in_features
        self.model.classifier[1] = nn.Linear(num_features, self.num_classes)

        state_dict = torch.load(self.model_path, map_location=self.device)
        self.model.load_state_dict(state_dict)
        self.model = self.model.to(self.device)
        self.model.eval()

    def _prepare_image(self, image_input: Union[str, Path, bytes, Image.Image]) -> Image.Image:
        """Convert input path, bytes, or PIL image safely to RGB PIL Image."""
        if isinstance(image_input, (str, Path)):
            img_path = Path(image_input)
            if not img_path.exists():
                raise FileNotFoundError(f"Image file not found at {img_path}")
            img = Image.open(img_path)
        elif isinstance(image_input, bytes):
            img = Image.open(io.BytesIO(image_input))
        elif isinstance(image_input, Image.Image):
            img = image_input
        else:
            raise ValueError("Unsupported image input format. Expected file path, bytes, or PIL Image.")

        # Always convert to RGB (handles RGBA, Grayscale, etc.)
        img = img.convert("RGB")

        # Pad image to square to preserve natural aspect ratio & morphology before resizing
        w, h = img.size
        if w != h:
            max_side = max(w, h)
            padded_img = Image.new("RGB", (max_side, max_side), (255, 255, 255))
            offset_x = (max_side - w) // 2
            offset_y = (max_side - h) // 2
            padded_img.paste(img, (offset_x, offset_y))
            return padded_img

        return img

    def predict(self, image_input: Union[str, Path, bytes, Image.Image], top_k: int = 5) -> Dict[str, Any]:
        """
        Run inference on image input and return predictions with confidence evaluation.
        """
        if self.model is None:
            self.load_model()

        # Step 16: Input Validation & Image Decoding
        try:
            image = self._prepare_image(image_input)
        except Exception as e:
            return {
                "success": False,
                "error": f"Invalid or unreadable image file: {str(e)}"
            }

        # Transform & Tensor conversion
        tensor_img = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor_img)
            probabilities = torch.softmax(outputs, dim=1)[0]

        k = min(top_k, self.num_classes)
        top_probs, top_indices = torch.topk(probabilities, k=k)

        top_probs = top_probs.cpu().numpy().tolist()
        top_indices = top_indices.cpu().numpy().tolist()

        # Top prediction
        top_species_idx = str(top_indices[0])
        top_species_name = self.classes_map.get(top_species_idx, "Unknown Species")
        top_confidence = float(top_probs[0])

        # Alternatives (Top 2..K)
        alternatives = []
        for idx, prob in zip(top_indices[1:], top_probs[1:]):
            sp_name = self.classes_map.get(str(idx), "Unknown Species")
            alternatives.append({
                "name": sp_name,
                "confidence": round(float(prob), 4)
            })

        # Confidence Threshold (Step 14)
        threshold = float(os.getenv("FISH_CONFIDENCE_THRESHOLD", "0.60"))
        is_identified = top_confidence >= threshold

        if is_identified:
            return {
                "success": True,
                "identified": True,
                "prediction": {
                    "name": top_species_name,
                    "confidence": round(top_confidence, 4)
                },
                "alternatives": alternatives
            }
        else:
            return {
                "success": True,
                "identified": False,
                "message": f"Unable to confidently identify this fish (confidence {top_confidence*100:.2f}% < {threshold*100:.0f}% threshold). Please upload a clearer image.",
                "prediction": None,
                "top_candidate": {
                    "name": top_species_name,
                    "confidence": round(top_confidence, 4)
                },
                "alternatives": alternatives
            }

# Global singleton instance for high performance API loading
_predictor_instance = None

def get_predictor() -> FishPredictor:
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = FishPredictor()
    return _predictor_instance
