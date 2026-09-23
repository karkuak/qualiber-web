// Site nav: persisted light/dark toggle + the mobile menu.
export function initNav() {
  const root = document.documentElement;

  document.getElementById('themeBtn')?.addEventListener('click', () => {
    let cur = root.getAttribute('data-theme');
    if (!cur) cur = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('qb-theme', next); } catch (e) {}
  });

  const btn = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!btn || !menu) return;

  const setOpen = (open: boolean, returnFocus = false) => {
    btn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    if (!open && returnFocus) btn.focus();
  };
  btn.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) setOpen(false, true);
  });
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !(e.target as HTMLElement).closest('.nav')) setOpen(false);
  });
  // Leaving the mobile breakpoint: make sure the panel isn't left open.
  matchMedia('(min-width: 1101px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
}
