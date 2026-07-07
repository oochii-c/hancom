const person = {
    name: "콩이",
    age: 10
};

const out = document.querySelector("#out")

const render = () => {
    out.textContent = `${person.name} (${person.age}살)`;
};
render();

document.querySelector("#up").addEventListener("click", () => {
    person.age++;
    render();
});

document.querySelector("#down").addEventListener("click", () => {
    person.age--;
    render();
});

document.querySelector("#rename").addEventListener("click", () => {
    person.name = "두부";
    render();
});