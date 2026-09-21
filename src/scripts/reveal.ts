// Fade-in on scroll for .reveal elements (respects reduced motion).
export function initReveal() {
  // ── scroll reveal ────────────────────────────────────────────────────────
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach((r) => r.classList.add('in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      },
      { threshold: 0.16 },
    );
    reveals.forEach((r) => io.observe(r));
  }
}
