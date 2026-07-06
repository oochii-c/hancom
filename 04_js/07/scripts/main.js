//두 숫자를 곱하는 화살표 함수 (num1, num2 = 받아올 재료 = 매개변수)
// => 뒤가 한줄이면 {return} 없이 그 값이 반환 

const multiply = (num1, num2) => num1 * num2;

// 입력칸 두개와 결과 칸을 찾아 담기


const a = document.querySelector("#a");
const b = document.querySelector("#b");
const out = document.querySelector("#out");


document.querySelector("#calc").addEventListener("click", () => {
    out.textContent = `${a.value} × ${b.value} = ${multiply(Number(a.value), Number(b.value))}`
});


