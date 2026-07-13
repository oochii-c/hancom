export const DISPLAY_PRESETS = [
  { label: 'Desktop (1920 × 1080)', width: 1920, height: 1080 },
  { label: 'Laptop (1440 × 900)', width: 1440, height: 900 },
  { label: 'Tablet (768 × 1024)', width: 768, height: 1024 },
  { label: 'Mobile (375 × 812)', width: 375, height: 812 },
  { label: '커스텀', width: null, height: null },
];

function DisplaySizeControl({ canvasSize, onChange }) {
  const isCustom = canvasSize.label === '커스텀';

  const handlePresetChange = (e) => {
    const preset = DISPLAY_PRESETS.find((p) => p.label === e.target.value);
    if (!preset) return;
    if (preset.label === '커스텀') {
      onChange({ label: '커스텀', width: canvasSize.width, height: canvasSize.height });
    } else {
      onChange({ label: preset.label, width: preset.width, height: preset.height });
    }
  };

  return (
    <div className="display-size-control">
      <select value={canvasSize.label} onChange={handlePresetChange}>
        {DISPLAY_PRESETS.map((p) => (
          <option key={p.label} value={p.label}>
            {p.label}
          </option>
        ))}
      </select>
      {isCustom && (
        <>
          <input
            type="number"
            className="display-size-input"
            value={canvasSize.width}
            min="100"
            onChange={(e) =>
              onChange({ ...canvasSize, width: Number(e.target.value) })
            }
          />
          <span className="display-size-x">×</span>
          <input
            type="number"
            className="display-size-input"
            value={canvasSize.height}
            min="100"
            onChange={(e) =>
              onChange({ ...canvasSize, height: Number(e.target.value) })
            }
          />
        </>
      )}
    </div>
  );
}

export default DisplaySizeControl;
