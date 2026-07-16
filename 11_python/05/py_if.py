is_raining= True

if is_raining:
    print("우산을 챙기세요")
else:
    print("우산을 챙기지 않아도 됩니다")


temperature = 28  # 오늘 기온 (°C)

if temperature >= 30:
    print("덥다! 반팔 입기")
elif temperature >= 20:
    print("딱 좋아! 가볍게 입기")  # 이 줄 출력 (28 >= 20)
elif temperature >= 10:
    print("쌀쌀해, 겉옷 챙기기")
else:
    print("추워! 두꺼운 코트 입기")