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

answer = input("질문을 입력해주세요: ")
completion = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-V3.2:novita",
    messages=[
        {
            "role": "user",
            "content": answer
        }
    ],
)

print(completion.choices[0].message.content)