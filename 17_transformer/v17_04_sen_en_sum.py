from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# 1. 토크나이저 & 요약 모델 로드 (t5-small은 seq2seq 모델)
#    (왜) transformers 5.x에서는 pipeline("summarization")이 빠져서
#         seq2seq 모델을 직접 불러 generate로 요약한다.
model_name = "t5-small"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# 2. 요약할 원문
text = """A special 25th anniversary edition of the extraordinary
international bestseller... Santiago's journey teaches us about
the essential wisdom of listening to our hearts..."""

# 3. 입력 인코딩 (t5는 "summarize: " 접두사로 요약 태스크를 지시)
inputs = tokenizer(
    "summarize: " + text,
    return_tensors="pt",   # 파이토치 텐서로 반환
    truncation=True,       # 모델 최대 길이 초과 시 자르기
)

# 4. 요약 실행 (길이 옵션 지정)
# (왜) 기본값은 모델마다 다름 → 명시 지정해야 결과 길이 예측 가능
summary_ids = model.generate(
    **inputs,
    min_length=20,   # 최소 토큰 수 → 너무 짧은 요약 방지
    max_length=60,   # 최대 토큰 수 → 길이 폭주 방지
    do_sample=False, # 결정적(greedy) 생성 → 매번 동일 결과
)

# 5. 토큰 → 문자열 디코딩 후 출력
sum_text = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
print(f"요약된 문장 : {sum_text}")
