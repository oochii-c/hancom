from ultralytics import YOLO
import cv2


stream_url = "http://210.99.70.120:1935/live/cctv009.stream/playlist.m3u8"
# 1. 웹캠 연결
cap = cv2.VideoCapture(stream_url)

# 2. 모델 로드
model = YOLO("yolo11n.pt")

# 3. 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("웹캠 읽기 실패")
        break
    results = model(frame)
    annotated_frame = results[0].plot()

    cv2.imshow("WEB_CAM", annotated_frame)

    # 'q' 키 누르면 종료
    if cv2.waitKey(1) &  0xFF == ord('q'):
        print("q를 눌러서 종료")
        break


#4. 자원 해제
cap.release()
cv2.destroyAllWindows()
