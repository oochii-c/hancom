const n = document.querySelector("#n");
const out = document.querySelector("#out");

document.querySelector("#repeat").addEventListener("click", ()=> {
    out.innerHTML ="";
    const count = Number(n.value);

    for (let i = 1; i <= count; i++) {
        const li = document.createElement("li");
        li.textContent = `${i}번째 ❤️`;
        out.appendChild(li);
    }
})

document.querySelector("#countdown").addEventListener("click", () =>  {
    out.innerHTML = "";
    let i = Number(n.value);

    while (i > 0) {
        const li =document.createElement("li");
        li.textContent = i;
        out.appendChild(li);
        i--;
    }
});