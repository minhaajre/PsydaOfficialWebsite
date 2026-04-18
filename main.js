/* ============================================================
   PSYDA — main.js  (editorial redesign)
   ============================================================ */

// Prevent browser from restoring mid-page scroll position on reload
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

// ── Scroll progress ────────────────────────────────────────
const progressBar = document.getElementById('scrollProgress');
function updateProgress() {
  const h = document.documentElement;
  const p = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  progressBar.style.width = p + '%';
}

// ── Nav scroll state ────────────────────────────────────────
const nav = document.getElementById('nav');
function onScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  updateProgress();
  updatePillar();
  updateParallax();
}
window.addEventListener('scroll', onScroll, { passive: true });

// ── Active nav link via IO ──────────────────────────────────
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');
const linkObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.35, rootMargin: '-80px 0px -40% 0px' });
sections.forEach(s => linkObserver.observe(s));

// ── Mobile drawer ───────────────────────────────────────────
const toggle  = document.querySelector('.nav-toggle');
const drawer  = document.getElementById('mobileDrawer');
function closeDrawer() {
  drawer.classList.remove('open');
  toggle.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
toggle.addEventListener('click', () => {
  const isOpen = drawer.classList.toggle('open');
  toggle.classList.toggle('open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  drawer.setAttribute('aria-hidden', String(!isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

// ── Word-reveal: wrap each word in .word > span ─────────────
document.querySelectorAll('.reveal-words').forEach(el => {
  // Recursively wrap text nodes
  const wrap = (node) => {
    if (!node || !node.parentNode) return;
    if (node.nodeType === 3) {
      const text = node.nodeValue;
      if (!text.trim()) return;
      const frag = document.createDocumentFragment();
      const parts = text.split(/(\s+)/);
      parts.forEach(part => {
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else if (part.length) {
          const w = document.createElement('span');
          w.className = 'word';
          const inner = document.createElement('span');
          inner.textContent = part;
          w.appendChild(inner);
          frag.appendChild(w);
        }
      });
      if (node.parentNode) node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === 1 && !node.classList.contains('word')) {
      const kids = [...node.childNodes];
      kids.forEach(wrap);
    }
  };
  const rootKids = [...el.childNodes];
  rootKids.forEach(wrap);
  // set stagger index
  el.querySelectorAll('.word').forEach((w, i) => w.style.setProperty('--i', i));
});

// ── Reveal on view ──────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-words, .fade-up, .e-item, .media-row').forEach(el => {
  revealObs.observe(el);
});

// Stagger list children
document.querySelectorAll('.editorial-list, .media-list').forEach(list => {
  [...list.children].forEach((li, i) => {
    li.style.transitionDelay = `${i * 0.07}s`;
  });
});

// ── Side rail active section ──────────────────────────────
const sideLinks = document.querySelectorAll('.side-rail a');
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      sideLinks.forEach(a => a.classList.toggle('active', a.dataset.target === entry.target.id));
    }
  });
}, { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' });
sections.forEach(s => sectionObs.observe(s));
const hero = document.querySelector('.hero');
const heroSlides = [...document.querySelectorAll('.hero-slide')];
const pillarItems = [...document.querySelectorAll('.pillar-item')];
const pillarProgress = document.getElementById('pillarProgress');
let currentPillar = 0;

function updatePillar() {
  if (!hero) return;
  const rect = hero.getBoundingClientRect();
  const total = hero.offsetHeight - window.innerHeight;
  const scrolled = Math.max(0, Math.min(total, -rect.top));
  const t = total > 0 ? scrolled / total : 0;  // 0..1 through hero

  // 3 slides — thresholds 0, 0.333, 0.666
  let idx = 0;
  if (t >= 0.66) idx = 2;
  else if (t >= 0.33) idx = 1;

  if (idx !== currentPillar) {
    currentPillar = idx;
    heroSlides.forEach((s, i) => s.classList.toggle('active', i === idx));
    pillarItems.forEach((p, i) => p.classList.toggle('active', i === idx));
  }
  if (pillarProgress) pillarProgress.style.width = (t * 100) + '%';
}

// Click pillar item to jump
pillarItems.forEach((p, i) => {
  p.style.cursor = 'pointer';
  p.addEventListener('click', () => {
    const total = hero.offsetHeight - window.innerHeight;
    const target = hero.offsetTop + (i / 3) * total + 20;
    window.scrollTo({ top: target, behavior: 'smooth' });
  });
});

// Initial
updatePillar();

// ── Parallax on bleed-figures ───────────────────────────────
const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
function updateParallax() {
  parallaxEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const speed = parseFloat(el.dataset.parallax) || 0.15;
    // Map scroll position through element to small vertical offset
    const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    const offset = Math.max(-40, Math.min(40, -progress * speed * 120));
    const img = el.querySelector('.bleed-img > svg');
    if (img) img.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
}

// ── TWEAKS ─────────────────────────────────────────────────
const defaults = window.__TWEAKS__ || {};
function applyTweaks(state) {
  document.documentElement.style.setProperty('--accent', state.accent);
  document.documentElement.style.setProperty('--motion', state.motionIntensity / 60);
  // italic headings: toggle a body class
  document.body.classList.toggle('no-italic', !state.italicHeadings);
  // marquee
  const track = document.querySelector('.marquee-track');
  if (track) track.style.animationPlayState = state.marqueeOn ? 'running' : 'paused';
}
let tweakState = { ...defaults };
applyTweaks(tweakState);

// Tweaks panel DOM
function buildTweaksPanel() {
  const panel = document.createElement('div');
  panel.className = 'tweaks-panel';
  panel.id = 'tweaksPanel';
  const swatches = ['#8C7355', '#3A5A40', '#6B4423', '#5B5BD6', '#1E1C18'];
  panel.innerHTML = `
    <h4>Tweaks <span style="font-family: var(--font-ui); font-size: 0.58rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-muted); font-style: normal;">Live</span></h4>
    <div class="tweak-row">
      <label>Accent colour</label>
      <div class="tweak-swatches">
        ${swatches.map(c => `<button class="tweak-swatch${c === tweakState.accent ? ' active':''}" data-accent="${c}" style="background:${c}"></button>`).join('')}
      </div>
    </div>
    <div class="tweak-row">
      <label>Motion intensity · <span id="miVal">${tweakState.motionIntensity}</span></label>
      <input type="range" min="0" max="100" step="10" value="${tweakState.motionIntensity}" id="miRange">
    </div>
    <div class="tweak-row toggle">
      <label>Italic headings</label>
      <button class="tweak-toggle${tweakState.italicHeadings ? ' on':''}" id="italicTog"></button>
    </div>
    <div class="tweak-row toggle">
      <label>Marquee on hero</label>
      <button class="tweak-toggle${tweakState.marqueeOn ? ' on':''}" id="marqTog"></button>
    </div>
  `;
  document.body.appendChild(panel);

  panel.querySelectorAll('.tweak-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.dataset.accent;
      tweakState.accent = c;
      panel.querySelectorAll('.tweak-swatch').forEach(b => b.classList.toggle('active', b === btn));
      applyTweaks(tweakState);
      persist({ accent: c });
    });
  });
  const miRange = panel.querySelector('#miRange');
  miRange.addEventListener('input', e => {
    const v = +e.target.value;
    tweakState.motionIntensity = v;
    panel.querySelector('#miVal').textContent = v;
    applyTweaks(tweakState);
    persist({ motionIntensity: v });
  });
  panel.querySelector('#italicTog').addEventListener('click', e => {
    tweakState.italicHeadings = !tweakState.italicHeadings;
    e.currentTarget.classList.toggle('on', tweakState.italicHeadings);
    applyTweaks(tweakState);
    persist({ italicHeadings: tweakState.italicHeadings });
  });
  panel.querySelector('#marqTog').addEventListener('click', e => {
    tweakState.marqueeOn = !tweakState.marqueeOn;
    e.currentTarget.classList.toggle('on', tweakState.marqueeOn);
    applyTweaks(tweakState);
    persist({ marqueeOn: tweakState.marqueeOn });
  });
  return panel;
}
function persist(edits) {
  try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*'); } catch(_) {}
}

// italic headings control via style
const italicStyle = document.createElement('style');
italicStyle.textContent = `body.no-italic em { font-style: normal; }`;
document.head.appendChild(italicStyle);

// Host edit-mode protocol
let tweaksPanel = null;
window.addEventListener('message', (e) => {
  const d = e.data;
  if (!d || !d.type) return;
  if (d.type === '__activate_edit_mode') {
    if (!tweaksPanel) tweaksPanel = buildTweaksPanel();
    tweaksPanel.classList.add('open');
  }
  if (d.type === '__deactivate_edit_mode') {
    if (tweaksPanel) tweaksPanel.classList.remove('open');
  }
});
try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch(_) {}

// Kick off
updateProgress();
onScroll();
