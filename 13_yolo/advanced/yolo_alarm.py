from ultralytics import solutions
import cv2

# 1. 비디오/스트림 경로 설정
stream_url = "https://strm1.spatic.go.kr/live/57.stream/playlist.m3u8"
cap = cv2.VideoCapture(stream_url)

# 2. 이메일 인증
frome_email = ""
password = ""
to_email = ""

# 3. 모델 로드 및 알람 객체 생성
google_alarm = solutions.security_alarm(
    model = "yolo11n.pt",
    show = False,
    records = 2 #경고 이메일을 전송하기 위한 최소 감지 수,
    classes=[2]
)

# 4. 이메일 서버 인증
google_alarm.authenticate(frome_email, password, to_email)

# 5. 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("프레임 읽기 실패")
        break

    # 5-1. 보안 감시 수행
    results = google_alarm(frame)

    # 5-2. 결과 프레임 표시
    cv2.imshow("ALARM", results.plot_im)

    # 5-3. q키를 눌러서 종료
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("q키를 눌러서 종료")
        break

# 6. 자원 해제
cap.release()
cv2.destroyAllWindows()