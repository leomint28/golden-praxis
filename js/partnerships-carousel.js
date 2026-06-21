(function () {
  const track     = document.getElementById("pshipTrack");
  const dotsWrap  = document.getElementById("pshipDots");
  const btnPrev   = document.querySelector(".pship-btn-prev");
  const btnNext   = document.querySelector(".pship-btn-next");

  if (!track) return;

  const cards = Array.from(track.querySelectorAll(".pship-card"));
  const AUTO_DELAY = 5000; // ms between auto-advances

  let current  = 0;
  let autoTimer = null;

  /* ── How many cards fit in the viewport at once ── */
  function visibleCount() {
    const vw = window.innerWidth;
    if (vw <= 580) return 1;
    if (vw <= 900) return 2;
    return 3;
  }

  /* ── Max index we can scroll to ── */
  function maxIndex() {
    return Math.max(0, cards.length - visibleCount());
  }

  /* ── Width (px) of one card + its gap ── */
  function slideWidth() {
    if (!cards.length) return 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 28;
    return cards[0].offsetWidth + gap;
  }

  /* ── Move to a given index ── */
  function goTo(index) {
    const max = maxIndex();
    current = Math.max(0, Math.min(index, max));

    track.style.transform = `translateX(-${current * slideWidth()}px)`;

    // Update dots
    document.querySelectorAll(".pship-dot").forEach((d, i) => {
      d.classList.toggle("active", i === current);
    });

    // Disable/enable arrow buttons at boundaries
    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.disabled = current === max;
  }

  /* ── Build dot indicators ── */
  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("button");
      dot.className = "pship-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => { stopAuto(); goTo(i); startAuto(); });
      dotsWrap.appendChild(dot);
    }
  }

  /* ── Auto-advance ── */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      goTo(current < maxIndex() ? current + 1 : 0);
    }, AUTO_DELAY);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  /* ── Button listeners ── */
  if (btnPrev) {
    btnPrev.addEventListener("click", () => { stopAuto(); goTo(current - 1); startAuto(); });
  }
  if (btnNext) {
    btnNext.addEventListener("click", () => { stopAuto(); goTo(current + 1); startAuto(); });
  }

  /* ── Pause on hover / touch ── */
  track.addEventListener("mouseenter", stopAuto);
  track.addEventListener("mouseleave", startAuto);
  track.addEventListener("focusin",    stopAuto);
  track.addEventListener("focusout",   startAuto);

  /* ── Swipe support (touch) ── */
  let touchStartX = 0;
  track.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      stopAuto();
      goTo(dx < 0 ? current + 1 : current - 1);
      startAuto();
    }
  }, { passive: true });

  /* ── Rebuild on resize (visible count changes) ── */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(Math.min(current, maxIndex()));
    }, 150);
  });

  /* ── Init ── */
  buildDots();
  goTo(0);
  startAuto();
})();
