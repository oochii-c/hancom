import { useState } from 'react';
import { resolvedFontSize, resolvedFontWeight } from '../utils/textEffects';

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function shapeBorderRadius(el) {
  return el.type === 'circle' ? '50%' : `${Math.round(el.borderRadius)}px`;
}

function borderCss(el) {
  return el.borderWidth > 0 ? `${el.borderWidth}px solid ${el.borderColor}` : 'none';
}

function buildHtml(elements) {
  const body = elements
    .map((el) => {
      if (el.type === 'text') {
        const tag = el.heading !== 'none' ? el.heading : 'div';
        const style = [
          'position:absolute',
          `left:${Math.round(el.x)}px`,
          `top:${Math.round(el.y)}px`,
          `width:${Math.round(el.width)}px`,
          `height:${Math.round(el.height)}px`,
          `margin:0`,
          `color:${el.color}`,
          `font-size:${resolvedFontSize(el.heading, el.fontSize)}px`,
          `font-weight:${resolvedFontWeight(el.bold, el.heading)}`,
          `font-style:${el.italic ? 'italic' : 'normal'}`,
          `background-color:${el.highlight ? el.highlightColor : 'transparent'}`,
          `opacity:${el.opacity}`,
          `border:${borderCss(el)}`,
          `border-radius:${Math.round(el.borderRadius)}px`,
        ].join('; ');
        return `  <${tag} style="${style}">${escapeHtml(el.text)}</${tag}>`;
      }
      const style = [
        'position:absolute',
        `left:${Math.round(el.x)}px`,
        `top:${Math.round(el.y)}px`,
        `width:${Math.round(el.width)}px`,
        `height:${Math.round(el.height)}px`,
        `background-color:${el.color}`,
        `opacity:${el.opacity}`,
        `border:${borderCss(el)}`,
        `border-radius:${shapeBorderRadius(el)}`,
      ];
      if (el.text) {
        style.push('display:flex', 'align-items:center', 'justify-content:center');
      }
      if (!el.text) {
        return `  <div style="${style.join('; ')}"></div>`;
      }
      const labelStyle = [
        `color:${el.textColor}`,
        `font-size:${resolvedFontSize(el.textHeading, el.textFontSize)}px`,
        `font-weight:${resolvedFontWeight(el.textBold, el.textHeading)}`,
        `font-style:${el.textItalic ? 'italic' : 'normal'}`,
      ];
      if (el.textHighlight) {
        labelStyle.push(`background-color:${el.textHighlightColor}`);
      }
      return `  <div style="${style.join('; ')}"><span style="${labelStyle.join('; ')}">${escapeHtml(
        el.text
      )}</span></div>`;
    })
    .join('\n');
  return `<div style="position:relative;">\n${body}\n</div>`;
}

function styleObjectString(style) {
  return Object.entries(style)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? `'${v}'` : v}`)
    .join(', ');
}

function buildJsx(elements) {
  const body = elements
    .map((el) => {
      if (el.type === 'text') {
        const tag = el.heading !== 'none' ? el.heading : 'div';
        const style = {
          position: 'absolute',
          left: Math.round(el.x),
          top: Math.round(el.y),
          width: Math.round(el.width),
          height: Math.round(el.height),
          margin: 0,
          color: el.color,
          fontSize: resolvedFontSize(el.heading, el.fontSize),
          fontWeight: resolvedFontWeight(el.bold, el.heading),
          fontStyle: el.italic ? 'italic' : 'normal',
          backgroundColor: el.highlight ? el.highlightColor : 'transparent',
          opacity: el.opacity,
          border: borderCss(el),
          borderRadius: Math.round(el.borderRadius),
        };
        return `      <${tag} style={{ ${styleObjectString(style)} }}>${el.text}</${tag}>`;
      }
      const style = {
        position: 'absolute',
        left: Math.round(el.x),
        top: Math.round(el.y),
        width: Math.round(el.width),
        height: Math.round(el.height),
        backgroundColor: el.color,
        opacity: el.opacity,
        border: borderCss(el),
        borderRadius: el.type === 'circle' ? '50%' : Math.round(el.borderRadius),
      };
      if (!el.text) {
        return `      <div style={{ ${styleObjectString(style)} }} />`;
      }
      style.display = 'flex';
      style.alignItems = 'center';
      style.justifyContent = 'center';
      const labelStyle = {
        color: el.textColor,
        fontSize: resolvedFontSize(el.textHeading, el.textFontSize),
        fontWeight: resolvedFontWeight(el.textBold, el.textHeading),
        fontStyle: el.textItalic ? 'italic' : 'normal',
      };
      if (el.textHighlight) {
        labelStyle.backgroundColor = el.textHighlightColor;
      }
      return `      <div style={{ ${styleObjectString(style)} }}>\n        <span style={{ ${styleObjectString(
        labelStyle
      )} }}>${el.text}</span>\n      </div>`;
    })
    .join('\n');
  return `function GeneratedLayout() {\n  return (\n    <div style={{ position: 'relative' }}>\n${body}\n    </div>\n  );\n}`;
}

function ExportPanel({ elements, onClose, onCopy }) {
  const [format, setFormat] = useState('html');
  const [copied, setCopied] = useState(false);

  const code = format === 'html' ? buildHtml(elements) : buildJsx(elements);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    onCopy(format, code);
  };

  return (
    <div className="export-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-header">
          <div className="export-format-toggle">
            <button
              className={format === 'html' ? 'active' : ''}
              onClick={() => setFormat('html')}
            >
              HTML
            </button>
            <button
              className={format === 'jsx' ? 'active' : ''}
              onClick={() => setFormat('jsx')}
            >
              JSX
            </button>
          </div>
          <button className="export-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <pre className="export-code">{code}</pre>
        <button className="export-copy" onClick={handleCopy}>
          {copied ? '복사됨!' : '코드 복사'}
        </button>
      </div>
    </div>
  );
}

export default ExportPanel;
