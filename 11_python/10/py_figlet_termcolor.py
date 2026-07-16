#pyfiglet termcolor 불러오기

import pyfiglet
from termcolor import colored


sentence = ("Hello")
py_sentence =pyfiglet.figlet_format(sentence)

print(colored(py_sentence,
        "blue",
        "on_green"))


textc =colored("Hello", "red", "on_blue")

print(pyfiglet.figlet_format(textc))