const path = document.querySelector(".draw-path");
const wrap = document.querySelector(".draw-wrap");

// 1. 선의 전체 길이를 구해서 dasharray/dashoffset 초기값으로 설정
// (dashoffset = 전체 길이 만큼 선을 안 보이게 밀어둔 상태)
const length = path.getTotalLength();
path.style.strokeDasharray = length;
path.style.strokeDashoffset = length;

function clamp(v, min = 0, max = 1) {
    return Math.min(max, Math.max(min, v));
}

function updateDraw() {
    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight;

    // wrap 요소가 화면 아래에서 위로 지나가는 구간을 0~1 진행률로 환산
    // top이 화면 하단(vh)에 닿았을 때 0, bottom이 화면 상단(0)에 닿았을 때 1
    const start = vh;
    const end = -rect.height;
    const progress = clamp((start - rect.top) / (start - end));

    const offset = length * (1 - progress);
    path.style.strokeDashoffset = offset;
}

window.addEventListener("scroll", updateDraw);
window.addEventListener("resize", updateDraw);
updateDraw();
