// 1. 결과 찍을 곳 + 서버 주소
const out = document.querySelector("#out");
const API = "/api/users";

// 2. 결과를 화면에 보기 좋게 찍는 함수
const show = (label, data) => {
  out.textContent = `${label}\n${JSON.stringify(data)}`;
};

// 2-1. 서버가 주는 키 순서가 매번 달라서(id/name 뒤죽박죽), 찍기 전에 { id, name } 순서로 통일
const norm = (data) =>
  Array.isArray(data)
    ? data.map(u => ({ id: u.id, name: u.name }))
    : { id: data.id, name: data.name };

// 3. CREATE (생성) — POST
document.querySelector("#btn-create").addEventListener("click", async () => {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "John" })
  });
  show("CREATE 결과", norm(await res.json()));
  // 변환 전: Response { status: 200, body: ReadableStream }
  // 변환 후: { id: 1, name: "John" }
  // res.json() → JSON 파싱 / norm() → 키 순서 정렬(id, name) / show() → 화면 출력
});

// 4. READ (읽기) — GET
document.querySelector("#btn-read").addEventListener("click", async () => {
  const res = await fetch(API);
  const users = await res.json();
  show("READ 결과", norm(users));
  // 변환 전: Response { status: 200, body: ReadableStream }
  // 변환 후: [{ id: 1, name: "Kim" }, { id: 2, name: "Lee" }]
  // res.json() 후 users는 배열 / norm() → 키 순서 정렬 / show() → 화면 출력
});

// 5. UPDATE (수정) — PUT
document.querySelector("#btn-update").addEventListener("click", async () => {
  const res = await fetch(`${API}/1`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Jane" })
  });
  show("UPDATE 결과", norm(await res.json()));
  // 변환 전: Response { status: 200, body: ReadableStream }
  // 변환 후: { id: 1, name: "Jane" }
  // res.json() → JSON 파싱 / norm() → 키 순서 정렬(id, name) / show() → 화면 출력
});

// 6. DELETE (삭제) — DELETE
document.querySelector("#btn-delete").addEventListener("click", async () => {
  await fetch(`${API}/1`, { method: "DELETE" });
  show("DELETE 결과", "1번 사용자 삭제됨");
});