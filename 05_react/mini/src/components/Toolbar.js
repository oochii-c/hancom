function Toolbar({ onAddElement }) {
  return (
    <aside className="toolbar-panel">
      <h2>요소 추가</h2>
      <button className="toolbar-item" onClick={() => onAddElement('box')}>
        <span className="toolbar-icon toolbar-icon--box" />
        박스
      </button>
      <button className="toolbar-item" onClick={() => onAddElement('circle')}>
        <span className="toolbar-icon toolbar-icon--circle" />
        원
      </button>
      <button className="toolbar-item" onClick={() => onAddElement('text')}>
        <span className="toolbar-icon toolbar-icon--text">T</span>
        텍스트
      </button>
    </aside>
  );
}

export default Toolbar;
