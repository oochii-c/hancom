import pytesseract
from PIL import Image
import os

# 1. tesseract 실행 파일 경로 지정
pytesseract.pytesseract.tesseract_cmd = ""C:/Program Files/Tesseract-OCR/tesseract.exe""

# 2. 이미지 불러오기
image = Image.open("tesseract.png")

# 3. ocr 수행
results = pytesseract.image_to_string(
    image,
    lang="eng"
)

# 4. 결과 출력
print(results)