/**
 * scroll-fx.js — Immersive scroll & interaction effects
 * All effects are skipped when prefers-reduced-motion is set.
 */
(function () {
  'use strict';

  //if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── 1. Scroll progress bar ───────────────────────────────────────────── */
  const progressBar = document.createElement('div');
  progressBar.className = 'sfx-progress';
  document.body.prepend(progressBar);

  /* ── 2. Cursor glow (desktop only) ────────────────────────────────────── */
  let glow = null;
  if (window.innerWidth > 900 && !('ontouchstart' in window)) {
    glow = document.createElement('div');
    glow.className = 'sfx-cursor-glow';
    document.body.appendChild(glow);

    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    document.addEventListener('mousemove', e => { targetX = e.clientX; targetY = e.clientY; }, { passive: true });

    (function glowLoop() {
      curX += (targetX - curX) * 0.07;
      curY += (targetY - curY) * 0.07;
      glow.style.transform = `translate(${curX}px,${curY}px) translate(-50%,-50%)`;
      requestAnimationFrame(glowLoop);
    })();
  }

  /* ── 3. Hero parallax ─────────────────────────────────────────────────── */
  const heroMedia  = document.querySelector('.hero-media');
  const pageHeroBg = document.querySelector('.page-hero-bg');

  /* ── 4. Scroll-driven updates ─────────────────────────────────────────── */
  let scrollY = 0, ticking = false;

  function onScroll() {
    scrollY = window.scrollY;
    if (!ticking) { requestAnimationFrame(rafUpdate); ticking = true; }
  }

  function rafUpdate() {
    const docH    = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docH > 0 ? scrollY / docH : 0;

    // Progress bar
    progressBar.style.transform = `scaleX(${progress})`;

    // Parallax — hero video/photo
    // Keep the CSS -50% vertical-centre offset and add the scroll shift on top
    if (heroMedia) {
      heroMedia.style.transform = `translateY(calc(-50% + ${scrollY * 0.15}px))`;
    }
    // Parallax — page-hero gradient background
    if (pageHeroBg) {
      pageHeroBg.style.transform = `translateY(${scrollY * 0.1}px)`;
    }

    ticking = false;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  rafUpdate();

  /* ── 5. 3-D card tilt on hover ────────────────────────────────────────── */
  const TILT_SELECTORS = '.service-card, .pship-card, .why-item, .audience-card, .category-card, .value-card';
  document.querySelectorAll(TILT_SELECTORS).forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = ((e.clientX - r.left) / r.width  - 0.5) * 2;   // -1 to 1
      const dy = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      card.style.transform =
        `perspective(700px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg) translateZ(6px)`;
      card.style.transition = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s';
    });
  });

  /* ── 7. Eyebrow line draw-in on scroll ────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const eyebrowObs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('sfx-eyebrow-in');
          eyebrowObs.unobserve(e.target);
        }
      }),
      { threshold: 0.6 }
    );
    document.querySelectorAll('.eyebrow').forEach(el => eyebrowObs.observe(el));
  }

  /* ── 8. Section heading fade-up with blur ─────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const headObs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('sfx-heading-in');
          headObs.unobserve(e.target);
        }
      }),
      { threshold: 0.25, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.section-head h2, .cta-band h2, .hero h1, .page-hero-inner h1').forEach(el => {
      el.classList.add('sfx-heading');
      headObs.observe(el);
    });
  }

  /* ── 9. Stats band number pulse on entry ──────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const statObs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('sfx-stat-in');
          statObs.unobserve(e.target);
        }
      }),
      { threshold: 0.5 }
    );
    document.querySelectorAll('.stat-item').forEach(el => statObs.observe(el));
  }

})();
