from ultralytics import solutions

inf = solutions.Inference(
    model="yolo11n.pt"
)

inf.inference()

# 사전 설치: pip install streamlit
# 실행 방법: streamlit run ./v15_19_yolo_streamlit.py