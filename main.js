// ── Chrome height (navbar + announce bar) for carousel sizing ──
function updateChromeHeight() {
  const announce = document.querySelector('.announce-bar');
  const navbar   = document.getElementById('navbar');
  const aH = (announce && announce.offsetParent !== null) ? announce.offsetHeight : 0;
  const nH = navbar ? navbar.offsetHeight : 68;
  document.documentElement.style.setProperty('--chrome-h', (aH + nH) + 'px');
}
updateChromeHeight();
window.addEventListener('resize', updateChromeHeight);

// ── Navbar scroll shadow ──
(function() {
  const nav = document.getElementById('navbar');
  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10));
})();

// ── Mobile burger menu ──
(function() {
  const burger = document.getElementById('navBurger');
  const mobileNav = document.getElementById('mobileNav');

  function closeMobileNav() {
    if (burger) burger.classList.remove('open');
    if (mobileNav) mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (burger) {
    burger.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpen = mobileNav.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  window.toggleMobSub = function(id, el) {
    const sub = document.getElementById(id);
    if (!sub) return;
    const isOpen = sub.classList.toggle('open');
    if (el) el.classList.toggle('open', isOpen);
  };

  document.addEventListener('click', function(e) {
    if (mobileNav && mobileNav.classList.contains('open')) {
      if (!mobileNav.contains(e.target) && burger && !burger.contains(e.target)) {
        closeMobileNav();
      }
    }
  });
})();

// ── Hero Carousel (index.html) ──
(function() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const dots  = document.querySelectorAll('.carousel-dot');
  const total = 4;
  let   cur   = 0, timer;

  function goTo(n) {
    cur = (n + total) % total;
    track.style.transform = 'translateX(-' + (cur * 25) + '%)';
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
    document.querySelectorAll('.carousel-slide').forEach((s, i) => s.classList.toggle('active', i === cur));
    // Mise à jour des éléments dynamiques de l'overlay statique
    document.querySelectorAll('.hero-ct').forEach((el, i)   => el.style.display = i === cur ? '' : 'none');
    document.querySelectorAll('.hero-tags').forEach((el, i) => el.style.display = i === cur ? '' : 'none');
    for (let i = 0; i < total; i++) {
      const num = document.getElementById('hero-num-' + i);
      if (num) num.style.display = i === cur ? '' : 'none';
    }
  }

  function next() { goTo(cur + 1); }
  function prev() { goTo(cur - 1); }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, 5500);
  }

  const nextBtn = document.getElementById('carouselNext');
  const prevBtn = document.getElementById('carouselPrev');
  if (nextBtn) nextBtn.addEventListener('click', function() { next(); startTimer(); });
  if (prevBtn) prevBtn.addEventListener('click', function() { prev(); startTimer(); });
  dots.forEach(d => d.addEventListener('click', function() { goTo(+this.dataset.idx); startTimer(); }));

  startTimer();
})();

// ── Portfolio filter + load more (index.html) ──
(function() {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  const allCards   = Array.from(grid.querySelectorAll('.pcard'));
  const filterBtns = document.querySelectorAll('.pf-btn');
  const countEl    = document.getElementById('portfolioCount');
  const loadBtn    = document.getElementById('loadMoreBtn');
  const PER_PAGE   = 4;
  let   currentFilter = 'all';
  let   shown = PER_PAGE;

  function getFiltered() {
    return allCards.filter(c => currentFilter === 'all' || c.dataset.cat === currentFilter);
  }

  function render() {
    const filtered = getFiltered();
    allCards.forEach(c => c.classList.add('hidden'));
    filtered.slice(0, shown).forEach(c => c.classList.remove('hidden'));
    if (countEl) countEl.textContent = 'Affichage de ' + Math.min(shown, filtered.length) + ' projets sur ' + filtered.length;
    if (loadBtn) loadBtn.style.display = shown >= filtered.length ? 'none' : 'inline-flex';
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      shown = PER_PAGE;
      render();
    });
  });

  if (loadBtn) {
    loadBtn.addEventListener('click', function() {
      shown += PER_PAGE;
      render();
    });
  }

  render();
})();

// ── scrollToPortfolio (index.html) ──
window.scrollToPortfolio = function(filter) {
  const section = document.getElementById('realisations');
  if (section) {
    const offset = section.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
  if (filter) {
    setTimeout(function() {
      const btn = document.querySelector('.pf-btn[data-filter="' + filter + '"]');
      if (btn) btn.click();
    }, 400);
  }
};

// ── Activity page: scroll to activity section (activites.html) ──
window.scrollToAct = function(id) {
  const el = document.getElementById('act-' + id);
  if (!el) return;
  const offset = el.getBoundingClientRect().top + window.scrollY - 130;
  window.scrollTo({ top: offset, behavior: 'smooth' });
};

// ── Auto-scroll to anchor on page load (e.g. activites.html#act-elec) ──
(function() {
  const hash = window.location.hash;
  if (!hash) return;
  const target = document.querySelector(hash);
  if (!target) return;
  setTimeout(function() {
    const offset = target.getBoundingClientRect().top + window.scrollY - 130;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }, 200);
})();

// ── Activity page: intersection observer for reveal + active anchor nav ──
(function() {
  if (!document.querySelector('.activity-block')) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.activity-block').forEach(b => observer.observe(b));

  const sections = ['elec', 'solar', 'tel', 'btp'];
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 160;
    sections.forEach(id => {
      const el = document.getElementById('act-' + id);
      if (!el) return;
      const top = el.offsetTop, bottom = top + el.offsetHeight;
      const isActive = scrollY >= top && scrollY < bottom;
      document.querySelectorAll('[data-target="' + id + '"]').forEach(btn => {
        btn.classList.toggle('active', isActive);
      });
      document.querySelectorAll('.hero-pill').forEach(p => {
        if (p.getAttribute('onclick') && p.getAttribute('onclick').includes(id)) {
          p.classList.toggle('active', isActive);
        }
      });
    });
  });
})();

// ── Contact form (contact.html) ──
window.submitForm = function(e) {
  e.preventDefault();
  var form = e.target;
  var get  = function(name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  };

  var prenom      = get('prenom');
  var nom         = get('nom');
  var email       = get('email');
  var telephone   = get('telephone');
  var entreprise  = get('entreprise');
  var typeProjet  = get('type_projet');
  var localisation = get('localisation');
  var budget      = get('budget');
  var message     = get('message');

  var body = [
    'Bonjour,',
    '',
    'Voici une nouvelle demande de devis reçue via le site web.',
    '',
    '── CONTACT ──────────────────────',
    'Nom       : ' + prenom + ' ' + nom,
    'Email     : ' + email,
    'Téléphone : ' + telephone,
    entreprise ? 'Entreprise : ' + entreprise : '',
    '',
    '── PROJET ───────────────────────',
    'Type de projet : ' + typeProjet,
    localisation ? 'Localisation   : ' + localisation : '',
    budget       ? 'Budget estimatif : ' + budget      : '',
    '',
    '── MESSAGE ──────────────────────',
    message,
    '',
    '─────────────────────────────────',
    'Message envoyé depuis le formulaire du site Groupe El Shaddai.'
  ].filter(function(line, i, arr) {
    // Supprime les lignes vides consécutives en fin de bloc
    return !(line === '' && arr[i - 1] === '');
  }).join('\n');

  var mailto = 'mailto:infos@groupe-elshaddai.ci'
    + '?subject=' + encodeURIComponent('demande de devis')
    + '&body='    + encodeURIComponent(body);

  window.location.href = mailto;

  // Affiche le message de confirmation après un court délai
  setTimeout(function() {
    var formContent = document.getElementById('formContent');
    var formSuccess = document.getElementById('formSuccess');
    if (formContent) formContent.style.display = 'none';
    if (formSuccess) formSuccess.classList.add('show');
  }, 500);
};

window.resetForm = function() {
  var contactForm = document.getElementById('contactForm');
  var formContent = document.getElementById('formContent');
  var formSuccess = document.getElementById('formSuccess');
  if (contactForm) contactForm.reset();
  if (formContent) formContent.style.display = 'block';
  if (formSuccess) formSuccess.classList.remove('show');
};

/* ═══════════════════════════════════════════════════════════
   ✦  PREMIUM ANIMATIONS & EFFECTS  ✦
   ═══════════════════════════════════════════════════════════ */

// ── Scroll Progress Bar ────────────────────────────────────────
(function() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.insertAdjacentElement('afterbegin', bar);
  window.addEventListener('scroll', function() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max * 100) : 0) + '%';
  }, { passive: true });
})();

// ── Cursor Ambient Glow (desktop only) ────────────────────────
(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  let tx = 0, ty = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', function(e) {
    tx = e.clientX; ty = e.clientY;
  }, { passive: true });
  function animGlow() {
    cx += (tx - cx) * .12;
    cy += (ty - cy) * .12;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(animGlow);
  }
  animGlow();
})();

// ── Scroll Reveal ─────────────────────────────────────────────
(function() {
  // Stagger grid children
  ['.offer-grid', '.portfolio-grid', '.process-steps', '.band-inner', '.partners-logos', '.footer-top'].forEach(function(sel) {
    var container = document.querySelector(sel);
    if (!container) return;
    Array.from(container.children).forEach(function(child, i) {
      child.classList.add('reveal');
      child.style.transitionDelay = (i * 95) + 'ms';
    });
  });
  // Individual elements
  ['.portfolio-header', '.section-label', '.band', '.partners-label',
   '.page-hero-label', '.ch-label', '.act-number'].forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) { el.classList.add('reveal'); });
  });
  document.querySelectorAll('.section-title, .page-hero-title, .act-title, .ch-title, .cta-title, .page-cta-title').forEach(function(el) {
    el.classList.add('reveal', 'd1');
  });
  document.querySelectorAll('.hero-sub, .page-hero-sub, .act-desc, .ch-sub, .cta-sub, .page-cta-sub').forEach(function(el) {
    el.classList.add('reveal', 'd2');
  });
  document.querySelectorAll('.hero-cta, .cta-actions, .act-cta, .page-hero-pills, .ch-info-row').forEach(function(el) {
    el.classList.add('reveal', 'd3');
  });
  document.querySelectorAll('.process-image-box').forEach(function(el) { el.classList.add('reveal-r'); });
  document.querySelectorAll('.act-visual').forEach(function(el, i) {
    el.classList.add(i % 2 === 0 ? 'reveal-r' : 'reveal-l');
  });
  document.querySelectorAll('.form-card').forEach(function(el) { el.classList.add('reveal-l'); });
  document.querySelectorAll('.contact-sidebar').forEach(function(el) { el.classList.add('reveal-r'); });

  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -44px 0px' });

  document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .reveal-s').forEach(function(el) {
    obs.observe(el);
  });
})();

// ── Animated Counter for band stats ──────────────────────────
(function() {
  function countUp(el, to, duration) {
    var start = performance.now();
    var isInt = Number.isInteger(to);
    function step(now) {
      var p = Math.min((now - start) / duration, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      var val = to * ease;
      el.textContent = isInt ? Math.round(val) : val.toFixed(1);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var target = parseFloat(el.dataset.count);
      if (!isNaN(target)) countUp(el, target, 1600);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function(el) { obs.observe(el); });
})();

// ── 3D Card Tilt (desktop only) ───────────────────────────────
(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.pcard').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = this.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width  - .5) * 7;
      var y = ((e.clientY - rect.top)  / rect.height - .5) * 5;
      this.style.transform = 'translateY(-7px) rotateY(' + x + 'deg) rotateX(' + (-y) + 'deg)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
})();

// ── Magnetic Buttons (desktop only) ──────────────────────────
(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.btn-primary, .btn-white, .btn-portal, .btn-secondary').forEach(function(btn) {
    btn.addEventListener('mousemove', function(e) {
      var rect = this.getBoundingClientRect();
      var x = (e.clientX - rect.left - rect.width  / 2) * .22;
      var y = (e.clientY - rect.top  - rect.height / 2) * .22;
      this.style.transform = 'translate(' + x + 'px, ' + (y - 2) + 'px)';
    });
    btn.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.transition = 'transform .35s cubic-bezier(.16,1,.3,1)';
      setTimeout(function() { btn.style.transition = ''; }, 350);
    });
  });
})();

// ── Back to Top Button ────────────────────────────────────────
(function() {
  var btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Retour en haut');
  btn.innerHTML = '<svg viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
  btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(btn);
  window.addEventListener('scroll', function() {
    btn.classList.toggle('show', window.scrollY > 420);
  }, { passive: true });
})();

// ── Hero title word-by-word animation ─────────────────────────
(function() {
  var titles = document.querySelectorAll('.slide-title, .hero-title');
  titles.forEach(function(title) {
    if (title.querySelector('.hw')) return; // already done
    var html = title.innerHTML;
    // Wrap each word (but not HTML tags)
    title.innerHTML = html.replace(/(<[^>]+>)|(\S+)/g, function(match, tag, word) {
      if (tag) return tag;
      return '<span class="hw" style="animation-delay:' + (Math.random() * .3) + 's">' + word + '</span>';
    });
  });
})();
