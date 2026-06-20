// Hash router + tab switching. Design Ref: §5, FR-1.
const TABS = ['itinerary', 'forum', 'places', 'map', 'info'];

export function initRouter(onChange) {
  const go = () => {
    const hash = (location.hash || '#itinerary').slice(1);
    const tab = TABS.includes(hash) ? hash : 'itinerary';
    document.querySelectorAll('.panel').forEach(p =>
      p.classList.toggle('active', p.id === `panel-${tab}`));
    document.querySelectorAll('.tabbar a').forEach(a =>
      a.classList.toggle('active', a.dataset.tab === tab));
    onChange(tab);
  };
  window.addEventListener('hashchange', go);
  go();
}
