// Inline SVG icons (Lucide-style line icons). External deps: 0.
// Design Ref: §3 icons.js, ASSETS.md "인라인 SVG 그대로 사용 권장"

const SVG = {
  // generic
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14',
  calendar: 'M8 2v3M16 2v3M3 8h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 16v-5M12 8h.01',
  pin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  // categories
  sight: 'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6',          // landmark
  temple: 'M12 2 3 7h18L12 2ZM5 7v3h14V7M6 10v8M18 10v8M4 21h16M9 21v-5h6v5', // shrine/temple
  food: 'M4 3v7a3 3 0 0 0 3 3v8M7 3v6M18 3c-2 0-3 2-3 5s1 4 3 4v9',          // fork+spoon
  hotel: 'M3 21V7h18v14M3 13h18M7 7V4h10v3M8 17h2M14 17h2',                  // hotel bed/building
  transport: 'M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10M4 16h16M4 16v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M17 16v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M7 8h10M7 12h10', // train
  campus: 'M3 9 12 4l9 5-9 5-9-5ZM7 11v5c0 1 2.5 2 5 2s5-1 5-2v-5M21 9v6', // graduation cap
  clock: 'M12 7v5l3 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z',
  check: 'M20 6 9 17l-5-5',
};

// category -> color var + icon key + label
export const CAT = {
  sight:     { color: 'var(--cat-sight)',     icon: 'sight',     label: '명소' },
  temple:    { color: 'var(--cat-temple)',    icon: 'temple',    label: '사찰·신사' },
  food:      { color: 'var(--cat-food)',      icon: 'food',      label: '식당' },
  hotel:     { color: 'var(--cat-hotel)',     icon: 'hotel',     label: '숙소' },
  transport: { color: 'var(--cat-transport)', icon: 'transport', label: '교통' },
  campus:    { color: 'var(--cat-campus)',    icon: 'campus',    label: '학교' },
};

// icon(name, size?) -> inline svg string
export function icon(name, size = 20) {
  const d = SVG[name] || SVG.pin;
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">${d.split('M').filter(Boolean).map(s => `<path d="M${s.trim()}"/>`).join('')}</svg>`;
}

export function catMeta(cat) {
  return CAT[cat] || { color: 'var(--accent)', icon: 'pin', label: cat };
}
