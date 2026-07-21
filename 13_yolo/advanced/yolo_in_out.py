from ultralytics import solutions
import cv2

# 1. set video src route
cap = cv2.VideoCapture("http://210.99.70.120:1935/live/cctv013.stream/playlist.m3u8")

# 2. set counting border
count_points = [(123, 456), (620, 340)] #좌 -> 우

# 3. load model and counting object create
counter = solutions.ObjectCounter(
    model = "yolo11n.pt",
    show = False,
    region = count_points

)
# 4. frame handler
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("failed to read")
        break

    # 4-1. resize frame
    re_frame = cv2.resize(frame, (640, 480))

    # 4-2. indicating and tracking border-control +in/out count
    results = counter(re_frame)

    # 4-3. visualising frame
    cv2.imshow("IN/OUT COUNT", results.plot_im)

    # 4-4. terminate by q
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("terminate")
        break

# 5. release
cap.release()
cv2.destroyAllWindows()