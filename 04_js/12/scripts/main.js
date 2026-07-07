const t =document.querySelector("#t")
const result = document.querySelector("#result")

document.querySelector("#btn01").addEventListener("click", () => {
    const text = t.value;
    result.innerHTML =
    `Length(글자수): ${text.length}` + "<br>" +
    `CapitalLetter(대문자): ${text.toUpperCase()}` + "<br>" +
    `Replace(e→E 바꾸기): ${text.replaceAll("e", "E")}`;
});