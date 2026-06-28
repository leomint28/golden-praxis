(function () {
  const canvases = document.querySelectorAll("[data-page-hero-canvas]");
  if (!canvases.length) return;



  canvases.forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let particles = [];
    let frameId = 0;
    let start = 0;

    function initParticles() {
      const count = Math.max(14, Math.floor((width * height) / 12000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.5 + Math.random() * 2,
      }));
    }

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function isMobileHeroLayout() {
      return window.matchMedia("(max-width: 960px)").matches;
    }

    function ringCenter() {
      return {
        cx: width * (isMobileHeroLayout() ? 0.5 : 0.78),
        cy: height * 0.5,
      };
    }

    function drawRings(t) {
      const { cx, cy } = ringCenter();
      const rings = [
        { r: 72, speed: 0.00045, gold: true },
        { r: 108, speed: -0.00032, gold: false },
        { r: 142, speed: 0.00022, gold: false },
      ];

      rings.forEach((ring, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.gold
          ? "rgba(212, 184, 106, 0.45)"
          : `rgba(255, 255, 255, ${0.07 + i * 0.03})`;
        ctx.lineWidth = ring.gold ? 2 : 1;
        ctx.stroke();

        const angle = t * ring.speed + i * 1.4;
        const dotX = cx + Math.cos(angle) * ring.r;
        const dotY = cy + Math.sin(angle) * ring.r;
        ctx.beginPath();
        ctx.arc(dotX, dotY, ring.gold ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = ring.gold ? "#d4b86a" : "rgba(255,255,255,0.55)";
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(91, 45, 130, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "#b8942e";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    function drawParticles() {
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(184, 148, 46, ${0.22 * (1 - dist / 85)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.fill();
      }
    }

    function drawArcs(t) {
      const { cx, cy } = ringCenter();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.00008);
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(0, 0, 95 + i * 18, -0.6 + i * 0.2, 0.9 + i * 0.15);
        ctx.strokeStyle = `rgba(212, 184, 106, ${0.12 - i * 0.02})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    function frame(timestamp) {
      if (!start) start = timestamp;
      const t = timestamp - start;
      ctx.clearRect(0, 0, width, height);
      drawArcs(t);
      drawRings(t);
      drawParticles();
      frameId = requestAnimationFrame(frame);
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      drawArcs(0);
      drawRings(0);
      drawParticles();
    }

    resize();
    window.addEventListener("resize", resize);

    frameId = requestAnimationFrame(frame);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(frameId);
      } else {
        frameId = requestAnimationFrame(frame);
      }
    });
  });
})();