// 1. Dog 클래스 — 강아지를 찍어내는 "틀"
class Dog {
  constructor(name) {   // new로 만들 때 자동 호출, 받은 이름을 보관
    this.name = name;   // this = 지금 만들어지는 객체 자신
  }
  bark() {              // 메서드 — 모든 Dog 객체가 함께 쓰는 동작
    return `${this.name}: 멍멍!`;
  }
}

// 2. 결과 칸 찾기
const out = document.querySelector("#out");

// 3. 틀로 객체(인스턴스) 두 개 찍어내기 (new)
const poppy = new Dog("뽀삐");   // 변수명은 의미 있게 (a·b 대신)
const choco = new Dog("초코");

// 4. 버튼 누르면 각 객체가 자기 이름으로 짖기 (화살표 함수)
document.querySelector("#bark").addEventListener("click", () => {
  out.textContent = `${poppy.bark()}  ${choco.bark()}`;
});