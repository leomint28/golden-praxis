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
  function startJsMarquee(track, speed, direction, loopWidth) {
    speed     = speed     || 0.6;
    direction = direction || 1;   // 1 = left, -1 = right
    let x      = 0;
    let paused = false;
    let loop   = loopWidth || 0;

    track.addEventListener("mouseenter", () => { paused = true; });
    track.addEventListener("mouseleave", () => { paused = false; });

    function tick() {
      if (!paused) {
        x -= speed * direction;
        if (!loop) {
          loop = track.dataset.loopWidth
            ? Number(track.dataset.loopWidth)
            : track.scrollWidth / 2;
        }
        if (loop > 0) {
          if (x <= -loop) x += loop;
          if (x > 0) x -= loop;
        }
        track.style.transform = `translate3d(${x}px, 0, 0)`;
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
        const isBrand = root.id === "brand-logos";
        const template = tiles.slice();

        if (isBrand) {
          const moreTile = createAndManyMore();
          root.appendChild(moreTile);
          template.push(moreTile);
        }

        const setWidth = root.scrollWidth;
        const viewportW = root.parentElement?.clientWidth || window.innerWidth;

        template.forEach((node) => root.appendChild(node.cloneNode(true)));

        while (root.scrollWidth < viewportW * 2 + setWidth) {
          template.forEach((node) => root.appendChild(node.cloneNode(true)));
        }

        root.style.animation = "none";
        startJsMarquee(root, 0.6, isReverse ? -1 : 1, setWidth);

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