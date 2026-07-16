colors = ["red", "green", "blue"]
#순서있음, 수정가능, 중복허용

#print(colors[0])

print(colors[0:2])

colors[-1] = "black"
print(colors[-1])

colors.insert(0, "white")

colors.remove("red")
print(colors)

numbers = [8, 5, 3, 2, 7]
numbers.sort(reverse=True)

print(2 in numbers)