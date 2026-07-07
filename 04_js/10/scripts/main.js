const greet = document.querySelector("#greet");
const input = document.querySelector("#name");

const save = localStorage.getItem("name");
if (save) {
    greet.textContent = `Hello, ${save}!`;
}

document.querySelector("#save").addEventListener("click", ()=> {
    const myName = input.value;
    if (!myName) { return; }
    localStorage.setItem("name", myName);
    greet.textContent = `Hello, ${myName}!`;
});

document.querySelector("#remove").addEventListener("click", ()=>{
    localStorage.removeItem("name");
    greet.textContent = "See you";
})