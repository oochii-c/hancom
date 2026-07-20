from ultralytics import YOLO
import cv2

#1. 모델 로드
model = YOLO("yolo11n-pose.pt")

#2. 모델 추론
results = model("13_yolo/basic/input_pose.jpg")

#3. 결과 시각화
result_image = results[0].plot()

#4. 결과 이미지 저장
output_image_path = "./13_yolo/basic/result_pose.jpg"
cv2.imwrite(output_image_path, result_image)
print(f"사진 잘 저장되었습니다. => {output_image_path}")