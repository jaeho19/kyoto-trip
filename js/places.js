// Places tab — category + day filtering + jump-to-place from the map tab.
// Render stays pure; this wires the DOM. AND semantics across the two groups.

let resetFilters = null;   // set on init, used by gotoPlace()

export function initPlacesFilter() {
  const panel = document.getElementById('panel-places');
  if (!panel) return;

  const cards = [...panel.querySelectorAll('.card')];
  const countEl = panel.querySelector('#filter-count');
  const emptyEl = panel.querySelector('#places-empty');
  let state = { day: 'all', cat: 'all' };

  const apply = () => {
    let visible = 0;
    cards.forEach(card => {
      const okCat = state.cat === 'all' || card.dataset.cat === state.cat;
      const okDay = state.day === 'all' || (card.dataset.days || '').split(' ').includes(state.day);
      const show = okCat && okDay;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (countEl) countEl.textContent = `${visible}곳 표시`;
    if (emptyEl) emptyEl.hidden = visible !== 0;
  };

  panel.querySelectorAll('.f-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const group = chip.dataset.filter;            // 'day' | 'cat'
      state = { ...state, [group]: chip.dataset.val };
      panel.querySelectorAll(`.f-chip[data-filter="${group}"]`)
        .forEach(c => c.classList.toggle('active', c === chip));
      apply();
    });
  });

  resetFilters = () => {
    state = { day: 'all', cat: 'all' };
    panel.querySelectorAll('.f-chip')
      .forEach(c => c.classList.toggle('active', c.classList.contains('all')));
    apply();
  };

  apply();
}

// called when arriving from a map route stop — show all, scroll to + flash the card
export function gotoPlace(key) {
  const panel = document.getElementById('panel-places');
  if (!panel) return;
  if (resetFilters) resetFilters();
  const sel = (window.CSS && CSS.escape) ? CSS.escape(key) : key;
  const card = panel.querySelector(`.card[data-key="${sel}"]`);
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.remove('flash');
  void card.offsetWidth;            // restart the animation if re-triggered
  card.classList.add('flash');
}
