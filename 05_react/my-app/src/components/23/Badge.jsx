// type이 'new'면 초록, 아니면 빨강 (삼항 연산자)
const Badge = ({ text, type }) => {   // props 2개: text(글자), type(종류)
  const color = type === 'new' ? 'green' : 'crimson'   // 삼항: type이 'new'와 같으면 'green', 아니면 'crimson' → color에 저장
  return <span style={{ background: color, color: '#fff' }}>{text}</span>   // style={{ }} = JSX 인라인 스타일(객체), 배경색=위 color 값, 글자색=흰색
}
export default Badge   // 다른 파일에서 쓰도록 내보냄