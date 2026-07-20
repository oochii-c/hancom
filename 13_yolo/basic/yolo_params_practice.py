from ultralytics import YOLO

model = YOLO("yolo11n.pt")

results = model(
    "./13_yolo/basic/input_params.jpg",
    save=True,
    conf=0.2,   # 낮춰서 뭐가 잡히는지 확인
)

for box in results[0].boxes:
    cls_id = int(box.cls)
    print(model.names[cls_id], float(box.conf))