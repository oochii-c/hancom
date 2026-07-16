with open("./memo.txt", "w", encoding="utf-8") as f:
    f.write("안녕, 파이썬...!\n")
    f.write("with문이 자동으로 닫아줌\n")

print("잘작성되었습니다")
#블록을 빠져나오면 파일은 알아서 닫힘

with open("memo.txt", "r", encoding="utf-8") as f:
    text = f.read()

print(text)

with open("memo.txt", "a", encoding="utf-8") as f:
    f.write("새로우운 한줄 추가\n")

print("새로운 한줄 추가 완료!")
#기존 내욜른 그대로 두되, 끝에만 한줄이 더 붙음