from transformers import pipeline

# 1. 텍스트 생성 파이프라인
generator = pipeline(
    "text-generation",
    model="gpt2"
)
# 2. 시드 문장 입력
answer = input("생성 문장을 입력해주세요: ")

# 3. 텍스트 생성 실행
results = generator(
    answer,
    max_new_tokens=50,               #추가 생성할 토큰 수
    num_return_sequences=1,          #반환 문장 수
    truncation=True,                  #입력이 모델 최대 길이 초과시 자릐기
)

# 4. 결과 확인
print(results)