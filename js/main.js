(function () {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");
  const fabTop = document.querySelector(".fab-top");
  const contactForm = document.getElementById("contact-form");
  const formSuccess = document.querySelector(".form-success");

  // ── Header scroll state ──
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 1);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile nav toggle ──
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // ── Back to top FAB ──
  if (fabTop) {
    window.addEventListener("scroll", () => {
      fabTop.classList.toggle("visible", window.scrollY > 500);
    }, { passive: true });

    fabTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ── Scroll reveal (all variants: .reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-up, .stagger-children) ──
  const REVEAL_SEL = ".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-up, .stagger-children";
  const revealEls = document.querySelectorAll(REVEAL_SEL);

  if (revealEls.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -48px 0px" }
    );

    window.__observeReveals = (scope = document) => {
      scope.querySelectorAll(REVEAL_SEL.split(",").map(s => `${s.trim()}:not(.visible)`).join(",")).forEach((el) => observer.observe(el));
    };

    window.__observeReveals();
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
    window.__observeReveals = () => {};
  }

  // ── Counter animations ──
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const prefix = el.dataset.prefix || "";
        const isDecimal = String(target).includes(".");
        const duration = 1800;
        const startTime = performance.now();

        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * target;
          el.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => counterObserver.observe(el));
  }

  // ── Contact form (mailto fallback) ──
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(contactForm);
      const subject = data.get("subject") || data.get("interest") || "Website inquiry";
      const body = [
        `Name: ${data.get("name")}`,
        `Email: ${data.get("email")}`,
        `Phone: ${data.get("phone") || "—"}`,
        `Company: ${data.get("company") || "—"}`,
        `Interest: ${data.get("interest") || "—"}`,
        "",
        data.get("message"),
      ].join("\n");

      window.location.href = `mailto:info@goldenpraxis.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      if (formSuccess) {
        formSuccess.classList.add("visible");
        formSuccess.textContent =
          "Thank you — your email client should open with your message ready to send.";
      }

      contactForm.reset();
    });
  }

  // ── FAQ accordion ──
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((el) => el.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });

  // ── Brand category filter ──
  const filterBtns = document.querySelectorAll(".filter-btn");
  if (filterBtns.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const category = btn.dataset.filter;
        document.querySelectorAll(".brand-tile").forEach((tile) => {
          if (category === "all" || tile.dataset.category === category) {
            tile.style.display = "";
          } else {
            tile.style.display = "none";
          }
        });
      });
    });
  }

  // ── Expertise ticker (hero) — fill viewport, then loop seamlessly ──
  const expertiseTrack = document.querySelector("[data-expertise-ticker]");
  if (expertiseTrack) {
    const expertiseRoot = expertiseTrack.closest(".expertise-ticker");
    let loopWidth = 0;
    let offsetX = 0;
    let ticking = false;

    function measureSetWidth() {
      const probe = document.createElement("div");
      probe.style.cssText = "position:absolute;visibility:hidden;display:flex;gap:1.5rem;width:max-content;white-space:nowrap;";
      probe.className = expertiseTrack.className;
      Array.from(expertiseTrack.children).forEach((node) => {
        probe.appendChild(node.cloneNode(true));
      });
      expertiseRoot.appendChild(probe);
      const width = probe.scrollWidth;
      probe.remove();
      return width;
    }

    function fillTrack() {
      const template = Array.from(expertiseTrack.children).map((node) => node.cloneNode(true));
      if (!template.length || !expertiseRoot) return 0;

      expertiseTrack.replaceChildren(...template.map((node) => node.cloneNode(true)));

      const setWidth = measureSetWidth();
      if (!setWidth) return 0;

      const viewportW = expertiseRoot.clientWidth || window.innerWidth;
      const minWidth = viewportW * 2 + setWidth;

      while (expertiseTrack.scrollWidth < minWidth) {
        template.forEach((node) => expertiseTrack.appendChild(node.cloneNode(true)));
      }

      return setWidth;
    }

    function normalizeOffset() {
      if (!loopWidth) return;
      while (offsetX <= -loopWidth) offsetX += loopWidth;
      while (offsetX > 0) offsetX -= loopWidth;
    }

    function render() {
      expertiseTrack.style.transform = `translate3d(${offsetX}px, 0, 0)`;
    }

    function remeasure() {
      const prevLoop = loopWidth;
      loopWidth = fillTrack();
      if (prevLoop && loopWidth) {
        offsetX = (offsetX / prevLoop) * loopWidth;
      }
      normalizeOffset();
      render();
      expertiseTrack.setAttribute("data-ticker-ready", "");
    }

    function tick() {
      if (loopWidth > 0) {
        offsetX -= 0.45;
        normalizeOffset();
        render();
      }
      requestAnimationFrame(tick);
    }

    function start() {
      remeasure();
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(tick);
      }
    }

    start();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start).catch(start);
    }

    window.addEventListener("resize", start, { passive: true });

    if (typeof ResizeObserver !== "undefined" && expertiseRoot) {
      const ro = new ResizeObserver(start);
      ro.observe(expertiseRoot);
    }
  }

  // ── Smooth anchor scroll ──
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
        mainNav?.classList.remove("open");
      }
    });
  });
})();
