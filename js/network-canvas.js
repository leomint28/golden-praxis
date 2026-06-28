/**
 * network-canvas.js
 * Reusable distribution-network animation for dark sections.
 * Initialises every canvas marked with [data-network-canvas].
 */
(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initNetworkCanvas(canvas, opts) {
    const ctx = canvas.getContext("2d");
    const cfg = {
      linkDist: 140,
      nParticles: 65,
      hubRatio: 0.13,
      lineAlpha: 0.16,
      particleAlpha: 0.3,
      hubAlpha: 0.92,
      rippleInterval: 2800,
      speed: 0.38,
      ...opts,
    };

    let W, H, pts, raf;
    let lastRipple = 0;
    let running = false;
    const ripples = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initPts();
    }

    function initPts() {
      pts = Array.from({ length: cfg.nParticles }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * cfg.speed,
        vy: (Math.random() - 0.5) * cfg.speed,
        r: 1.4 + Math.random() * 2,
        hub: Math.random() < cfg.hubRatio,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function draw(ts) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      if (ts - lastRipple > cfg.rippleInterval) {
        const hubs = pts.filter((p) => p.hub);
        if (hubs.length) {
          const h = hubs[Math.floor(Math.random() * hubs.length)];
          ripples.push({ x: h.x, y: h.y, r: 0, life: 1 });
        }
        lastRipple = ts;
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 1.5;
        rp.life -= 0.009;
        if (rp.life <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212,184,106,${(rp.life * 0.45).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < cfg.linkDist) {
            const alpha = (1 - d / cfg.linkDist) * cfg.lineAlpha;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      const t = ts * 0.001;
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        if (p.hub) {
          const pulse = (Math.sin(t * 1.4 + p.phase) + 1) / 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + 3 + pulse * 8, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(212,184,106,${(0.35 * (1 - pulse)).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212,184,106,${cfg.hubAlpha})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${cfg.particleAlpha})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
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

    resize();
    window.addEventListener("resize", resize);

    if (reducedMotion) {
      draw(0);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start();
          else stop();
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas.parentElement);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (canvas.parentElement.getBoundingClientRect().height) start();
    });
  }

  document.querySelectorAll("[data-network-canvas]").forEach((canvas) => {
    const preset = canvas.dataset.networkPreset || "default";
    const presets = {
      hero: {
        nParticles: 65,
        lineAlpha: 0.16,
        particleAlpha: 0.3,
        speed: 0.38,
        rippleInterval: 2800,
      },
    };
    initNetworkCanvas(canvas, presets[preset] || presets.hero);
  });
})();
