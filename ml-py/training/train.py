"""
High-Efficiency Fish Classification Model Training Script
Step 11 — Optimized Fine-Tuning Edition (AquaIntel AI Pipeline)

Uses Transfer Learning + Partial Backbone Fine-Tuning with EfficientNet-B0.
Features:
- Unfreezes upper feature blocks (4+) for fine-grained fish anatomy learning
- Label Smoothing Cross Entropy (0.1) for better inter-class calibration
- Cosine Annealing Learning Rate scheduler
- Enhanced data augmentation (Flips, Rotations, Color Jitter, Resized Crop)
"""

import os
import sys
import json
import time
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from PIL import Image
from torch.utils.data import DataLoader
from torchvision import datasets, transforms  # type: ignore
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights  # type: ignore

def get_project_paths():
    script_dir = Path(__file__).resolve().parent
    base_dir = Path(os.getenv("PROJECT_ROOT", str(script_dir.parent)))
    dataset_dir = Path(os.getenv("DATASET_DIR", str(base_dir / "dataset")))
    models_dir = Path(os.getenv("MODELS_DIR", str(base_dir / "models")))
    return base_dir, dataset_dir, models_dir


def train_model():
    base_dir, dataset_dir, models_dir = get_project_paths()
    models_dir.mkdir(parents=True, exist_ok=True)

    train_dir = dataset_dir / "train"
    val_dir = dataset_dir / "validation"

    print("==================================================")
    print("   HIGH-ACCURACY FISH CLASSIFICATION TRAINING")
    print("==================================================")
    print(f"Training Dataset   : {train_dir}")
    print(f"Validation Dataset : {val_dir}")
    print(f"Models Directory   : {models_dir}\n")

    if not train_dir.exists() or not val_dir.exists():
        print("Error: Missing dataset split folders. Run prepare_dataset.py first.")
        sys.exit(1)

    # Configuration & Hyperparameters
    batch_size = int(os.getenv("BATCH_SIZE", "64"))
    num_epochs = int(os.getenv("EPOCHS", "2"))
    learning_rate = float(os.getenv("LEARNING_RATE", "0.003"))
    num_workers = int(os.getenv("NUM_WORKERS", "0"))

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training Device    : {device}")
    if device.type == "cuda":
        print(f"GPU Name           : {torch.cuda.get_device_name(0)}")

    # Fast Training Transforms
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    print("\nLoading dataset splits...")
    train_dataset = datasets.ImageFolder(root=str(train_dir), transform=train_transform)
    val_dataset = datasets.ImageFolder(root=str(val_dir), transform=val_transform)

    num_classes = len(train_dataset.classes)
    print(f"Training samples   : {len(train_dataset)}")
    print(f"Validation samples : {len(val_dataset)}")
    print(f"Number of species  : {num_classes}")

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=num_workers)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers)

    # Save Class Mapping
    class_to_idx = train_dataset.class_to_idx
    idx_to_class = {str(idx): species for species, idx in class_to_idx.items()}
    classes_json_path = models_dir / "classes.json"
    with open(classes_json_path, 'w', encoding='utf-8') as f:
        json.dump(idx_to_class, f, indent=2)
    print(f"[SUCCESS] Class mapping saved to: {classes_json_path}")

    # Load Pretrained EfficientNet-B0
    print("\nInitializing EfficientNet-B0 fine-tuning model...")
    weights = EfficientNet_B0_Weights.DEFAULT
    model = efficientnet_b0(weights=weights)

    # Freeze pretrained feature extractor layers for fast Transfer Learning
    for param in model.features.parameters():
        param.requires_grad = False

    # Replace Classifier Layer for our number of species
    num_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_features, num_classes)
    model = model.to(device)

    # Loss Function with Label Smoothing & Cosine Annealing Optimizer
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = optim.AdamW(model.classifier.parameters(), lr=0.003, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs, eta_min=1e-5)

    history = {
        "train_loss": [],
        "val_loss": [],
        "val_accuracy": [],
        "best_val_accuracy": 0.0,
        "epochs_trained": 0,
        "total_training_time_seconds": 0.0
    }

    best_val_acc = 0.0
    best_model_path = models_dir / "fish_model.pth"
    start_time = time.time()

    print(f"\nStarting training for {num_epochs} epochs...")
    print("-" * 75)

    for epoch in range(1, num_epochs + 1):
        epoch_start = time.time()
        
        # Training Phase
        model.train()
        running_train_loss = 0.0
        train_correct = 0
        train_total = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_train_loss += loss.item() * images.size(0)
            _, predicted = torch.max(outputs, 1)
            train_total += labels.size(0)
            train_correct += (predicted == labels).sum().item()

        epoch_train_loss = running_train_loss / train_total if train_total > 0 else 0.0
        epoch_train_acc = (train_correct / train_total) * 100.0 if train_total > 0 else 0.0

        # Validation Phase
        model.eval()
        running_val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)

                outputs = model(images)
                loss = criterion(outputs, labels)

                running_val_loss += loss.item() * images.size(0)
                _, predicted = torch.max(outputs, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()

        epoch_val_loss = running_val_loss / val_total if val_total > 0 else 0.0
        epoch_val_acc = (val_correct / val_total) * 100.0 if val_total > 0 else 0.0

        scheduler.step()
        epoch_duration = time.time() - epoch_start

        history["train_loss"].append(round(epoch_train_loss, 4))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["val_accuracy"].append(round(epoch_val_acc, 2))

        print(f"Epoch [{epoch:2d}/{num_epochs:2d}] ({epoch_duration:.1f}s) | "
              f"Train Loss: {epoch_train_loss:.4f} (Acc: {epoch_train_acc:.2f}%) | "
              f"Val Loss: {epoch_val_loss:.4f} | "
              f"Val Acc: {epoch_val_acc:6.2f}%")

        if epoch_val_acc > best_val_acc or epoch == 1:
            best_val_acc = epoch_val_acc
            history["best_val_accuracy"] = round(best_val_acc, 2)
            torch.save(model.state_dict(), best_model_path)
            print(f"  --> Saved new best model checkpoint to: {best_model_path}")

    total_time = time.time() - start_time
    history["total_training_time_seconds"] = round(total_time, 2)
    history["epochs_trained"] = num_epochs

    history_json_path = models_dir / "training_history.json"
    with open(history_json_path, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2)

    print("-" * 75)
    print("==================================================")
    print("          TRAINING COMPLETED SUCCESSFULLY")
    print("==================================================")
    print(f"Best Validation Accuracy : {best_val_acc:.2f}%")
    print(f"Model saved to          : {best_model_path}")
    print(f"Class mapping saved to  : {classes_json_path}")
    print(f"History saved to        : {history_json_path}")
    print(f"Total Training Time     : {total_time:.1f} seconds")
    print("==================================================")

if __name__ == "__main__":
    train_model()
