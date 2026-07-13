import { useState, useCallback, useRef } from 'react';
import './App.css';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import ExportPanel from './components/ExportPanel';
import HistoryPanel from './components/HistoryPanel';
import DisplaySizeControl from './components/DisplaySizeControl';
import MergeConfirmModal from './components/MergeConfirmModal';
import { rectsOverlap, getDefaultSize, findFreePosition } from './utils/layout';

let nextId = 1;
let nextHistoryId = 1;

function createElement(type, position, size) {
  const base = {
    id: nextId++,
    type,
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
    opacity: 1,
    borderWidth: 0,
    borderColor: '#000000',
  };
  if (type === 'text') {
    return {
      ...base,
      text: '텍스트',
      fontSize: 16,
      color: '#222222',
      borderRadius: 0,
      bold: false,
      italic: false,
      highlight: false,
      highlightColor: '#fff176',
      heading: 'none',
    };
  }
  return {
    ...base,
    color: '#4f8cff',
    text: '',
    textColor: '#ffffff',
    textFontSize: 16,
    borderRadius: type === 'circle' ? 9999 : 4,
    textBold: false,
    textItalic: false,
    textHighlight: false,
    textHighlightColor: '#fff176',
    textHeading: 'none',
  };
}

function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [exportHistory, setExportHistory] = useState([]);
  const [canvasSize, setCanvasSize] = useState({
    label: 'Desktop (1920 × 1080)',
    width: 1920,
    height: 1080,
  });
  const [mergeRequest, setMergeRequest] = useState(null);

  const elementsRef = useRef(elements);

  const setElementsSynced = useCallback((updater) => {
    setElements((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      elementsRef.current = next;
      return next;
    });
  }, []);

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  const handleAddElement = useCallback(
    (type) => {
      const size = getDefaultSize(type);
      const position = findFreePosition(elements, size, canvasSize);
      const el = createElement(type, position, size);
      setElementsSynced((prev) => [...prev, el]);
      setSelectedId(el.id);
    },
    [elements, canvasSize, setElementsSynced]
  );

  const handleUpdateElement = useCallback(
    (id, patch) => {
      setElementsSynced((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...patch } : el))
      );
    },
    [setElementsSynced]
  );

  const handleDeleteElement = useCallback(
    (id) => {
      setElementsSynced((prev) => prev.filter((el) => el.id !== id));
      setSelectedId((cur) => (cur === id ? null : cur));
    },
    [setElementsSynced]
  );

  const handleDragEnd = useCallback((id, finalPosition) => {
    const els = elementsRef.current;
    const found = els.find((el) => el.id === id);
    if (!found) return;
    const moved = { ...found, ...finalPosition };
    const overlapping = els.find(
      (el) =>
        el.id !== id &&
        rectsOverlap(moved, el) &&
        ((moved.type === 'text' && el.type !== 'text') ||
          (moved.type !== 'text' && el.type === 'text'))
    );
    if (!overlapping) return;
    const textEl = moved.type === 'text' ? moved : overlapping;
    const shapeEl = moved.type === 'text' ? overlapping : moved;
    setMergeRequest({ textId: textEl.id, shapeId: shapeEl.id });
  }, []);

  const handleMergeConfirm = useCallback(() => {
    if (!mergeRequest) return;
    const { textId, shapeId } = mergeRequest;
    const textEl = elements.find((el) => el.id === textId);
    if (!textEl) {
      setMergeRequest(null);
      return;
    }
    setElementsSynced((prev) =>
      prev
        .filter((el) => el.id !== textId)
        .map((el) =>
          el.id === shapeId
            ? {
                ...el,
                text: textEl.text,
                textColor: textEl.color,
                textFontSize: textEl.fontSize,
                textBold: textEl.bold,
                textItalic: textEl.italic,
                textHighlight: textEl.highlight,
                textHighlightColor: textEl.highlightColor,
                textHeading: textEl.heading,
              }
            : el
        )
    );
    setSelectedId(shapeId);
    setMergeRequest(null);
  }, [mergeRequest, elements, setElementsSynced]);

  const handleMergeCancel = useCallback(() => {
    setMergeRequest(null);
  }, []);

  const handleExportCopy = useCallback((format, code) => {
    setExportHistory((prev) => [
      { id: nextHistoryId++, format, code, timestamp: Date.now() },
      ...prev,
    ]);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Visual Builder</h1>
        <DisplaySizeControl canvasSize={canvasSize} onChange={setCanvasSize} />
        <button className="history-btn" onClick={() => setHistoryOpen(true)}>
          히스토리
        </button>
        <button className="export-btn" onClick={() => setExportOpen(true)}>
          코드로 내보내기
        </button>
      </header>
      <div className="app-body">
        <Toolbar onAddElement={handleAddElement} />
        <Canvas
          elements={elements}
          selectedId={selectedId}
          canvasSize={canvasSize}
          onSelect={setSelectedId}
          onUpdateElement={handleUpdateElement}
          onDragEnd={handleDragEnd}
        />
        <PropertyPanel
          element={selectedElement}
          onUpdate={handleUpdateElement}
          onDelete={handleDeleteElement}
        />
      </div>
      {exportOpen && (
        <ExportPanel
          elements={elements}
          onClose={() => setExportOpen(false)}
          onCopy={handleExportCopy}
        />
      )}
      {historyOpen && (
        <HistoryPanel history={exportHistory} onClose={() => setHistoryOpen(false)} />
      )}
      {mergeRequest && (
        <MergeConfirmModal onConfirm={handleMergeConfirm} onCancel={handleMergeCancel} />
      )}
    </div>
  );
}

export default App;
