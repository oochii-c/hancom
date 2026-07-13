import { useState } from 'react';

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function HistoryEntry({ entry }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(entry.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="history-entry">
      <div className="history-entry-header">
        <span className="history-entry-format">{entry.format.toUpperCase()}</span>
        <span className="history-entry-time">{formatTime(entry.timestamp)}</span>
        <button className="history-entry-copy" onClick={handleCopy}>
          {copied ? '복사됨!' : '복사'}
        </button>
      </div>
      <pre className="history-entry-code">{entry.code}</pre>
    </div>
  );
}

function HistoryPanel({ history, onClose }) {
  return (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="history-modal-header">
          <h2>내보내기 히스토리</h2>
          <button className="history-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="history-list">
          {history.length === 0 ? (
            <p className="history-empty">아직 내보낸 코드가 없어요. 코드를 복사하면 여기에 기록돼요.</p>
          ) : (
            history.map((entry) => <HistoryEntry key={entry.id} entry={entry} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPanel;
