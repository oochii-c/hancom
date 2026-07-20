import cv2  #카메라를 다루는 도구
import os   #폴더를 만드는 도구
from datetime import datetime   #지금 시간을 알려주는 도구

# 1. 사진을 저장할 폴더 준비
save_dir = "./12_data/captured_images"
os.makedirs(save_dir, exist_ok=True) #폴더가 없으면 자동 생성

# 2. 카메라를 작동합니다
cap = cv2.VideoCapture(0)

# 3. 사진을 한 장 찍습니다.
success, frame = cap.read()
if success:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S") # ex). 20260720_092155
    file_path = os.path.join(save_dir, f"result_{timestamp}.jpg")

    #파일 저장
    cv2.imwrite(file_path, frame)
    print(f"사진이 저장됐습니다. {file_path}")

else:
    print("카메라를 못 읽었습니다.")

#4. 카메라 기능 정지
cap.release()
