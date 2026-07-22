from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# 1. 토크나이저 & 번역 모델 로드 (NLLB: 다국어 번역 모델, 한국어 지원)
#    (왜) t5-small / opus-mt-en-ko는 한국어 품질이 나쁘다.
#         NLLB는 200개 언어를 학습해 영어→한국어 품질이 안정적이다.
#    src_lang: 입력 언어 코드 (영어 = eng_Latn)
model_name = "facebook/nllb-200-distilled-600M"
tokenizer = AutoTokenizer.from_pretrained(model_name, src_lang="eng_Latn")
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# 번역 목표 언어 코드 (한국어 = kor_Hang)
TARGET_LANG = "kor_Hang"

# 2. 번역할 원문 (영어) — 사용자가 직접 입력
text = input("번역할 영어 문장을 입력하세요: ")


def translator(text):
    # 3. 입력 인코딩
    inputs = tokenizer(
        text,
        return_tensors="pt",   # 파이토치 텐서로 반환
        truncation=True,       # 모델 최대 길이 초과 시 자르기
    )

    # 4. 번역 실행
    #    forced_bos_token_id: 출력 첫 토큰을 목표 언어로 강제 → 어떤 언어로 번역할지 지정
    translated_ids = model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.convert_tokens_to_ids(TARGET_LANG),
        max_length=100,  # 최대 토큰 수 → 길이 폭주 방지
        do_sample=False, # 결정적(greedy) 생성 → 매번 동일 결과
    )

    # 5. 토큰 → 문자열 디코딩 후 반환
    return tokenizer.decode(translated_ids[0], skip_special_tokens=True)


# 6. 함수 호출 & 출력  (정의만 하면 실행 안 됨 → 반드시 호출)
print(f"번역된 문장 : {translator(text)}")
