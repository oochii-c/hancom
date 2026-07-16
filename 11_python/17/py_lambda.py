import pyfiglet

def add(a, b):
    return a + b

print(add(10, 335))

#add =lambda a, b : a + b

sentence="userinput"
py_sentence: pyfiglet.figlet_format(sentence)

import pyfiglet

# 일반 함수로 만들면 (참고)
# def decorate_text(text):
#     return pyfiglet.figlet_format(text)

# 람다로 한 줄 줄임
decorate_text = lambda text: pyfiglet.figlet_format(text)
py_text = decorate_text("Lambda")
print(py_text)