from ultralytics import YOLO
import cv2
import os

# 1. load model
model = YOLO("yolo11n.pt")

# 2. image src route
input_image_path = "13_yolo/advanced/demo_data/img_highway.png"

# 3. model prediction
results = model(input_image_path)

# 4. visualising result
annotated_frame = results[0].plot()

# 5. save result
os.makedirs("sahi", exist_ok=True) #create folder
output_image_path = "sahi/results_org.jpg"
cv2.imwrite(output_image_path, annotated_frame)

# 6. number of detected 
detected = len(results[0].boxes)

print("===========")
print(f"기본 YOLO 추론 완료 {output_image_path}")
print(f"# of detected : {detected}")
