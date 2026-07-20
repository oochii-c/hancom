from ultralytics import YOLO
import cv2

model = YOLO("yolo11n.pt")


model(
    "./13_yolo/basic/input_params.jpg",
    save=True,
    conf=0.5,
    max_det=3,
    save_crop=True,
    save_txt=True,
)

