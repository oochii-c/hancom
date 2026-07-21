from ultralytics import solutions
import cv2

# 1. video src route setting
cap = cv2.VideoCapture("https://strm1.spatic.go.kr/live/57.stream/playlist.m3u8")

# 2. location indicator setting
region_points = {
    "region-01": [(192, 175), (180, 410), (439, 386), (273, 168)]
}

'''the point you clicked is (241, 233).
the point you clicked is (330, 215).
the point you clicked is (355, 256).
the point you clicked is (319, 284).
the point you clicked is (250, 277).
the point you clicked is (228, 246).
the point you clicked is (365, 196).
the point you clicked is (400, 225).'''

# 3. load model and regional object create
yolo_region = solutions.RegionCounter(
    model = "yolo11n.pt",
    show=False,
    region=region_points,
    conf=0.4 #threshold
)



# 4. frame handler
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("프레임 읽기 실패")
        break
    # 4-1. frame size control
    re_frame =cv2.resize(frame, (640, 480))

    # 4-2. calculating objects in area
    results = yolo_region(re_frame)

    # 4-3. visualising frame
    cv2.imshow("Region", results.plot_im)

    # 4-4. terminate the system with q
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("terminate")
        break

# 5. source release
cap.release()
cv2.destroyAllWindows()
