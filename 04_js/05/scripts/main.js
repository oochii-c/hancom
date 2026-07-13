const a = document.querySelector("#a");
const b = document.querySelector("#b");
const op = document.querySelector("#op");
const out = document.querySelector("#out");

document.querySelector("#calc").addEventListener("click", () =>{
    const x = Number(a.value);
    const y = Number(b.value);
    let result;

    if (op.value === "+") {result = x + y;}
    else if (op.value === "-") {result = x - y;}
    else if (op.value === "*") {result = x * y;}
    else {result = x / y;}
    out.textContent = `${x} ${op.value} ${y} = ${result}`;
});