from ultralytics import YOLO
import cv2

# 1. 비디오 경로 설정
stream_url = "https://strm1.spatic.go.kr/live/57.stream/playlist.m3u8"

cap = cv2.VideoCapture(stream_url)

# 2. 모델 로드
model = YOLO("yolo11n.pt")

# 3. 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("프레임 읽기 실패")
        break

    # 3-1. 객체 추적 수정
    results = model.track(frame, persist=True, conf=0.6)
    # persist=True => 이전 프레임 정보 유지

    # 3-2. 추적 결과 시각화
    annotated_frame = results[0].plot()

    # 3-3. 결과 화면
    cv2.imshow("YOLO_TRACKING", annotated_frame)
    cv2.namedWindow("YOLO_TRACKING", cv2.WINDOW_NORMAL)

    # 3-4. q키를 눌러 종료
    if cv2.waitKey(1) & 0xFF ==ord('q'):
        print("q키를 눌러 종료합니다.")
        break

# 4. 자원 해제
cap.release()
cv2.destroyAllWindows()