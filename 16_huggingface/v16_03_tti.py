import os
from pathlib import Path
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv(Path(__file__).with_name(".env"))

token = os.getenv("hf_token")
if not token:
    raise SystemExit(".env 에서 hf_token 을 읽지 못했습니다.")

client = InferenceClient(
    api_key=token,
)

#inpuy set
answer = input("생성할 이미지를 설명해주세요. :")

# output is a PIL.Image object
image = client.text_to_image(
    answer,
    model="black-forest-labs/FLUX.1-dev",
)

image.save("16_huggingface\v16_03_tti.py")

print("전체 코드가 잘 실행되었습니다")