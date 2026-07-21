from ultralytics import YOLO
import cv2
import time

# 1. model select
model = YOLO("yolo11n.pt")

# 2. set video src route
cap = cv2.VideoCapture(0)

# 3. frame handler
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("failed to read")
        break

    # 3-1. estimate time for inducing
    start_time = time.perf_counter()
    results = model(frame, verbose=False)
    end_time = time.perf_counter()

    # 3-2. Calculate FPS
    model_time = end_time - start_time
    fps = 1 / model_time

    # 3-3. recall visual result and fps
    annotated_frame = results[0].plot()
    cv2.putText(
        annotated_frame,
        f"{fps: .1f} FPS",
        (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    cv2.imshow("YOLO FPS", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("terminate")
        break

# 4. release
cap.release()
cv2.destroyAllWindows()