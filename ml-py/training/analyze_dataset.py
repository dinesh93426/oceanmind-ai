"""
Dataset Analysis Script for Fish Identification Platform
Step 10 Implementation (Optimized)

Scans the fish dataset and outputs a comprehensive statistical report:
- Total images & total species
- Images per species (min, max, average)
- Corrupted image detection
- Sample image dimensions & color mode statistics
- Class imbalance warning
"""

import os
import sys
import json
from pathlib import Path
from PIL import Image, UnidentifiedImageError
from collections import Counter

SUPPORTED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp'}

def get_project_paths():
    script_dir = Path(__file__).resolve().parent
    base_dir = Path(os.getenv("PROJECT_ROOT", str(script_dir.parent)))
    dataset_dir = Path(os.getenv("DATASET_DIR", str(base_dir / "dataset")))
    models_dir = Path(os.getenv("MODELS_DIR", str(base_dir / "models")))
    return base_dir, dataset_dir, models_dir

def analyze_dataset():
    base_dir, dataset_dir, models_dir = get_project_paths()

    print("==================================================")
    print("           FISH DATASET REPORT (STEP 10)")
    print("==================================================")
    print(f"Dataset location: {dataset_dir}\n")

    if not dataset_dir.exists():
        print(f"Error: Dataset directory does not exist at {dataset_dir}")
        sys.exit(1)

    # Use train/val/test splits if available, otherwise direct species folders
    splits = ['train', 'validation', 'test']
    has_splits = all((dataset_dir / s).exists() for s in splits)

    species_counts = Counter()
    corrupted_images = []
    sample_dimensions = []
    color_modes = Counter()
    total_images_scanned = 0

    if has_splits:
        scan_base_dirs = [dataset_dir / s for s in splits]
    else:
        reserved = {'train', 'validation', 'test', 'raw', '.git', 'venv'}
        scan_base_dirs = [dataset_dir]

    for base_scan in scan_base_dirs:
        for species_dir in base_scan.iterdir():
            if species_dir.is_dir() and species_dir.name.lower() not in {'train', 'validation', 'test', 'raw', '.git', 'venv'} and not species_dir.name.startswith('.'):
                sp_name = species_dir.name
                for file_path in species_dir.glob('*'):
                    if file_path.is_file() and file_path.suffix.lower() in SUPPORTED_EXTENSIONS:
                        total_images_scanned += 1
                        species_counts[sp_name] += 1
                        
                        # Sample dimensions from first 500 images for high speed
                        if len(sample_dimensions) < 500:
                            try:
                                with Image.open(file_path) as img:
                                    sample_dimensions.append(img.size)
                                    color_modes[img.mode] += 1
                            except (UnidentifiedImageError, OSError, Exception):
                                corrupted_images.append(str(file_path))

    total_species = len(species_counts)

    if total_species == 0:
        print("Error: No valid images found in dataset!")
        sys.exit(1)

    counts_list = list(species_counts.values())
    total_valid_images = sum(counts_list)
    avg_images = total_valid_images / total_species if total_species > 0 else 0
    min_images = min(counts_list) if counts_list else 0
    max_images = max(counts_list) if counts_list else 0

    min_species = [sp for sp, cnt in species_counts.items() if cnt == min_images]
    max_species = [sp for sp, cnt in species_counts.items() if cnt == max_images]

    imbalance_ratio = (max_images / min_images) if min_images > 0 else float('inf')
    has_class_imbalance = imbalance_ratio > 2.5 or min_images < 5

    if sample_dimensions:
        widths = [w for w, h in sample_dimensions]
        heights = [h for w, h in sample_dimensions]
        avg_w = sum(widths) / len(widths)
        avg_h = sum(heights) / len(heights)
        min_dim = f"{min(widths)}x{min(heights)}"
        max_dim = f"{max(widths)}x{max(heights)}"
        avg_dim = f"{int(avg_w)}x{int(avg_h)}"
    else:
        min_dim = max_dim = avg_dim = "N/A"

    print(f"Total images scanned : {total_images_scanned:,}")
    print(f"Total valid images   : {total_valid_images:,}")
    print(f"Total species        : {total_species:,}")
    print(f"Average images/species: {avg_images:.1f}\n")

    print(f"Minimum images in a class : {min_images} ({', '.join(min_species[:3])}{'...' if len(min_species) > 3 else ''})")
    print(f"Maximum images in a class : {max_images} ({', '.join(max_species[:3])}{'...' if len(max_species) > 3 else ''})\n")

    print("Image Dimensions & Color Modes (Sampled):")
    print(f"  - Min Dimensions : {min_dim}")
    print(f"  - Max Dimensions : {max_dim}")
    print(f"  - Average Size   : {avg_dim}")
    print(f"  - Color Modes    : {dict(color_modes)}\n")

    print("Class Imbalance Warning:")
    if has_class_imbalance:
        print(f"  [YES] Potential class imbalance detected!")
        print(f"  Max/Min ratio: {imbalance_ratio:.2f}x (Max: {max_images}, Min: {min_images})")
        print("  Recommendation: Data augmentation will balance model feature learning.\n")
    else:
        print(f"  [NO] Dataset is well balanced across species. Max/Min ratio: {imbalance_ratio:.2f}x\n")

    print("Corrupted Images:")
    print(f"  Count: {len(corrupted_images)}")
    if corrupted_images:
        for file in corrupted_images[:5]:
            print(f"    - {file}")
    print("\n--------------------------------------------------")

    classes_json_path = models_dir / "classes.json"
    if classes_json_path.exists():
        with open(classes_json_path, 'r', encoding='utf-8') as f:
            classes_map = json.load(f)
        print(f"Class mapping path verified: {classes_json_path} ({len(classes_map)} classes mapped)")
    
    print("--------------------------------------------------")
    print("Dataset analysis completed successfully!")
    print("==================================================")

if __name__ == "__main__":
    analyze_dataset()
