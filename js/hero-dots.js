/**
 * hero-dots.js — uniform dot grid with cursor spotlight (homepage hero).
 */
(function () {
  function init() {
    const hero = document.querySelector("section.bm-intro-section.hero");
    const canvas = document.getElementById("heroDotsCanvas");
    if (!hero || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cfg = {
      spacing: 32,
      baseRadius: 1.4,
      maxRadius: 4.6,
      glowRadius: 88,
      spotlightScale: 0.82,
      haloScale: 2,
      baseAlpha: 0.32,
      maxAlpha: 0.92,
      smooth: 0.14,
    };

    let W = 0;
    let H = 0;
    let dots = [];
    let raf = 0;
    let running = false;
    const mouse = { x: -9999, y: -9999, active: false };
    const pointer = { x: -9999, y: -9999 };

    function buildGrid() {
      dots = [];
      const cols = Math.floor(W / cfg.spacing) + 1;
      const rows = Math.floor(H / cfg.spacing) + 1;
      const offsetX = (W - (cols - 1) * cfg.spacing) / 2;
      const offsetY = (H - (rows - 1) * cfg.spacing) / 2;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          dots.push({
            x: offsetX + col * cfg.spacing,
            y: offsetY + row * cfg.spacing,
          });
        }
      }
    }

    function resize() {
      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
      if (reducedMotion) draw();
    }

    function setPointer(clientX, clientY) {
      const rect = hero.getBoundingClientRect();
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;
      mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= W && mouse.y <= H;
    }

    function clearPointer() {
      mouse.active = false;
    }

    function drawSpotlight() {
      if (!mouse.active) return;
      const grd = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        cfg.glowRadius * cfg.spotlightScale
      );
      grd.addColorStop(0, "rgba(212,184,106,0.09)");
      grd.addColorStop(0.5, "rgba(212,184,106,0.03)");
      grd.addColorStop(1, "rgba(212,184,106,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      if (mouse.active && !reducedMotion) {
        pointer.x += (mouse.x - pointer.x) * cfg.smooth;
        pointer.y += (mouse.y - pointer.y) * cfg.smooth;
      } else if (mouse.active) {
        pointer.x = mouse.x;
        pointer.y = mouse.y;
      }

      drawSpotlight();

      for (let i = 0; i < dots.length; i += 1) {
        const d = dots[i];
        let radius = cfg.baseRadius;
        let alpha = cfg.baseAlpha;
        let glow = 0;

        if (mouse.active) {
          const dist = Math.hypot(d.x - pointer.x, d.y - pointer.y);
          if (dist < cfg.glowRadius) {
            const t = 1 - dist / cfg.glowRadius;
            glow = t * t * (3 - 2 * t);
            radius = cfg.baseRadius + glow * (cfg.maxRadius - cfg.baseRadius);
            alpha = cfg.baseAlpha + glow * (cfg.maxAlpha - cfg.baseAlpha);
          }
        }

        if (glow > 0.12) {
          ctx.beginPath();
          ctx.arc(d.x, d.y, radius * cfg.haloScale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212,184,106,${(glow * 0.18).toFixed(3)})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        const r = 218 + glow * 37;
        const g = 198 + glow * 57;
        const b = 145 + glow * 55;
        ctx.fillStyle = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha.toFixed(3)})`;
        ctx.fill();
      }

      if (running) raf = requestAnimationFrame(draw);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    hero.addEventListener("mousemove", (e) => setPointer(e.clientX, e.clientY));
    hero.addEventListener("mouseleave", clearPointer);
    hero.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: true }
    );
    hero.addEventListener("touchend", clearPointer);

    window.addEventListener("resize", resize);

    if ("ResizeObserver" in window) {
      new ResizeObserver(resize).observe(hero);
    }

    resize();
    start();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
