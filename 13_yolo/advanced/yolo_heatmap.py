from ultralytics import solutions
import cv2

# 1. 비디오 경로 설정
cap = cv2.VideoCapture(0)

# 2. 모델 로드 및 Heatmap 객체 생성
heatmap = solutions.Heatmap(
    model = "yolo11n.pt",
    colormap = cv2.COLORMAP_MAGMA #컬러팔레트 지정
)

# 3. 비디오 프레임 처리
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("프레임을 못 읽었습니다.")
        break

    # 3-1. 누적 히트맵 갱신
    results = heatmap(frame)

    # 3-2. 결과 이미지 저장
    #results[0].plot()
    annotated_frame = results.plot_im

    # 3-3. 윈도우로 결과 송출
    cv2.imshow("HEATMAP", annotated_frame)

    # 3-4. 종료 버튼 추가 (q키로 구동)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("q키를 눌러서 종료")
        break

# 4. 자원 해제
cap.release()
cv2.destroyAllWindows()