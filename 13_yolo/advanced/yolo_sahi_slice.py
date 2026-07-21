import os

from sahi.predict import  get_sliced_prediction
from sahi import AutoDetectionModel

# 1. model route
model_path = "yolo11n.pt"

# 2. load model
detection_model = AutoDetectionModel.from_pretrained(
    model_type="ultralytics",
    model_path=model_path,
    confidence_threshold=0.4
)

# 스크립트 위치 기준으로 이미지 경로 절대화
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
img_path = os.path.join(BASE_DIR, "demo_data", "img_car.png")

# 3. adapting s a h i
results = get_sliced_prediction(
    img_path,
    detection_model,
    slice_width=200,    #tile width
    slice_height=200,   #tile height
    overlap_width_ratio=0.1,   #horizontal aligning
    overlap_height_ratio=0.1,   #vertical aligning

)
# 4. visualisation and save
results.export_visuals(export_dir="sahi/")

# 5. 
print(f"number of detected: {results.object_prediction_list}")
print("Successfully proceeded")