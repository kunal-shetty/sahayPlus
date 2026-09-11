/* ===========================
   HELPERS
   =========================== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/* ===========================
   MARQUEE — duplicate content for a seamless loop
   =========================== */
(function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track || prefersReducedMotion) return;
  track.innerHTML += track.innerHTML; // duplicate the set; keyframe translates -50%
})();

/* ===========================
   UNIFIED SCROLL SYSTEM
   progress bar · navbar state · back-to-top · active nav link
   =========================== */
const navbar      = document.getElementById('navbar');
const progressBar = document.getElementById('scroll-progress-bar');
const backToTop   = document.getElementById('back-to-top');
const navAnchors  = document.querySelectorAll('.nav-links a[href^="#"]');
const sectionById = {};
navAnchors.forEach(a => {
  const id = a.getAttribute('href').slice(1);
  const el = document.getElementById(id);
  if (el) sectionById[id] = a;
});
let ticking = false;

function onScroll() {
  const y       = window.scrollY;
  const max     = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? clamp(y / max, 0, 1) : 0;

  if (progressBar) progressBar.style.transform = 'scaleX(' + progress + ')';
  navbar.classList.toggle('scrolled', y > 20);
  backToTop.classList.toggle('show', y > 640);

  let currentId = '';
  for (const id in sectionById) {
    const el = document.getElementById(id);
    if (el.getBoundingClientRect().top <= 140) currentId = id;
  }
  navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + currentId));
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
onScroll();

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

/* ===========================
   MOBILE DRAWER
   =========================== */
const hamburger = document.getElementById('hamburger');
const drawer    = document.getElementById('nav-drawer');
const backdrop  = document.getElementById('nav-backdrop');
const drawerLinks = drawer.querySelectorAll('a, button');

function openDrawer() {
  drawer.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.setAttribute('aria-label', 'Close menu');
  document.body.style.overflow = 'hidden';
  drawerLinks[0]?.focus();
}
function closeDrawer() {
  drawer.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';
  hamburger.focus();
}

hamburger.addEventListener('click', () => {
  drawer.classList.contains('open') ? closeDrawer() : openDrawer();
});
backdrop.addEventListener('click', closeDrawer);
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
});

/* ===========================
   SCROLL REVEAL
   =========================== */
const animItems = document.querySelectorAll('.anim-item, .anim-fade');

if (prefersReducedMotion) {
  animItems.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const siblings = [...entry.target.parentElement.querySelectorAll('.anim-item, .anim-fade')];
        const idx = siblings.indexOf(entry.target);
        entry.target.style.animationDelay = (idx * 80) + 'ms';
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

  animItems.forEach(el => revealObserver.observe(el));
}

/* ===========================
   SMOOTH-SCROLL with scroll-margin offset
   =========================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });
});

/* ===========================
   COUNT-UP HERO STATS
   =========================== */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length || prefersReducedMotion) {
    counters.forEach(el => {
      el.textContent = Number(el.dataset.count).toLocaleString() + (el.dataset.suffix || '');
    });
    return;
  }
  const run = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = clamp((now - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        run(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(el => counterObserver.observe(el));
})();

/* ===========================
   HERO CURSOR GLOW
   =========================== */
(function initCursorGlow() {
  const hero = document.getElementById('hero');
  const glow = document.getElementById('hero-cursor-glow');
  if (!hero || !glow || prefersReducedMotion) return;
  if (window.matchMedia('(hover: none)').matches) return;
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    glow.style.left = (e.clientX - rect.left) + 'px';
    glow.style.top  = (e.clientY - rect.top) + 'px';
    glow.style.opacity = '1';
  }, { passive: true });
  hero.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
})();

/* ===========================
   3D TILT — screenshot frames & hero phone
   =========================== */
(function initTilt() {
  if (prefersReducedMotion || window.matchMedia('(hover: none)').matches) return;
  const MAX_TILT = 4;
  const frames = document.querySelectorAll('[data-tilt]');
  frames.forEach(frame => {
    frame.addEventListener('mouseenter', () => {
      frame.style.transition = 'transform .12s ease-out';
    });
    frame.addEventListener('mousemove', (e) => {
      const rect = frame.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      frame.style.transform =
        'perspective(900px) rotateX(' + (-py * MAX_TILT).toFixed(2) + 'deg) rotateY(' + (px * MAX_TILT).toFixed(2) + 'deg) translateY(-4px)';
    }, { passive: true });
    frame.addEventListener('mouseleave', () => {
      frame.style.transition = '';
      frame.style.transform = '';
    });
  });
})();

/* ===========================
   SAFETY CHECK — living countdown
   =========================== */
(function initSafetyTimer() {
  const timer = document.querySelector('.safety-timer');
  if (!timer || prefersReducedMotion) return;
  let secs = 5 * 60;
  let interval = null;
  const fmt = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  timer.textContent = fmt(secs);
  const tick = () => {
    secs = secs > 0 ? secs - 1 : 5 * 60; // gentle loop
    timer.textContent = fmt(secs);
  };
  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !interval) interval = setInterval(tick, 1000);
      else if (!entry.isIntersecting && interval) { clearInterval(interval); interval = null; }
    });
  }, { threshold: 0.4 }).observe(timer);
})();

/* ===========================
   FAQ ACCORDION
   =========================== */
(function initFaq() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-q');
    const panel = item.querySelector('.faq-a');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close others
      items.forEach(other => {
        if (other === item) return;
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = '0px';
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : '0px';
    });
  });
  // open the first question by default
  const first = items[0];
  if (first) {
    first.classList.add('open');
    first.querySelector('.faq-q').setAttribute('aria-expanded', 'true');
    const p = first.querySelector('.faq-a');
    p.style.maxHeight = p.scrollHeight + 'px';
  }
})();

/* ===========================
   DAY PERSPECTIVE TABS
   =========================== */
(function initPerspectiveTabs() {
  const tabs = document.querySelectorAll('.perspective-tab');
  const panes = document.querySelectorAll('.perspective-pane');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.pane;
      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
      panes.forEach(p => p.classList.toggle('active', p.dataset.pane === key));
    });
  });
})();

/* ===========================
   LUCIDE ICONS
   =========================== */
if (window.lucide) {
  lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
}
