"""
Model Evaluation Script for Fish Identification Platform
Step 12 Implementation

Evaluates the trained EfficientNet-B0 model strictly on the TEST dataset (dataset/test).
Calculates:
- Top-1 Accuracy
- Top-3 Accuracy
- Top-5 Accuracy
- Precision (Macro)
- Recall (Macro)
- F1 Score (Macro)
- Identifies lowest performing species classes
"""

import os
import sys
import json
from pathlib import Path
from collections import Counter

import torch
import torch.nn as nn
from PIL import Image
from torch.utils.data import DataLoader
from torchvision import datasets, transforms  # type: ignore
from torchvision.models import efficientnet_b0  # type: ignore

def get_project_paths():
    script_dir = Path(__file__).resolve().parent
    base_dir = Path(os.getenv("PROJECT_ROOT", str(script_dir.parent)))
    dataset_dir = Path(os.getenv("DATASET_DIR", str(base_dir / "dataset")))
    models_dir = Path(os.getenv("MODELS_DIR", str(base_dir / "models")))
    return base_dir, dataset_dir, models_dir

class SquarePad:
    def __call__(self, img):
        w, h = img.size
        if w != h:
            max_side = max(w, h)
            padded = Image.new("RGB", (max_side, max_side), (255, 255, 255))
            offset_x = (max_side - w) // 2
            offset_y = (max_side - h) // 2
            padded.paste(img, (offset_x, offset_y))
            return padded
        return img

def evaluate_model():
    base_dir, dataset_dir, models_dir = get_project_paths()
    test_dir = dataset_dir / "test"
    model_path = models_dir / "fish_model.pth"
    classes_path = models_dir / "classes.json"

    print("==================================================")
    print("           MODEL EVALUATION (STEP 12)")
    print("==================================================")
    print(f"Test Dataset Location : {test_dir}")
    print(f"Model Checkpoint      : {model_path}\n")

    if not test_dir.exists():
        print(f"Error: Test dataset directory not found at {test_dir}")
        sys.exit(1)

    if not model_path.exists() or not classes_path.exists():
        print(f"Error: Model or classes.json missing! Train model first.")
        sys.exit(1)

    # Load Class Mapping
    with open(classes_path, 'r', encoding='utf-8') as f:
        classes_map = json.load(f)
    num_classes = len(classes_map)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Evaluation Device : {device}")
    print(f"Total Species     : {num_classes}")

    # Test Data Transform
    test_transform = transforms.Compose([
        SquarePad(),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    test_dataset = datasets.ImageFolder(root=str(test_dir), transform=test_transform)
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

    # Load Model Architecture & Weights
    model = efficientnet_b0()
    num_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_features, num_classes)
    
    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)
    model = model.to(device)
    model.eval()

    total_samples = len(test_dataset)
    top1_correct = 0
    top3_correct = 0
    top5_correct = 0

    class_correct = Counter()
    class_total = Counter()
    class_pred_total = Counter()

    print("\nRunning model inference on test dataset...")

    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            
            # Softmax probabilities
            probabilities = torch.softmax(outputs, dim=1)

            # Top-1, Top-3, Top-5 Predictions
            _, top5_preds = torch.topk(probabilities, k=min(5, num_classes), dim=1)

            for i in range(labels.size(0)):
                target = labels[i].item()
                top_preds = top5_preds[i].tolist()
                
                # Top-1
                if top_preds[0] == target:
                    top1_correct += 1
                # Top-3
                if target in top_preds[:3]:
                    top3_correct += 1
                # Top-5
                if target in top_preds[:5]:
                    top5_correct += 1

                class_total[target] += 1
                class_correct[target] += (top_preds[0] == target)
                class_pred_total[top_preds[0]] += 1

    # Calculate Top-K Accuracies
    top1_acc = (top1_correct / total_samples) * 100.0 if total_samples > 0 else 0.0
    top3_acc = (top3_correct / total_samples) * 100.0 if total_samples > 0 else 0.0
    top5_acc = (top5_correct / total_samples) * 100.0 if total_samples > 0 else 0.0

    # Calculate Per-Class Precision, Recall, F1
    precisions = []
    recalls = []
    f1_scores = []
    class_perf = []

    for cls_idx in range(num_classes):
        tp = class_correct[cls_idx]
        fp = class_pred_total[cls_idx] - tp
        fn = class_total[cls_idx] - tp

        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0

        precisions.append(prec)
        recalls.append(rec)
        f1_scores.append(f1)
        
        species_name = classes_map.get(str(cls_idx), f"Class {cls_idx}")
        class_perf.append((species_name, prec * 100.0, rec * 100.0, f1 * 100.0, class_total[cls_idx]))

    macro_precision = (sum(precisions) / len(precisions)) * 100.0
    macro_recall = (sum(recalls) / len(recalls)) * 100.0
    macro_f1 = (sum(f1_scores) / len(f1_scores)) * 100.0

    print("\n==================================================")
    print("                MODEL EVALUATION RESULTS")
    print("==================================================")
    print(f"Total Test Samples : {total_samples}")
    print(f"Top-1 Accuracy     : {top1_acc:6.2f}%")
    print(f"Top-3 Accuracy     : {top3_acc:6.2f}%")
    print(f"Top-5 Accuracy     : {top5_acc:6.2f}%")
    print("--------------------------------------------------")
    print(f"Precision (Macro)  : {macro_precision:6.2f}%")
    print(f"Recall (Macro)     : {macro_recall:6.2f}%")
    print(f"F1 Score (Macro)   : {macro_f1:6.2f}%")
    print("--------------------------------------------------")

    # Lowest performing species
    sorted_perf = sorted(class_perf, key=lambda x: x[3])
    print("\nSpecies Performance Analysis (Sample Low-Scoring):")
    for sp_name, prec, rec, f1, cnt in sorted_perf[:5]:
        print(f"  - {sp_name:<30s}: F1={f1:5.1f}% | Precision={prec:5.1f}% | Recall={rec:5.1f}% ({cnt} test images)")

    print("\nEvaluation completed successfully!")
    print("==================================================")

if __name__ == "__main__":
    evaluate_model()
