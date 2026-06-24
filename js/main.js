/* =========================================================
   Mathis Bolathon — Portfolio (direction technique / data)
   ========================================================= */

/* =========================================================
   GALERIES — c'est ICI que tu ajoutes tes photos & vidéos
   ---------------------------------------------------------
   Fichiers :  Photos FPV -> assets/img/fpv/
               Photos Cartier -> assets/img/cartier/
               Photos Festival -> assets/img/bastringue/
               Vidéos -> assets/video/

   Photo : { src: "assets/img/fpv/vol-01.jpg", caption: "Coucher de soleil" }
   Vidéo : { type: "video", src: "assets/video/demo.mp4",
             poster: "assets/img/fpv/poster.jpg", caption: "Session du soir" }

   Tant qu'un tableau est vide, des cases « à venir » s'affichent.
   ========================================================= */
const GALLERIES = {
  fpv: [],
  cartier: [],
  bastringue: [],
};
const PLACEHOLDER_COUNT = { fpv: 6, cartier: 3, bastringue: 3 };

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  initTheme();
  initNav();
  initScrollSpy();
  initScrollEffects();
  initReveal();
  initHeroNetwork();
  initCursor();
  initMagnetic();
  initGalleries();
  initLightbox();
  requestAnimationFrame(() => document.body.classList.add("is-loaded"));
});

/* ---------- Année ---------- */
function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- Thème ---------- */
function initTheme() {
  const toggle = document.getElementById("themeToggle");
  const stored = localStorage.getItem("theme");
  const theme = stored || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  toggle?.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

/* ---------- Nav mobile ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const list = document.getElementById("nav-list");
  if (!toggle || !list) return;
  const close = () => { list.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); };
  toggle.addEventListener("click", () => {
    const open = list.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  list.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* ---------- Scroll spy (lien actif) ---------- */
function initScrollSpy() {
  const links = [...document.querySelectorAll(".nav-list a")];
  const map = new Map();
  links.forEach((l) => {
    const id = l.getAttribute("href")?.slice(1);
    const sec = id && document.getElementById(id);
    if (sec) map.set(sec, l);
  });
  if (!map.size) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.remove("active"));
        map.get(e.target)?.classList.add("active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((_, sec) => obs.observe(sec));
}

/* ---------- Effets liés au scroll (barre, %, header, timeline) ---------- */
function initScrollEffects() {
  const header = document.querySelector(".site-header");
  const bar = document.getElementById("scrollProgress");
  const pct = document.getElementById("scrollPct");
  const fill = document.getElementById("timelineFill");
  const timeline = document.getElementById("timeline");
  const dots = [...document.querySelectorAll(".tl-item")];
  let ticking = false;

  const update = () => {
    ticking = false;
    const scroll = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const p = docH > 0 ? scroll / docH : 0;

    if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
    if (pct) pct.textContent = String(Math.round(p * 100)).padStart(3, "0");
    header?.classList.toggle("scrolled", scroll > 12);

    if (timeline && fill) {
      const r = timeline.getBoundingClientRect();
      const center = window.innerHeight * 0.55;
      const prog = (center - r.top) / r.height;
      fill.style.height = Math.max(0, Math.min(1, prog)) * 100 + "%";
      dots.forEach((item) => {
        const ir = item.getBoundingClientRect();
        item.querySelector(".tl-dot")?.classList.toggle("active", ir.top < center);
      });
    }
  };

  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
}

/* ---------- Apparition au scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal-up");
  if (!items.length) return;
  if (REDUCED || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("in"), Math.min(i * 55, 220));
        o.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  items.forEach((el) => obs.observe(el));
}

/* ---------- Réseau de nœuds (hero) ---------- */
function initHeroNetwork() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const hero = canvas.closest(".hero");
  let w = 0, h = 0, dpr = 1, nodes = [], packets = [], raf = null, visible = true;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const TEAL = "79,224,196", BLUE = "106,166,255";
  const LINK_DIST = 150;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(14, Math.min(46, Math.round((w * h) / 30000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
      r: Math.random() * 1.6 + 1.2,
    }));
    packets = Array.from({ length: Math.round(count / 4) }, makePacket);
  }
  function makePacket() {
    const a = (Math.random() * nodes.length) | 0;
    return { a, b: nearest(a), t: Math.random(), speed: Math.random() * .006 + .003 };
  }
  function nearest(i) {
    let best = -1, bd = Infinity;
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      const d = (nodes[i].x - nodes[j].x) ** 2 + (nodes[i].y - nodes[j].y) ** 2;
      if (d < bd) { bd = d; best = j; }
    }
    return best < 0 ? i : best;
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    mouse.x += (mouse.tx - mouse.x) * .06;
    mouse.y += (mouse.ty - mouse.y) * .06;
    const ox = mouse.x * 18, oy = mouse.y * 18;

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    // liens
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST) {
          const a = (1 - dist / LINK_DIST) * .28;
          ctx.strokeStyle = `rgba(${TEAL},${a})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x + ox, nodes[i].y + oy);
          ctx.lineTo(nodes[j].x + ox, nodes[j].y + oy);
          ctx.stroke();
        }
      }
    }
    // nœuds
    for (const n of nodes) {
      ctx.fillStyle = `rgba(${TEAL},.85)`;
      ctx.beginPath(); ctx.arc(n.x + ox, n.y + oy, n.r, 0, Math.PI * 2); ctx.fill();
    }
    // paquets en circulation
    for (const p of packets) {
      p.t += p.speed;
      if (p.t >= 1) { Object.assign(p, makePacket()); continue; }
      const A = nodes[p.a], B = nodes[p.b];
      if (!A || !B) { Object.assign(p, makePacket()); continue; }
      const x = A.x + (B.x - A.x) * p.t + ox;
      const y = A.y + (B.y - A.y) * p.t + oy;
      const col = Math.random() < .5 ? TEAL : BLUE;
      ctx.fillStyle = `rgba(${col},.95)`;
      ctx.shadowColor = `rgba(${TEAL},.8)`; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && visible && !REDUCED) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  resize();
  window.addEventListener("resize", () => { resize(); if (REDUCED) drawStatic(); }, { passive: true });
  window.addEventListener("mousemove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth - .5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - .5) * 2;
  }, { passive: true });
  document.addEventListener("visibilitychange", () => { document.hidden ? stop() : start(); });

  if (hero) {
    new IntersectionObserver((ents) => {
      visible = ents[0].isIntersecting;
      visible ? start() : stop();
    }, { threshold: 0 }).observe(hero);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < LINK_DIST) {
          ctx.strokeStyle = `rgba(${TEAL},${(1 - dist / LINK_DIST) * .25})`;
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
        }
      }
    }
    for (const n of nodes) { ctx.fillStyle = `rgba(${TEAL},.8)`; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill(); }
  }
  if (REDUCED) drawStatic(); else start();
}

/* ---------- Curseur custom ---------- */
function initCursor() {
  if (REDUCED || window.matchMedia("(hover: none)").matches) return;
  const cur = document.getElementById("cursor");
  if (!cur) return;
  let x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y;
  window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; cur.style.opacity = "1"; }, { passive: true });
  document.addEventListener("mouseover", (e) => {
    cur.classList.toggle("hovering", !!e.target.closest("a, button, .magnetic, .media-tile, input"));
  });
  (function loop() {
    x += (tx - x) * .18; y += (ty - y) * .18;
    cur.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(loop);
  })();
}

/* ---------- Boutons magnétiques ---------- */
function initMagnetic() {
  if (REDUCED || window.matchMedia("(hover: none)").matches) return;
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.style.transition = "transform .25s var(--ease)";
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * .22}px, ${dy * .22}px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });
}

/* ---------- Galeries ---------- */
function initGalleries() {
  document.querySelectorAll("[data-gallery]").forEach((container) => {
    const key = container.dataset.gallery;
    const items = GALLERIES[key] || [];
    if (items.length === 0) {
      const n = PLACEHOLDER_COUNT[key] ?? 3;
      container.innerHTML = Array.from({ length: n }, placeholderTile).join("");
      return;
    }
    container.innerHTML = items.map(mediaTile).join("");
  });

  document.querySelectorAll("[data-gallery-toggle]").forEach((btn) => {
    const key = btn.dataset.galleryToggle;
    const gallery = document.querySelector(`[data-gallery="${key}"]`);
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      if (gallery) gallery.hidden = open;
    });
  });
}
function mediaTile(item) {
  const caption = item.caption ? `<span class="media-caption">${escapeHtml(item.caption)}</span>` : "";
  if (item.type === "video") {
    const poster = item.poster ? ` style="background-image:url('${item.poster}');background-size:cover"` : "";
    return `<button class="media-tile" data-media="video" data-src="${item.src}"><div class="play-badge"${poster}></div>${caption}</button>`;
  }
  return `<button class="media-tile" data-media="image" data-src="${item.src}"><img src="${item.src}" alt="${escapeHtml(item.caption || "Photo")}" loading="lazy" />${caption}</button>`;
}
function placeholderTile() {
  return `<div class="media-tile placeholder" aria-hidden="true"><div class="placeholder-inner">
      <svg viewBox="0 0 24 24" width="32" height="32"><rect x="3" y="5" width="18" height="14" rx="2" stroke-width="1.6"/><circle cx="8.5" cy="10" r="1.6" stroke-width="1.6"/><path d="M21 16l-5-5-7 7" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span>à venir</span></div></div>`;
}

/* ---------- Lightbox ---------- */
function initLightbox() {
  const lb = document.getElementById("lightbox");
  const content = document.getElementById("lightboxContent");
  const closeBtn = lb?.querySelector(".lightbox-close");
  if (!lb || !content) return;
  const close = () => { lb.hidden = true; content.innerHTML = ""; document.body.style.overflow = ""; };
  document.addEventListener("click", (e) => {
    const tile = e.target.closest(".media-tile:not(.placeholder)");
    if (!tile) return;
    const src = tile.dataset.src;
    content.innerHTML = tile.dataset.media === "video"
      ? `<video src="${src}" controls autoplay playsinline></video>`
      : `<img src="${src}" alt="" />`;
    lb.hidden = false; document.body.style.overflow = "hidden";
  });
  closeBtn?.addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) close(); });
}

/* ---------- util ---------- */
function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
