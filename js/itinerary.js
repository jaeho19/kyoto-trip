// Itinerary tab — day-pill smooth scroll + scrollspy highlight.

function setActivePill(panel, day) {
  panel.querySelectorAll('[data-day-jump]').forEach(p =>
    p.classList.toggle('active', p.dataset.dayJump === String(day)));
}

export function initItinerary() {
  const panel = document.getElementById('panel-itinerary');
  if (!panel) return;

  panel.querySelectorAll('[data-day-jump]').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const target = panel.querySelector(`#day-${pill.dataset.dayJump}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActivePill(panel, pill.dataset.dayJump);
    });
  });

  // highlight the pill of the day currently in view
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) setActivePill(panel, en.target.id.replace('day-', ''));
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    panel.querySelectorAll('.day-card').forEach(c => io.observe(c));
  }

  setActivePill(panel, 1);
}
