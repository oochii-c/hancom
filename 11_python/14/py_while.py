def meters_to_feet(meters):
    feet = meters * 3.28084
    return feet


while True:
    user_input = input("미터 값을 입력해주세요: ")

    try:
        meters = float(user_input)
        feet = meters_to_feet(meters)
        print(f"{meters}m 는 {feet}ft 입니다.")
    #break 여기에 브레이크 넣으면 아래는 그냥 날라간다
    except ValueError:
        print("숫자를 입력해줏쇼")
