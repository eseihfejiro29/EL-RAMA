const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    menuToggle.textContent = isOpen ? '×' : '☰';
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
      menuToggle.textContent = '☰';
    });
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const subject = String(data.get('subject') || 'General enquiry');
    const message = String(data.get('message') || '').trim();

    if (!name || !email || !message) {
      document.getElementById('formNote').textContent = 'Please complete all required fields.';
      return;
    }

    const body = `Name: ${name}\nEmail: ${email}\nEnquiry: ${subject}\n\nMessage:\n${message}`;
    const mailto = `mailto:elrahainternationalschool@gmail.com?subject=${encodeURIComponent('Website enquiry: ' + subject)}&body=${encodeURIComponent(body)}`;
    document.getElementById('formNote').textContent = 'Opening your email application…';
    window.location.href = mailto;
  });
}

/* ---- additions: photos, sliders, lightbox ---- */
(function(){
  const C = window.SCHOOL || {};
  const $ = s => document.querySelector(s);
  const url = u => "url('" + String(u).replace(/'/g, "%27") + "')";
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scrolling slider: arrows, snap, gentle auto-advance that pauses on hover/touch/focus
  function makeSlider(track, prev, next) {
    if (!track || !track.children.length) return;
    let paused = false, timer;
    const step = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return track.children[0].getBoundingClientRect().width + gap;
    };
    const go = d => {
      const max = track.scrollWidth - track.clientWidth;
      let x = track.scrollLeft + d * step();
      if (d > 0 && track.scrollLeft >= max - 4) x = 0;
      else if (d < 0 && track.scrollLeft <= 4) x = max;
      track.scrollTo({ left: x, behavior: reduce ? 'auto' : 'smooth' });
    };
    const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => { if (!paused) go(1); }, 4500); };
    prev.addEventListener('click', () => { go(-1); restart(); });
    next.addEventListener('click', () => { go(1); restart(); });
    ['mouseenter', 'focusin', 'touchstart'].forEach(e => track.addEventListener(e, () => paused = true, { passive: true }));
    ['mouseleave', 'focusout', 'touchend'].forEach(e => track.addEventListener(e, () => paused = false, { passive: true }));
    restart();
  }

  // Hero slider
  const hero = (C.hero || []).filter(Boolean);
  if (hero.length) {
    const box = $('#heroSlides');
    $('#home').classList.add('has-photos');
    hero.forEach((u, i) => { const d = document.createElement('div'); d.style.backgroundImage = url(u); if (!i) d.className = 'on'; box.appendChild(d); });
    if (hero.length > 1) { let k = 0; setInterval(() => { box.children[k].classList.remove('on'); k = (k + 1) % hero.length; box.children[k].classList.add('on'); }, 5500); }
  }

  // About + leader photos
  if (C.about) { const a = $('#aboutArt'); a.classList.add('has-photo'); a.style.backgroundImage = url(C.about); }
  if (C.leader) { const l = $('#leaderPhoto'); l.classList.add('has-photo'); l.style.backgroundImage = url(C.leader); }

  // Mosaic: six equal tiles
  const labels = ['Our classrooms', 'Learning together', 'Sports and play', 'School events', 'Creative activities', 'Our compound'];
  const mos = $('#mosaic');
  labels.forEach((label, i) => {
    const src = (C.mosaic || [])[i];
    const d = document.createElement('div');
    d.className = 'slot' + (src ? '' : ' empty');
    if (src) d.style.backgroundImage = url(src);
    d.innerHTML = '<span>' + label + '</span>';
    mos.appendChild(d);
  });

  // Gallery slider + lightbox
  const lb = $('#lightbox'), lbImg = lb.querySelector('img'), lbCap = lb.querySelector('p');
  const closeLb = () => { lb.hidden = true; };
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
  const gal = (C.gallery || []).filter(g => g && g.src);
  const grid = $('#galleryGrid');
  if (gal.length) {
    grid.innerHTML = '';
    gal.forEach(g => {
      const b = document.createElement('button'); b.className = 'gtile'; b.style.backgroundImage = url(g.src);
      b.setAttribute('aria-label', 'Enlarge photo: ' + (g.caption || 'school photo'));
      if (g.caption) { const s = document.createElement('span'); s.textContent = g.caption; b.appendChild(s); }
      b.addEventListener('click', () => { lbImg.src = g.src; lbImg.alt = g.caption || ''; lbCap.textContent = g.caption || ''; lb.hidden = false; });
      grid.appendChild(b);
    });
    const note = $('#galNote'); if (note) note.parentElement.remove();
  }
  makeSlider(grid, $('#gPrev'), $('#gNext'));

  // Testimonials slider
  const T = C.testimonials || [];
  const track = $('#testi');
  if (T.length) {
    T.forEach(t => {
      const c = document.createElement('figure'); c.className = 'tcard';
      const q = document.createElement('blockquote'); q.textContent = '\u201C' + t.quote + '\u201D';
      const w = document.createElement('figcaption'); const b = document.createElement('b'); b.textContent = t.name;
      const s = document.createElement('small'); s.textContent = t.role || '';
      w.append(b, s); c.append(q, w); track.appendChild(c);
    });
    makeSlider(track, $('#tPrev'), $('#tNext'));
    if (T.some(t => t.sample)) $('#testiNote').textContent = 'Placeholder text. Replace with real parent comments in content.js before publishing.';
  } else { const s = $('#testimonials'); if (s) s.remove(); }
})();
