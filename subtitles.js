function labelForTime(t, segments = []) {
  if (!Number.isFinite(t)) return '';
  const seg = segments.find(s => t >= s.start && t < s.end);
  return seg ? seg.text : '';
}

export function createSubtitles({ segments = [] } = {}) {
  const el = document.getElementById('subtitles');
  let lastText = '';
  return {
    update(time = 0) {
      if (!el) return;
      const text = labelForTime(Math.max(0, time), segments);
      if (text !== lastText) {
        el.textContent = text;
        lastText = text;
      }
      el.style.opacity = text ? '1' : '0';
    }
  };
}
