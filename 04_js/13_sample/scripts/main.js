// 필요한 요소들을 미리 찾아둠
const name = document.querySelector("#name");
const add = document.querySelector("#add");
const list = document.querySelector("#list");
const count = document.querySelector("#count");

// 추가된 이름들을 담아둘 배열 (누적 저장소)
const items = [];

// 화면(목록 + 개수)을 다시 그려주는 함수
function render() {
    // 배열을 ", "로 이어붙여서 목록에 표시
    list.textContent = items.join(", ");
    // 배열 길이로 개수 표시
    count.textContent = `개수(length): ${items.length}`;
}

// 추가 버튼을 눌렀을 때 실행
add.addEventListener("click", () => {
    // 앞뒤 공백 제거한 입력값
    const text = name.value.trim();

    // 빈 값이면 추가하지 않고 종료
    if (text === "") return;

    // 배열에 추가하고 화면 갱신
    items.push(text);
    render();

    // 입력창 비우고 다시 포커스(연속 입력 편하게)
    name.value = "";
    name.focus();
});

// 입력창에서 Enter 키를 눌러도 추가되도록
name.addEventListener("keydown", (e) => {
    if (e.key === "Enter") add.click();
});
