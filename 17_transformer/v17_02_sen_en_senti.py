from transformers import pipeline
# pipeline : 텍스트, 이미지 등 다양한 AI 테스크를 쉽게 실행할 수 있는 도구

# 1. 감정 분석 파이프라인 생성
classifier = pipeline("sentiment-analysis")

# 2. 감정 분석할 문장 입력
text = "Am I looking good?"
# I'm feeling really great today / positive / 0.9998668432235718
# wtf are you saying now / negative / 0.9657
# take on a bus / positive / 0.5569
results = classifier(text)

# 3. 결과 확인
print(f"감정 분석 결과 : {results[0]['label']}")
print(f"감정 분석 점수 : {results[0]['score']:.4f}")