names = ["뽀삐", "초코", "쿠키"]
scores = [95, 88, 72]

for name, score in zip(names, scores):
    print(f"{name} : {score}")


pairs = list(zip(names, scores))
print(pairs)

key = ["이름", "나이", "직업"]
values = ["홍길동", "30", "개발자"]

person = dict(zip(keys, values))