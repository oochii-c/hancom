import urllib           # url 요청
import json             # json 데이터 처리
import pandas as pd     # 데이터 프레임 생성 및 처리
import urllib.request   # url 요청 2
import ssl              # TLS 재협상 이슈 대응
import time             # 재시도 대기
import certifi          # Windows 인증서 저장소 손상 회피용 고정 CA 번들

# 1. 인증 키 설정
key = "db5c00dc1fce45c49049bff225a0fea6"

# 2. 도로 유형 지정
Type = "its"            #its/ex = 일반도로/고속도로

# 3. 관심 영역 설정
minX = float(120.95)
maxX = float(127.02)
minY = float(30.55)
maxY = float(37.69)

# 4. 응답 데이터 형식 설정
getType = "json"

# 5. API 요청 URL 생성
url_cctv = (
    f"https://openapi.its.go.kr:9443/cctvInfo"
    f"?apiKey={key}&type={Type}&cctvType=1"
    f"&minX={minX}&maxX={maxX}"
    f"&minY={minY}&maxY={maxY}"
    f"&getType={getType}"
)

# 6. APi 요청 및 응답 받기
# Windows 인증서 저장소(Cert Store)가 보안 프로그램 등에 의해 간헐적으로 손상돼
# ssl.create_default_context()에서까지 ASN1: NOT_ENOUGH_DATA가 발생할 수 있어,
# Windows store 대신 certifi의 고정 CA 번들을 사용하고 재시도 로직을 추가함
for attempt in range(3):
    try:
        ctx = ssl.create_default_context(cafile=certifi.where())
        ctx.options |= 0x4  # SSL_OP_LEGACY_SERVER_CONNECT
        response = urllib.request.urlopen(url_cctv, context=ctx, timeout=10)
        break
    except ssl.SSLError as e:
        print(f"SSL 오류 발생 (시도 {attempt + 1}/3): {e}")
        if attempt == 2:
            raise
        time.sleep(1)
#print(response)

# 7. 응답 데이터 디코딩 => bytes => str (읽을 수 있는 문자로)
json_str = response.read().decode('utf-8')
#print(json_str)

# 8. json 문자열 => 파이썬 딕셔너리
json_object = json.loads(json_str)
print(json_object)

# 9. 데이터프레임 변환
cctv_play = pd.json_normalize(json_object["response"]["data"])
#cctv 목록이 맨 위에 안 놓여있고 response => data 안에 숨어있어서 거기까지 손 뻗게
print(cctv_play)

# 10. 특정 cctv 선택
test_url = cctv_play["cctvurl"][77]
print(F"선택된 cctv url => {test_url}")