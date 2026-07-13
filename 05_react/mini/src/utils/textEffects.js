export const HEADING_SIZES = {
  none: null,
  h1: 32,
  h2: 26,
  h3: 22,
  h4: 18,
};

export const HEADING_OPTIONS = ['none', 'h1', 'h2', 'h3', 'h4'];

export function resolvedFontSize(heading, fallbackSize) {
  const preset = HEADING_SIZES[heading];
  return preset != null ? preset : fallbackSize;
}

export function resolvedFontWeight(bold, heading) {
  return bold || heading !== 'none' ? 700 : 400;
}
