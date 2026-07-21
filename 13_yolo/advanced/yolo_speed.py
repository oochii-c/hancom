from ultralytics import solutions
import cv2

cap = cv2.VideoCapture("http://210.99.70.120:1935/live/cctv013.stream/playlist.m3u8q")


yolo_speed = solutions.SpeedEstimator(
    model = "yolo11n.pt",
    show=False,
    classes=[2],
    line_width=2,
    max_speed=120,
    meter_per_pixel=0.5
)

while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("failed to read")
        break

    results = yolo_speed(frame)

    cv2.imshow("Speed", results.plot_im)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("terminate")
        break

cap.release()
cv2.destroyAllWindows()