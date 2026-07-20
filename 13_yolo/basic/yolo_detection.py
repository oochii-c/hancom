from ultralytics import YOLO
import cv2

#1. 모델 로드
model = YOLO("yolo11n.pt")

#2. 모델 추론
results = model("13_yolo/basic/input_det.jpg")

#3. 결과 시각화
results_image = results[0].plot()

#4. 결과 이미지 저장
output_image_path = "./13_yolo/basic/result_det.jpg"
cv2.imwrite(output_image_path, results_image)
print(f"저장 잘 됐습니다. => {output_image_path}")