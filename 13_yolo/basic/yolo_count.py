from ultralytics import YOLO
import cv2

#1. cctv 스트리밍 url 설정
stream_url = "http://210.99.70.120:1935/live/cctv009.stream/playlist.m3u8"

cap = cv2.VideoCapture(stream_url)

#2. YOLO 모델 로드
model = YOLO("yolo11n.pt")

#3. 위험 판단 기준
WARNING_THRESHOLD = 5

#4. 실시간 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("웹캠 읽기..... 땡!")
        break
    #4-1. YOLO 추론
    results = model(frame)

    #4-2. 탐지 박스 그린 프레임 생성
    annotated_frame = results[0].plot()

    #4-3. 탐지 객체 수
    count = len(results[0].boxes)

    #4-4. 개수 기준 상태 및 색 결정
    if count >= WARNING_THRESHOLD:
        status = "Warning"
        color = (255, 0, 0)

    else:
        status = "Safe"
        color = (0, 0, 255)

    #4-5. 탐지 객체 수 및 상태 화면에 표시
    cv2.putText(
        annotated_frame,
        f"Detected : {count}, {status}",
        (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        color,
        2,
        cv2.LINE_AA
    )

    # 4-6. 윈도우 창 출력
    cv2.imshow("YOLO_COUNT", annotated_frame)

    #4-7. 종료 키 추가(q로 구동)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("q를 눌러 작업을 종료합니다.")
        break


#5. 자원 해제
cap.release()
cv2.destroyAllWindows