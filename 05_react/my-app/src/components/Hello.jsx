import './Hello.css'        // 같은 폴더 CSS 가져옴

const Hello = () => {
  return (                  // 두 개를 한 번에 반환 — 태그 하나로 감싸기
    <div className="box">     {/* className = CSS 연결 고리 */}
      <h1>안녕!</h1>
      <p>반가워요 👋</p>
    </div>
  )
}
export default Hello