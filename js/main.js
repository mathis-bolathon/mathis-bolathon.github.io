/* =========================================================
   Mathis Bolathon — Portfolio
   ========================================================= */

/* =========================================================
   1) GALERIES — c'est ICI que tu ajoutes tes photos & vidéos
   ---------------------------------------------------------
   Dépose tes fichiers dans :
     - Photos FPV          -> assets/img/fpv/
     - Photos Cartier      -> assets/img/cartier/
     - Photos Bastringue   -> assets/img/bastringue/
     - Vidéos              -> assets/video/

   Puis ajoute une ligne dans le tableau correspondant ci-dessous.

   Photo  : { src: "assets/img/fpv/vol-01.jpg", caption: "Coucher de soleil" }
   Vidéo  : { type: "video", src: "assets/video/freestyle.mp4",
              poster: "assets/img/fpv/poster.jpg", caption: "Session freestyle" }

   Tant qu'un tableau est vide, des cases « à venir » s'affichent à la place.
   ========================================================= */
const GALLERIES = {
  fpv: [
    // { src: "assets/img/fpv/vol-01.jpg", caption: "Premier line freestyle" },
    // { type: "video", src: "assets/video/fpv-demo.mp4", poster: "assets/img/fpv/poster.jpg", caption: "Session du soir" },
  ],
  cartier: [
    // { src: "assets/img/cartier/projet-01.jpg", caption: "Cockpit d'indicateurs" },
  ],
  bastringue: [
    // { src: "assets/img/bastringue/scene-01.jpg", caption: "Édition 2025" },
  ],
};

/* Nombre de cases « à venir » affichées quand une galerie est vide */
const PLACEHOLDER_COUNT = { fpv: 6, cartier: 3, bastringue: 3 };

/* ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  initTheme();
  initNav();
  initScrollSpy();
  initHeaderState();
  initReveal();
  initGalleries();
  initLightbox();
});

/* ---------- Année footer ---------- */
function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- Thème clair / sombre ---------- */
function initTheme() {
  const toggle = document.getElementById("themeToggle");
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);

  toggle?.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

/* ---------- Navigation mobile ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const list = document.getElementById("nav-list");
  if (!toggle || !list) return;

  const close = () => {
    list.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = list.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  list.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* ---------- Header : ombre au scroll ---------- */
function initHeaderState() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Lien de nav actif selon la section ---------- */
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
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

  map.forEach((_, sec) => obs.observe(sec));
}

/* ---------- Apparition au scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }

  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        // léger décalage pour un effet en cascade
        setTimeout(() => e.target.classList.add("in"), Math.min(i * 60, 240));
        o.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  items.forEach((el) => obs.observe(el));
}

/* ---------- Construction des galeries ---------- */
function initGalleries() {
  document.querySelectorAll("[data-gallery]").forEach((container) => {
    const key = container.dataset.gallery;
    const items = GALLERIES[key] || [];

    if (items.length === 0) {
      const n = PLACEHOLDER_COUNT[key] ?? 3;
      container.innerHTML = Array.from({ length: n }, () => placeholderTile()).join("");
      return;
    }

    container.innerHTML = items.map(mediaTile).join("");
  });

  // Boutons de galerie repliable (Cartier / Bastringue)
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
  const isVideo = item.type === "video";
  const caption = item.caption ? `<span class="media-caption">${escapeHtml(item.caption)}</span>` : "";
  if (isVideo) {
    const poster = item.poster ? ` style="background-image:url('${item.poster}');background-size:cover"` : "";
    return `<button class="media-tile" data-media="video" data-src="${item.src}">
        <div class="play-badge"${poster}></div>
        ${caption}
      </button>`;
  }
  return `<button class="media-tile" data-media="image" data-src="${item.src}">
      <img src="${item.src}" alt="${escapeHtml(item.caption || "Photo")}" loading="lazy" />
      ${caption}
    </button>`;
}

function placeholderTile() {
  return `<div class="media-tile placeholder" aria-hidden="true">
      <div class="placeholder-inner">
        <svg viewBox="0 0 24 24" width="34" height="34">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke-width="1.6"/>
          <circle cx="8.5" cy="10" r="1.6" stroke-width="1.6"/>
          <path d="M21 16l-5-5-7 7" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Photo / vidéo à venir</span>
      </div>
    </div>`;
}

/* ---------- Lightbox ---------- */
function initLightbox() {
  const lb = document.getElementById("lightbox");
  const content = document.getElementById("lightboxContent");
  const closeBtn = lb?.querySelector(".lightbox-close");
  if (!lb || !content) return;

  const close = () => {
    lb.hidden = true;
    content.innerHTML = "";
    document.body.style.overflow = "";
  };

  document.addEventListener("click", (e) => {
    const tile = e.target.closest(".media-tile:not(.placeholder)");
    if (!tile) return;
    const src = tile.dataset.src;
    const type = tile.dataset.media;
    content.innerHTML = type === "video"
      ? `<video src="${src}" controls autoplay playsinline></video>`
      : `<img src="${src}" alt="" />`;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  });

  closeBtn?.addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) close(); });
}

/* ---------- util ---------- */
function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
