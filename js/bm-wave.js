/**
 * bm-wave.js — animated ripple on the Brand Management intro wave.
 */
(function () {
  const pathMain = document.getElementById("bmWavePath");
  const pathGhost = document.getElementById("bmWavePathGhost");
  if (!pathMain) return;

  const W = 1440;
  const STEP = 6;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let phase = 0;
  let raf;
  let running = false;

  function waveY(x, t, amp) {
    const nx = x / W;
    const base =
      54 +
      Math.sin(nx * Math.PI) * 88 +
      Math.sin(nx * Math.PI * 2 + 0.6) * 22 +
      Math.cos(nx * Math.PI * 1.35) * 18;
    const ripple =
      Math.sin(x * 0.011 + t) * 14 * amp +
      Math.sin(x * 0.024 + t * 1.55) * 8 * amp +
      Math.sin(x * 0.007 + t * 0.75) * 18 * amp;
    return base + ripple;
  }

  function buildPath(t, amp) {
    let d = `M0,0 L${W},0 `;
    for (let x = W; x >= 0; x -= STEP) {
      d += `L${x},${waveY(x, t, amp).toFixed(2)} `;
    }
    return `${d}Z`;
  }

  function draw() {
    if (!running) return;
    phase += 0.028;
    pathMain.setAttribute("d", buildPath(phase, 1));
    if (pathGhost) pathGhost.setAttribute("d", buildPath(phase * 0.92 + 1.4, 0.65));
    raf = requestAnimationFrame(draw);
  }

  function start() {
    if (running || reducedMotion) return;
    running = true;
    raf = requestAnimationFrame(draw);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  pathMain.setAttribute("d", buildPath(0, 1));
  if (pathGhost) pathGhost.setAttribute("d", buildPath(1.4, 0.65));

  if (reducedMotion) return;

  const section = pathMain.closest(".bm-intro-section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) start();
        else stop();
      });
    },
    { threshold: 0.05 }
  );
  if (section) observer.observe(section);
  else start();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (section && section.getBoundingClientRect().bottom > 0) start();
  });
})();
