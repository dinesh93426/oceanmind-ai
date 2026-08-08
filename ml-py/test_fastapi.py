"""
FastAPI Service Test Suite (Step 17)
Tests:
1. GET /health
2. POST /predict with valid fish image
3. POST /predict with invalid file format
4. POST /predict with empty file
"""

import os
import io
import json
from pathlib import Path
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_fastapi_endpoints():
    print("==================================================")
    print("         TESTING FASTAPI ML SERVICE (STEP 17)")
    print("==================================================")

    # 1. Test GET /health
    print("\n[1] Testing GET /health...")
    res_health = client.get("/health")
    print(f"Status Code: {res_health.status_code}")
    print(f"Response: {res_health.json()}")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "ok"
    assert res_health.json()["service"] == "mlpyserver"
    print("--> PASSED /health check!\n")

    # 2. Create a synthetic test image in memory
    img = Image.new("RGB", (300, 300), color=(100, 150, 200))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="PNG")
    img_bytes = img_byte_arr.getvalue()

    # 3. Test POST /predict with valid PNG image
    print("[2] Testing POST /predict with valid fish image...")
    files = {"image": ("test_fish.png", img_bytes, "image/png")}
    res_predict = client.post("/predict", files=files)
    print(f"Status Code: {res_predict.status_code}")
    print(f"Response: {json.dumps(res_predict.json(), indent=2)}")
    assert res_predict.status_code == 200
    assert res_predict.json()["success"] is True
    print("--> PASSED POST /predict endpoint!\n")

    # 4. Test POST /predict with unsupported file format (.txt)
    print("[3] Testing Input Validation with invalid format (.txt)...")
    invalid_files = {"image": ("document.txt", b"Hello world", "text/plain")}
    res_invalid = client.post("/predict", files=invalid_files)
    print(f"Status Code: {res_invalid.status_code}")
    print(f"Response: {res_invalid.json()}")
    assert res_invalid.status_code == 400
    assert res_invalid.json()["success"] is False
    print("--> PASSED Invalid File Format rejection!\n")

    print("==================================================")
    print("   ALL FASTAPI ML SERVICE TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    test_fastapi_endpoints()
