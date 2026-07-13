//결과 칸을 찾아 담기
const out = document.querySelector("#out");

const show = (value) => {
    const shown = (typeof value === "object" && value !== null) ? 
    JSON.stringify(value) : value;
    out.textContent = `${shown} (타입: ${typeof value})`;
};

let empty;

document.querySelector('#bStr').addEventListener("click", () => show("안녕"));
document.querySelector('#bNum').addEventListener("click", () => show(10));
document.querySelector('#bBool').addEventListener("click", () => show(true));
document.querySelector('#bUndef').addEventListener("click", () => show(empty));
document.querySelector('#bNull').addEventListener("click", () => show(null));
document.querySelector('#bArr').addEventListener("click", () => show([1, "Bob", 10]));
document.querySelector('#bObj').addEventListener("click", () => show({name: "Bob"}));