import { HEADING_OPTIONS } from '../utils/textEffects';

const HEADING_LABELS = {
  none: '없음',
  h1: 'H1',
  h2: 'H2',
  h3: 'H3',
  h4: 'H4',
};

function TextEffectFields({
  fontSize,
  bold,
  italic,
  highlight,
  highlightColor,
  heading,
  onFontSize,
  onBold,
  onItalic,
  onHighlight,
  onHighlightColor,
  onHeading,
}) {
  return (
    <>
      <label className="property-field">
        헤딩
        <select value={heading} onChange={(e) => onHeading(e.target.value)}>
          {HEADING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {HEADING_LABELS[opt]}
            </option>
          ))}
        </select>
      </label>

      <label className="property-field">
        글자 크기
        <input
          type="number"
          min="8"
          value={fontSize}
          disabled={heading !== 'none'}
          onChange={(e) => onFontSize(Number(e.target.value))}
        />
      </label>

      <div className="property-field">
        효과
        <div className="text-effect-toggle-row">
          <button
            type="button"
            className={`text-effect-toggle${bold ? ' active' : ''}`}
            onClick={() => onBold(!bold)}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={`text-effect-toggle${italic ? ' active' : ''}`}
            onClick={() => onItalic(!italic)}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={`text-effect-toggle${highlight ? ' active' : ''}`}
            onClick={() => onHighlight(!highlight)}
          >
            H
          </button>
          {highlight && (
            <input
              type="color"
              className="text-effect-highlight-color"
              value={highlightColor}
              onChange={(e) => onHighlightColor(e.target.value)}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default TextEffectFields;
