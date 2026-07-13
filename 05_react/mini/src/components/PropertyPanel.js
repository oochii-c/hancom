import { useEffect, useState } from 'react';
import TextEffectFields from './TextEffectFields';

function PropertyPanel({ element, onUpdate, onDelete }) {
  const [textSectionOpen, setTextSectionOpen] = useState(true);

  useEffect(() => {
    setTextSectionOpen(true);
  }, [element?.id]);

  if (!element) {
    return (
      <aside className="property-panel">
        <h2>속성</h2>
        <p className="property-empty">캔버스에서 요소를 선택하세요.</p>
      </aside>
    );
  }

  const handleChange = (key, value) => {
    onUpdate(element.id, { [key]: value });
  };

  const isText = element.type === 'text';
  const isCircle = element.type === 'circle';
  const hasMergedText = !isText && element.text;

  return (
    <aside className="property-panel">
      <h2>속성</h2>

      {isText && (
        <label className="property-field">
          내용
          <input
            type="text"
            value={element.text}
            onChange={(e) => handleChange('text', e.target.value)}
          />
        </label>
      )}

      <label className="property-field">
        {isText ? '글자 색' : '색상'}
        <input
          type="color"
          value={element.color}
          onChange={(e) => handleChange('color', e.target.value)}
        />
      </label>

      {isText && (
        <TextEffectFields
          fontSize={element.fontSize}
          bold={element.bold}
          italic={element.italic}
          highlight={element.highlight}
          highlightColor={element.highlightColor}
          heading={element.heading}
          onFontSize={(v) => handleChange('fontSize', v)}
          onBold={(v) => handleChange('bold', v)}
          onItalic={(v) => handleChange('italic', v)}
          onHighlight={(v) => handleChange('highlight', v)}
          onHighlightColor={(v) => handleChange('highlightColor', v)}
          onHeading={(v) => handleChange('heading', v)}
        />
      )}

      <label className="property-field">
        투명도
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={element.opacity}
          onChange={(e) => handleChange('opacity', Number(e.target.value))}
        />
      </label>

      <label className="property-field">
        외곽선 두께
        <input
          type="number"
          min="0"
          value={element.borderWidth}
          onChange={(e) => handleChange('borderWidth', Number(e.target.value))}
        />
      </label>
      <label className="property-field">
        외곽선 색상
        <input
          type="color"
          value={element.borderColor}
          onChange={(e) => handleChange('borderColor', e.target.value)}
        />
      </label>

      {!isCircle && (
        <label className="property-field">
          모서리 굴절도
          <input
            type="number"
            min="0"
            value={element.borderRadius}
            onChange={(e) => handleChange('borderRadius', Number(e.target.value))}
          />
        </label>
      )}

      <label className="property-field">
        X
        <input
          type="number"
          value={Math.round(element.x)}
          onChange={(e) => handleChange('x', Number(e.target.value))}
        />
      </label>
      <label className="property-field">
        Y
        <input
          type="number"
          value={Math.round(element.y)}
          onChange={(e) => handleChange('y', Number(e.target.value))}
        />
      </label>
      <label className="property-field">
        너비
        <input
          type="number"
          value={Math.round(element.width)}
          onChange={(e) => handleChange('width', Number(e.target.value))}
        />
      </label>
      <label className="property-field">
        높이
        <input
          type="number"
          value={Math.round(element.height)}
          onChange={(e) => handleChange('height', Number(e.target.value))}
        />
      </label>

      {hasMergedText && (
        <div className="property-text-section">
          <div
            className="property-text-header"
            onClick={() => setTextSectionOpen((open) => !open)}
          >
            <span className={`property-text-chevron${textSectionOpen ? ' property-text-chevron--open' : ''}`}>
              ▸
            </span>
            <span className="property-text-title">포함된 텍스트</span>
            <button
              className="property-detach"
              onClick={(e) => {
                e.stopPropagation();
                handleChange('text', '');
              }}
            >
              분리
            </button>
          </div>
          {textSectionOpen && (
            <div className="property-text-body">
              <label className="property-field">
                텍스트 내용
                <input
                  type="text"
                  value={element.text}
                  onChange={(e) => handleChange('text', e.target.value)}
                />
              </label>
              <label className="property-field">
                텍스트 색상
                <input
                  type="color"
                  value={element.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                />
              </label>
              <TextEffectFields
                fontSize={element.textFontSize}
                bold={element.textBold}
                italic={element.textItalic}
                highlight={element.textHighlight}
                highlightColor={element.textHighlightColor}
                heading={element.textHeading}
                onFontSize={(v) => handleChange('textFontSize', v)}
                onBold={(v) => handleChange('textBold', v)}
                onItalic={(v) => handleChange('textItalic', v)}
                onHighlight={(v) => handleChange('textHighlight', v)}
                onHighlightColor={(v) => handleChange('textHighlightColor', v)}
                onHeading={(v) => handleChange('textHeading', v)}
              />
            </div>
          )}
        </div>
      )}

      <button className="property-delete" onClick={() => onDelete(element.id)}>
        삭제
      </button>
    </aside>
  );
}

export default PropertyPanel;
