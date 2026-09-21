// Qualgraph hero animation: signals resolving into a brief.
export function initSignalGraph() {
  const root = document.documentElement;
  // ── hero graph animation ─────────────────────────────────────────────────
  const canvas = document.getElementById('graph') as HTMLCanvasElement | null;
  const panel = document.getElementById('panel');
  if (canvas && panel) {
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const labels = ['test', 'telemetry', 'review', 'coverage', 'trace', 'log'];
    let W = 0, H = 0;
    let signals: { x: number; y: number; label: string; seed: number }[] = [];
    let brief = { x: 0, y: 0 };

    const layout = () => {
      const r = panel.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      signals = labels.map((lb, i) => {
        const n = labels.length;
        return {
          x: W * (0.14 + 0.16 * (i % 2)),
          y: H * (0.14 + (0.72 * i) / (n - 1)),
          label: lb,
          seed: i * 1.7,
        };
      });
      brief = { x: W * 0.78, y: H * 0.5 };
    };
    layout();
    window.addEventListener('resize', layout);

    const cssVar = (name: string) => getComputedStyle(root).getPropertyValue(name).trim();
    const accent = () => cssVar('--accent') || '#35D0A5';
    const inkColor = () => getComputedStyle(document.body).color;

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();

    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      const ac = accent();
      const cycle = reduceMotion ? 1 : (t % 4.5) / 4.5;

      signals.forEach((s, i) => {
        const prog = reduceMotion ? 1 : Math.max(0, Math.min(1, (cycle - i * 0.06) * 2.4));
        const mx = s.x + (brief.x - s.x) * prog;
        const my = s.y + (brief.y - s.y) * prog;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(mx, my);
        ctx.strokeStyle = ac;
        ctx.globalAlpha = 0.18 + 0.2 * prog;
        ctx.lineWidth = 1;
        ctx.stroke();
        if (!reduceMotion && prog > 0 && prog < 1) {
          ctx.beginPath();
          ctx.arc(mx, my, 2.4, 0, Math.PI * 2);
          ctx.fillStyle = ac; ctx.globalAlpha = 0.9; ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      signals.forEach((s) => {
        const drift = reduceMotion ? 0 : Math.sin(t * 0.8 + s.seed) * 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y + drift, 4, 0, Math.PI * 2);
        ctx.fillStyle = inkColor(); ctx.globalAlpha = 0.55; ctx.fill();
        ctx.globalAlpha = 1;
        ctx.font = '10px ui-monospace, Menlo, monospace';
        ctx.fillStyle = inkColor(); ctx.globalAlpha = 0.5;
        ctx.textAlign = 'right';
        ctx.fillText(s.label, s.x - 9, s.y + drift + 3.5);
        ctx.globalAlpha = 1;
      });

      const resolve = reduceMotion ? 1 : Math.max(0, (cycle - 0.62) / 0.38);
      const pulse = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2);
      const glowR = 16 + resolve * 12 + pulse * 3 * resolve;
      const grad = ctx.createRadialGradient(brief.x, brief.y, 2, brief.x, brief.y, glowR);
      grad.addColorStop(0, ac);
      grad.addColorStop(1, 'rgba(53,208,165,0)');
      ctx.globalAlpha = 0.15 + 0.45 * resolve;
      ctx.beginPath(); ctx.arc(brief.x, brief.y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath(); ctx.arc(brief.x, brief.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = ac; ctx.fill();
      if (resolve > 0.5) {
        ctx.strokeStyle = cssVar('--bg') || '#171F29';
        ctx.lineWidth = 1.8; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(brief.x - 4, brief.y);
        ctx.lineTo(brief.x - 1, brief.y + 3.2);
        ctx.lineTo(brief.x + 4.5, brief.y - 3);
        ctx.stroke();
      }
      ctx.font = '10px ui-monospace, Menlo, monospace';
      ctx.fillStyle = ac; ctx.textAlign = 'center';
      ctx.fillText('brief', brief.x, brief.y + 26);

      if (!reduceMotion) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
}
