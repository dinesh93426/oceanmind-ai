"""
Dataset Preparation Script for Fish Identification Platform
Step 9 Implementation

This script:
1. Scans the raw dataset directory.
2. Identifies all classes/species and counts images per species.
3. Detects corrupted/unsupported image files.
4. Performs a 70% train / 15% validation / 15% test split per species.
5. Copies images into dataset/train, dataset/validation, and dataset/test folders.
6. Preserves all original images without deleting or modifying them.
7. Saves class index mapping to models/classes.json.
"""

import os
import sys
import json
import shutil
import random
from pathlib import Path
from PIL import Image, UnidentifiedImageError

# Set fixed seed for reproducible random splits
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

SUPPORTED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp'}
SPLIT_RATIOS = {'train': 0.70, 'validation': 0.15, 'test': 0.15}

def get_project_paths():
    """Return absolute paths for ml-py project directories with env override support for cloud/live hosting."""
    script_dir = Path(__file__).resolve().parent
    base_dir = Path(os.getenv("PROJECT_ROOT", str(script_dir.parent)))
    dataset_dir = Path(os.getenv("DATASET_DIR", str(base_dir / "dataset")))
    models_dir = Path(os.getenv("MODELS_DIR", str(base_dir / "models")))
    return base_dir, dataset_dir, models_dir

def is_valid_image(filepath: Path) -> bool:
    """Verify if file is a non-corrupted image of supported format."""
    if filepath.suffix.lower() not in SUPPORTED_EXTENSIONS:
        return False
    try:
        with Image.open(filepath) as img:
            img.verify()
        return True
    except (UnidentifiedImageError, OSError, Exception):
        return False

def discover_species(dataset_dir: Path):
    """
    Discover species folders in dataset_dir.
    Ignores split folders ('train', 'validation', 'test') and hidden folders.
    Returns dict mapping species_name -> list of valid image Path objects,
    and a list of corrupted image Path objects.
    """
    reserved_names = {'train', 'validation', 'test', 'raw', '.git', 'venv'}
    species_data = {}
    corrupted_files = []

    # Check subdirectories first
    subdirs = [
        d for d in dataset_dir.iterdir()
        if d.is_dir() and d.name.lower() not in reserved_names and not d.name.startswith('.')
    ]

    for species_dir in sorted(subdirs, key=lambda x: x.name):
        species_name = species_dir.name
        species_data[species_name] = []
        
        for file_path in species_dir.glob('*'):
            if file_path.is_file() and not file_path.name.startswith('.'):
                if file_path.suffix.lower() in SUPPORTED_EXTENSIONS:
                    if is_valid_image(file_path):
                        species_data[species_name].append(file_path)
                    else:
                        corrupted_files.append(file_path)
                else:
                    corrupted_files.append(file_path)

    return species_data, corrupted_files

def prepare_dataset():
    """Execute dataset scanning, splitting, and mapping generation."""
    base_dir, dataset_dir, models_dir = get_project_paths()
    models_dir.mkdir(parents=True, exist_ok=True)

    print("==================================================")
    print("      FISH DATASET PREPARATION (STEP 9)")
    print("==================================================")
    print(f"Dataset root: {dataset_dir}")

    if not dataset_dir.exists():
        print(f"Error: Dataset directory does not exist at {dataset_dir}")
        sys.exit(1)

    species_data, corrupted_files = discover_species(dataset_dir)

    if not species_data:
        print("Warning: No species subdirectories found in dataset/!")
        print("Expected structure:")
        print("  dataset/Tuna/image1.png")
        print("  dataset/Salmon/image1.png")
        sys.exit(1)

    total_images = sum(len(imgs) for imgs in species_data.values())
    total_species = len(species_data)

    print(f"\nDiscovered Species: {total_species}")
    print(f"Total Valid Images: {total_images}")
    print(f"Corrupted / Unsupported Files: {len(corrupted_files)}")

    print("\n--------------------------------------------------")
    print("Species Breakdown:")
    for species, imgs in species_data.items():
        print(f"  - {species:20s}: {len(imgs):5d} images")
    print("--------------------------------------------------")

    if total_images == 0:
        print("Error: No valid images found across any species folder.")
        sys.exit(1)

    # Prepare train/validation/test directory structure
    splits = ['train', 'validation', 'test']
    for split in splits:
        split_dir = dataset_dir / split
        if split_dir.exists():
            print(f"Cleaning existing split folder: {split_dir}")
            shutil.rmtree(split_dir)
        split_dir.mkdir(parents=True, exist_ok=True)

    # Perform Stratified 70/15/15 Split & Copying
    split_summary = {split: {} for split in splits}

    for species, images in species_data.items():
        # Shuffle images deterministically
        shuffled = images.copy()
        random.shuffle(shuffled)
        
        n_total = len(shuffled)
        
        if n_total >= 3:
            n_val = max(1, int(n_total * SPLIT_RATIOS['validation']))
            n_test = max(1, int(n_total * SPLIT_RATIOS['test']))
            n_train = max(1, n_total - n_val - n_test)
            
            train_imgs = shuffled[:n_train]
            val_imgs = shuffled[n_train:n_train + n_val]
            test_imgs = shuffled[n_train + n_val:]
            
            # Fallbacks if rounding leaves any split empty
            if not val_imgs:
                val_imgs = [shuffled[0]]
            if not test_imgs:
                test_imgs = [shuffled[-1]]
        elif n_total == 2:
            train_imgs = [shuffled[0]]
            val_imgs = [shuffled[1]]
            test_imgs = [shuffled[1]]
        else: # n_total == 1
            train_imgs = [shuffled[0]]
            val_imgs = [shuffled[0]]
            test_imgs = [shuffled[0]]

        split_map = {
            'train': train_imgs,
            'validation': val_imgs,
            'test': test_imgs
        }

        for split, split_imgs in split_map.items():
            target_species_dir = dataset_dir / split / species
            target_species_dir.mkdir(parents=True, exist_ok=True)
            
            for img_path in split_imgs:
                dest_path = target_species_dir / img_path.name
                shutil.copy2(img_path, dest_path)
            
            split_summary[split][species] = len(split_imgs)

    print("\n--------------------------------------------------")
    print("Split Summary (70% Train / 15% Validation / 15% Test):")
    print(f"{'Species':<20s} | {'Train':<7s} | {'Val':<7s} | {'Test':<7s} | {'Total':<7s}")
    print("-" * 55)
    for species in species_data.keys():
        t_cnt = split_summary['train'][species]
        v_cnt = split_summary['validation'][species]
        e_cnt = split_summary['test'][species]
        tot = t_cnt + v_cnt + e_cnt
        print(f"{species:<20s} | {t_cnt:<7d} | {v_cnt:<7d} | {e_cnt:<7d} | {tot:<7d}")
    print("--------------------------------------------------")

    # Generate classes.json mapping (0 -> species_name)
    sorted_species = sorted(species_data.keys())
    class_mapping = {str(idx): species for idx, species in enumerate(sorted_species)}
    
    classes_json_path = models_dir / "classes.json"
    with open(classes_json_path, 'w', encoding='utf-8') as f:
        json.dump(class_mapping, f, indent=2)

    print(f"\n[SUCCESS] Class mapping saved to: {classes_json_path}")
    print("Class Index Mapping:")
    for idx, species in class_mapping.items():
        print(f"  \"{idx}\": \"{species}\"")

    print("\nDataset preparation completed successfully!")
    print("Original dataset files remain preserved.")

if __name__ == "__main__":
    prepare_dataset()
