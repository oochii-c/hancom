let n = 0;

const btn = document.querySelector("#button");
const out = document.querySelector("#txtresult");

btn.addEventListener("click", ()=> {
    n++;
    out.textContent = `${n}번 눌렀어요`;
});