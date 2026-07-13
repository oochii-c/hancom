import { useRef } from 'react';
import { resolvedFontSize, resolvedFontWeight } from '../utils/textEffects';

function Canvas({ elements, selectedId, canvasSize, onSelect, onUpdateElement, onDragEnd }) {
  const dragState = useRef(null);

  const handleElementMouseDown = (e, el) => {
    e.stopPropagation();
    onSelect(el.id);
    dragState.current = {
      mode: 'move',
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e, el) => {
    e.stopPropagation();
    onSelect(el.id);
    dragState.current = {
      mode: 'resize',
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      origWidth: el.width,
      origHeight: el.height,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const drag = dragState.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (drag.mode === 'move') {
      const x = Math.max(0, drag.origX + dx);
      const y = Math.max(0, drag.origY + dy);
      drag.lastX = x;
      drag.lastY = y;
      onUpdateElement(drag.id, { x, y });
    } else if (drag.mode === 'resize') {
      onUpdateElement(drag.id, {
        width: Math.max(20, drag.origWidth + dx),
        height: Math.max(20, drag.origHeight + dy),
      });
    }
  };

  const handleMouseUp = () => {
    const drag = dragState.current;
    dragState.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    if (drag && drag.mode === 'move') {
      const x = drag.lastX ?? drag.origX;
      const y = drag.lastY ?? drag.origY;
      onDragEnd(drag.id, { x, y });
    }
  };

  return (
    <div className="canvas-scroll">
      <div
        className="canvas"
        style={{ width: canvasSize.width, height: canvasSize.height }}
        onMouseDown={() => onSelect(null)}
      >
        {elements.map((el) => {
          const border =
            el.borderWidth > 0 ? `${el.borderWidth}px solid ${el.borderColor}` : 'none';

          if (el.type === 'text') {
            return (
              <div
                key={el.id}
                className={`canvas-element canvas-element--text${
                  el.id === selectedId ? ' canvas-element--selected' : ''
                }`}
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  color: el.color,
                  fontSize: resolvedFontSize(el.heading, el.fontSize),
                  fontWeight: resolvedFontWeight(el.bold, el.heading),
                  fontStyle: el.italic ? 'italic' : 'normal',
                  backgroundColor: el.highlight ? el.highlightColor : 'transparent',
                  opacity: el.opacity,
                  border,
                  borderRadius: el.borderRadius,
                }}
                onMouseDown={(e) => handleElementMouseDown(e, el)}
              >
                {el.text}
                {el.id === selectedId && (
                  <span
                    className="canvas-resize-handle"
                    onMouseDown={(e) => handleResizeMouseDown(e, el)}
                  />
                )}
              </div>
            );
          }
          return (
            <div
              key={el.id}
              className={`canvas-element${el.id === selectedId ? ' canvas-element--selected' : ''}`}
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                backgroundColor: el.color,
                opacity: el.opacity,
                border,
                borderRadius: el.type === 'circle' ? '50%' : el.borderRadius,
              }}
              onMouseDown={(e) => handleElementMouseDown(e, el)}
            >
              {el.text && (
                <span
                  className="canvas-element-label"
                  style={{
                    color: el.textColor,
                    fontSize: resolvedFontSize(el.textHeading, el.textFontSize),
                    fontWeight: resolvedFontWeight(el.textBold, el.textHeading),
                    fontStyle: el.textItalic ? 'italic' : 'normal',
                    backgroundColor: el.textHighlight ? el.textHighlightColor : 'transparent',
                  }}
                >
                  {el.text}
                </span>
              )}
              {el.id === selectedId && (
                <span
                  className="canvas-resize-handle"
                  onMouseDown={(e) => handleResizeMouseDown(e, el)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Canvas;
