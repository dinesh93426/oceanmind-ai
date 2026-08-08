"""
Standalone Prediction CLI Tester
Step 13 Implementation

Usage:
python test_prediction.py <path_to_image>
"""

import sys
import json
from pathlib import Path
from app.predictor import get_predictor

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_prediction.py <path/to/fish_image.png>")
        # Default test fallback to a sample test image if path not supplied
        test_dir = Path(__file__).resolve().parent / "dataset" / "test"
        sample_images = list(test_dir.glob("**/*.jpg")) + list(test_dir.glob("**/*.png"))
        if sample_images:
            image_path = str(sample_images[0])
            print(f"No image path specified. Auto-testing sample image: {image_path}\n")
        else:
            sys.exit(1)
    else:
        image_path = sys.argv[1]

    print(f"Running standalone fish species prediction on: {image_path}")
    print("-" * 60)

    predictor = get_predictor()
    result = predictor.predict(image_path)

    print(json.dumps(result, indent=2))
    print("-" * 60)

if __name__ == "__main__":
    main()
