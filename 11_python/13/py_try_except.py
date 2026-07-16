def meters_to_feet(meters):
    feet = meters * 3.28084
    return feet

#사용자 입력
user_input = input("미터 값을 입력해주세요 : ")

#예외 처리
try: 
    meters = float(user_input)
    feet = meters_to_feet()
    print(f"{meters}m 는 {feet}ft 입니다.")
except ValueError:
    print("숫자를 입력해주세요")