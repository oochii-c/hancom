from ultralytics import solutions
import cv2

# 1. 비디오 경로 설정
cap = cv2.VideoCapture(0)

# 2. 모델 로드 및 블러 객체 생성
blurrer = solutions.ObjectBlurrer(
    model="yolo11n.pt",
    show=False,
    blur_ratioq=0.5 #블러 강도 (0.1 ~ 1.0, 높을 수록 더 흐림)
)

# 3. 비디오 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("프레임 읽기 실패")
        break

    # 3-1. 탐지 => 박스 영역 자동 블러
    results = blurrer(frame)

    # 3-2. 처리된 프레임 표시 (show=False => 우리가 직접 창을 띄움)
    cv2.imshow("BLUR", results.plot_im)

    # 3-3. q 키를 눌러서 종료
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("q키를 눌러서 종료")
        break

# 4. 자원 해제
cap.release()
cv2.destroyAllWindows()



