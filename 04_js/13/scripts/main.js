const fruits = ["사과", "바나나"];

const fruit = document.querySelector("#fruit");
const out = document.querySelector("#out");
const info = document.querySelector("#info");

const render = () => {
    out.textContent = fruits.join(", ");
    info.textContent = `개수(length): ${fruits.length}`;
};
render();

document.querySelector("#add").addEventListener("click", () => {
    if(!fruit.value) { return;}
    fruits.push(fruit.value);
    fruit.value = "";
    render();
})