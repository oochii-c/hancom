export function rectsOverlap(a, b) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

export function getDefaultSize(type) {
  if (type === 'text') {
    return { width: 160, height: 40 };
  }
  return { width: 120, height: 120 };
}

export function findFreePosition(elements, size, canvasSize) {
  const step = 20;
  const margin = 20;
  const maxX = Math.max(margin, canvasSize.width - size.width - margin);
  const maxY = Math.max(margin, canvasSize.height - size.height - margin);

  for (let y = margin; y <= maxY; y += step) {
    for (let x = margin; x <= maxX; x += step) {
      const candidate = { x, y, width: size.width, height: size.height };
      const collides = elements.some((el) => rectsOverlap(candidate, el));
      if (!collides) {
        return { x, y };
      }
    }
  }
  return { x: margin, y: margin };
}
