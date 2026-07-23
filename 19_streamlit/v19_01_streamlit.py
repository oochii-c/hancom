import os
import ssl
import time
from pathlib import Path

# --- SSL 오류(CERTIFICATE_VERIFY_FAILED) 대응 ---------------------------------
# Ultralytics가 모델/폰트를 HTTPS로 내려받을 때 윈도우에서 인증서 검증에 실패하는
# 경우가 많다. certifi 인증서 번들을 requests/OpenSSL이 쓰도록 지정하고,
# 그래도 실패하면 검증을 건너뛰는 안전장치를 둔다.
try:
    import certifi

    os.environ.setdefault("SSL_CERT_FILE", certifi.where())
    os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())
    os.environ.setdefault("CURL_CA_BUNDLE", certifi.where())
except Exception:
    pass
ssl._create_default_https_context = ssl._create_unverified_context
# -----------------------------------------------------------------------------

import streamlit as st
from ultralytics import YOLO
import cv2

# CCTV 스트림 주소
STREAM_URL = "http://210.99.70.120:1935/live/cctv013.stream/playlist.m3u8"
# 모델 경로 — 이 파일 기준 상위 폴더에 있는 yolo11n.pt 를 항상 찾도록 절대경로로 지정
MODEL_PATH = Path(__file__).resolve().parent.parent / "yolo11n.pt"


# 1. Streamlit 페이지 기본 설정 — 웹 화면 모양 결정
st.set_page_config(layout="wide")  # 화면을 가로로 넓게 사용 (꼭 코드 맨 위)
st.title("YOLO 실시간 CCTV 탐지")   # 페이지 맨 위에 큰 제목 표시


# 2. 모델 로드 — 사물 인식 AI 두뇌 불러오기 (한 번만 로드하도록 캐시)
@st.cache_resource
def load_model():
    # 지정 경로에 파일이 있으면 그걸 쓰고, 없으면 이름만 넘겨 자동 다운로드
    path = str(MODEL_PATH) if MODEL_PATH.exists() else "yolo11n.pt"
    return YOLO(path)


model = load_model()

# 3. 시작/정지 버튼 — 무한 루프를 사용자가 제어할 수 있게
start = st.button("시작 / 정지")

# 버튼을 누를 때마다 실행 상태를 토글
if start:
    st.session_state["running"] = not st.session_state.get("running", False)

# 4. 영상 출력용 공간 설정 — 영상이 들어갈 빈 액자 준비
frame_placeholder = st.empty()  # 사진을 계속 갈아끼울 자리 (placeholder)

if st.session_state.get("running", False):
    # 5. CCTV 비디오 스트림 연결 — 인터넷 CCTV 카메라 접속
    cap = cv2.VideoCapture(STREAM_URL)

    # 5-0. 연결 실패 시 조용히 넘어가지 않고 명확히 알림 (기존 코드의 핵심 버그)
    if not cap.isOpened():
        st.error("CCTV 스트림에 연결하지 못했습니다. 주소나 네트워크를 확인하세요.")
        st.session_state["running"] = False
    else:
        try:
            # 6. 비디오 프레임 처리 — CCTV 영상을 한 장씩 분석 반복
            while st.session_state.get("running", False) and cap.isOpened():
                success, frame = cap.read()  # 영상에서 사진 한 장 가져오기
                if not success:              # 사진 못 가져오면
                    st.warning("프레임 읽기 실패")
                    break                    # 반복 멈추기

                # 6-1. 모델로 객체 탐지 수행 — AI에게 사진 보여주고 분석 요청
                results = model(frame)

                # 6-2. 탐지 결과를 이미지에 시각화 — 찾은 사물에 네모 박스 그리기
                annotated_frame = results[0].plot()

                # 6-3. Streamlit placeholder에 프레임 갱신 — 빈 액자에 결과 사진 표시
                frame_placeholder.image(annotated_frame, channels="BGR")  # BGR = OpenCV 색 순서

                time.sleep(0.01)  # CPU 과점유 방지용 짧은 대기
        finally:
            # 7. 자원 해제 — 끝나면 카메라 연결 닫기 (메모리 정리)
            cap.release()
else:
    st.info("‘시작 / 정지’ 버튼을 눌러 CCTV 탐지를 시작하세요.")
