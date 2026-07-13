function MergeConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="merge-overlay" onClick={onCancel}>
      <div className="merge-modal" onClick={(e) => e.stopPropagation()}>
        <p>텍스트가 도형과 겹쳤어요.</p>
        <p>텍스트를 도형에 포함시킬까요?</p>
        <div className="merge-actions">
          <button className="merge-cancel" onClick={onCancel}>
            아니요
          </button>
          <button className="merge-confirm" onClick={onConfirm}>
            포함시키기
          </button>
        </div>
      </div>
    </div>
  );
}

export default MergeConfirmModal;
