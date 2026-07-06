const flavor = document.querySelector("#flavor");
const result = document.querySelector("#result");

document.querySelector("#check").addEventListener("click", () =>{
    if(flavor.value === "chocolate") {
        result.textContent = "초코 퍼 지";
    } else if (flavor.value === "mintchoco") {
        result.textContent = "민초단이여 영원하라"
    } else {
        result.textContent = "바닐라 근본 유노 맛";
    }
});