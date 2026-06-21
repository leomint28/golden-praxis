/**
 * Loads brand & platform logos from data/partners.json.
 * Requires a local server (e.g. python -m http.server 8080) — fetch won't work from file://
 *
 * The brand marquee scrolls left, the platform marquee scrolls right.
 * Both are driven by requestAnimationFrame — immune to prefers-reduced-motion.
 */
(function () {
  const brandRoot    = document.getElementById("brand-logos");
  const platformRoot = document.getElementById("platform-logos");

  if (!brandRoot && !platformRoot) return;

  function createLogoTile(item, isMarquee) {
    const tile = document.createElement("div");
    tile.className = isMarquee ? "logo-tile" : "logo-tile reveal";
    tile.title = item.name;

    if (item.logo) {
      const img = document.createElement("img");
      img.src      = item.logo;
      img.alt      = item.name;
      img.loading  = "lazy";
      img.decoding = "async";

      img.addEventListener("error", () => {
        tile.classList.add("logo-tile--fallback");
        img.remove();
        const label = document.createElement("span");
        label.className   = "logo-tile-label";
        label.textContent = item.name;
        tile.appendChild(label);
      });

      tile.appendChild(img);
    } else {
      tile.classList.add("logo-tile--fallback");
      const label = document.createElement("span");
      label.className   = "logo-tile-label";
      label.textContent = item.name;
      tile.appendChild(label);
    }

    return tile;
  }

  function createAndManyMore() {
    const tile = document.createElement("div");
    tile.className = "logo-tile logo-tile--more";
    const span = document.createElement("span");
    span.className   = "logo-tile-label logo-tile-more-label";
    span.textContent = "and many more…";
    tile.appendChild(span);
    return tile;
  }

  /**
   * JS-driven infinite marquee — immune to prefers-reduced-motion.
   * direction: 1 = left (default for brands), -1 = right (for platforms)
   */
  function startJsMarquee(track, speed, direction) {
    speed     = speed     || 0.6;
    direction = direction || 1;   // 1 = left, -1 = right
    let x      = 0;
    let paused = false;

    track.addEventListener("mouseenter", () => { paused = true; });
    track.addEventListener("mouseleave", () => { paused = false; });

    function tick() {
      if (!paused) {
        x -= speed * direction;
        const halfWidth = track.scrollWidth / 2;
        // Wrap in both directions
        if (x <= -halfWidth) x = 0;
        if (x > 0)           x = -halfWidth;
        track.style.transform = `translateX(${x}px)`;
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function renderList(root, items) {
    if (!root || !items?.length) return;
    root.innerHTML = "";

    const isMarquee = root.dataset.marquee === "true";
    const isReverse = root.dataset.direction === "reverse";
    const tiles     = items.map(item => createLogoTile(item, isMarquee));
    tiles.forEach(t => root.appendChild(t));

    if (isMarquee) {
      // Duplicate set for seamless loop (no "and many more" on platforms)
      const isBrand = root.id === "brand-logos";
      if (isBrand) {
        const moreTile = createAndManyMore();
        root.appendChild(moreTile);
        tiles.forEach(t => root.appendChild(t.cloneNode(true)));
        root.appendChild(moreTile.cloneNode(true));
      } else {
        tiles.forEach(t => root.appendChild(t.cloneNode(true)));
      }

      // Remove CSS animation — JS drives it instead
      root.style.animation = "none";

      // Wait for images, with 1s timeout fallback for broken/slow paths
      const imgs      = Array.from(root.querySelectorAll("img"));
      const allLoaded = imgs.map(img =>
        img.complete
          ? Promise.resolve()
          : new Promise(res => {
              img.addEventListener("load",  res, { once: true });
              img.addEventListener("error", res, { once: true });
            })
      );
      const timeout = new Promise(res => setTimeout(res, 1000));

      Promise.race([Promise.all(allLoaded), timeout]).then(() =>
        startJsMarquee(root, 0.6, isReverse ? -1 : 1)
      );

    } else {
      tiles.forEach((tile, i) => {
        if (i > 0) tile.classList.add(`reveal-delay-${Math.min((i % 3) + 1, 3)}`);
      });
      if (window.__observeReveals) window.__observeReveals(root);
    }
  }

  fetch("data/partners.json")
    .then(r => {
      if (!r.ok) throw new Error("Failed to load partners.json");
      return r.json();
    })
    .then(data => {
      renderList(brandRoot,    data.brands);
      renderList(platformRoot, data.platforms);
    })
    .catch(() => {
      [brandRoot, platformRoot].forEach(root => {
        if (root) {
          root.innerHTML =
            '<p class="logo-grid-note">Logo tiles will appear here. Serve via a local server to load <code>data/partners.json</code>.</p>';
        }
      });
    });
})();