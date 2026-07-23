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
import pandas as pd
from ultralytics import YOLO
import cv2
import plotly.express as px

# CCTV 스트림 주소
STREAM_URL = "http://210.99.70.120:1935/live/cctv013.stream/playlist.m3u8"
# 모델 경로 — 이 파일 기준 상위 폴더의 yolo11n.pt 를 절대경로로 찾아 다운로드를 피함
MODEL_PATH = Path(__file__).resolve().parent.parent / "yolo11n.pt"

# 1. 화면 구성 - 화면을 좌우 2칸으로 분할
col1, col2 = st.columns(2)

with col1:
    frame_placeholder = st.empty()

with col2:
    chart_placeholder = st.empty()


# 2. 모델 로드 (한 번만 로드하도록 캐시)
@st.cache_resource
def load_model():
    # 로컬 파일이 있으면 그걸 사용(다운로드 없음), 없으면 이름만 넘겨 자동 다운로드
    path = str(MODEL_PATH) if MODEL_PATH.exists() else "yolo11n.pt"
    return YOLO(path)


model = load_model()

# 3. 시작/정지 버튼 — 무한 루프를 사용자가 제어할 수 있게
if st.button("시작 / 정지"):
    st.session_state["running"] = not st.session_state.get("running", False)

if st.session_state.get("running", False):
    # 4. 비디오 스트림 연결
    cap = cv2.VideoCapture(STREAM_URL)

    if not cap.isOpened():
        st.error("CCTV 스트림에 연결하지 못했습니다. 주소나 네트워크를 확인하세요.")
        st.session_state["running"] = False
    else:
        try:
            # 5. 프레임 처리
            while st.session_state.get("running", False) and cap.isOpened():
                success, frame = cap.read()
                if not success:
                    st.warning("프레임 읽기 실패")
                    break

                results = model(frame, verbose=False)
                annotated_frame = results[0].plot()

                labels = [model.names[int(c)] for c in results[0].boxes.cls]

                if labels:
                    df_count = pd.DataFrame({"Object": labels})
                    df_count = df_count.value_counts().reset_index(name="Count")
                    fig = px.bar(
                        df_count,
                        x="Object",
                        y="Count",
                        title="탐지 객체 수",
                        color="Object",
                        text="Count",
                    )
                else:
                    df_count = pd.DataFrame({"Object": [], "Count": []})
                    fig = px.bar(df_count, x="Object", y="Count", title="탐지 객체 수")

                frame_placeholder.image(annotated_frame, channels="BGR")
                chart_placeholder.plotly_chart(
                    fig,
                    use_container_width=True,
                    key=f"chart_{time.time()}",
                )

                time.sleep(0.01)  # CPU 과점유 방지용 짧은 대기
        finally:
            cap.release()
else:
    st.info("‘시작 / 정지’ 버튼을 눌러 CCTV 탐지를 시작하세요.")
