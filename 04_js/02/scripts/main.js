const title = document.querySelector("#title") // .(comma)는 ~의 = 소유격 표현;

const btn = document.querySelector("#btn");

btn.addEventListener("click", () => {           // => 이 화살표는 보이는대로의 함수다
    title.textContent = "Hello World";
});