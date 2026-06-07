/* Hallelujah Village Church Trust — main.js */

(function(){
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Enable JS-only hidden state ----------
     Reveals only start hidden once this class is set. If the script
     fails to run for any reason, content stays fully visible. */
  document.body.classList.add('js-ready');

  /* ---------- Safety net: force-reveal any stuck content ----------
     After 3s any element with a reveal class that hasn't fired
     gets is-visible, so a missed observer never leaves text invisible. */
  setTimeout(() => {
    document.querySelectorAll('.reveal, .reveal-rise, .reveal-line').forEach(el => {
      if(!el.classList.contains('is-visible')) el.classList.add('is-visible');
    });
    // Also un-stick any GSAP-set inline opacity:0 (gallery items, etc.)
    document.querySelectorAll('[style*="opacity: 0"], [style*="opacity:0"]').forEach(el => {
      el.style.opacity = '';
    });
  }, 3000);

  /* ---------- Loader ---------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if(loader){
      setTimeout(() => loader.classList.add('is-done'), 250);
      setTimeout(() => loader.remove(), 1000);
    }
  });

  /* ---------- Year ---------- */
  const yEl = document.getElementById('year');
  if(yEl) yEl.textContent = new Date().getFullYear();

  /* ---------- Nav scroll state + scroll progress bar ---------- */
  const nav = document.getElementById('nav');
  const hero = document.getElementById('hero');
  const progressEl = document.getElementById('scrollProgress');

  function updateNav(){
    const y = window.scrollY;
    if(y > 24) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');

    if(hero){
      const heroBottom = hero.offsetTop + hero.offsetHeight - 80;
      if(y < heroBottom) nav.classList.add('is-light');
      else nav.classList.remove('is-light');
    }

    // Scroll progress (21st.dev: Progress Bar pattern)
    if(progressEl){
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const p = docH > 0 ? Math.min(1, Math.max(0, y / docH)) : 0;
      progressEl.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
  }
  updateNav();
  window.addEventListener('scroll', updateNav, {passive:true});
  window.addEventListener('resize', updateNav, {passive:true});

  /* ---------- Mobile drawer ---------- */
  const navToggle = document.getElementById('navToggle');
  const drawer = document.getElementById('drawer');
  if(navToggle && drawer){
    navToggle.addEventListener('click', () => {
      const open = drawer.classList.toggle('is-open');
      document.body.classList.toggle('drawer-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
    });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      document.body.classList.remove('drawer-open');
      navToggle.setAttribute('aria-expanded','false');
    }));
  }

  /* ---------- Reveal observer (fallback) ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-rise, .reveal-line');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Hero title reveal (lines) ---------- */
  const titleLines = document.querySelectorAll('.hero-title .line');
  titleLines.forEach((line, i) => {
    setTimeout(() => {
      const inner = line.querySelector('span');
      if(inner){
        inner.style.transition = 'transform 1.05s cubic-bezier(.7,0,.2,1)';
        inner.style.transform = 'translateY(0)';
      }
    }, 250 + i * 140);
  });

  /* ---------- GSAP ScrollTrigger enhancements ---------- */
  if(window.gsap && window.ScrollTrigger && !reduceMotion){
    gsap.registerPlugin(ScrollTrigger);

    // Parallax for stacked frames
    gsap.utils.toArray('.stacked-frame img').forEach(img => {
      gsap.to(img, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: img,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    // Parallax for floating frame
    gsap.utils.toArray('.floating-frame').forEach(el => {
      gsap.fromTo(el, {y: 40}, {
        y: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    // Ministry cards stagger (using existing reveal-rise classes)
    gsap.utils.toArray('.ministries-grid').forEach(grid => {
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          grid.querySelectorAll('.ministry-card').forEach((card, i) => {
            setTimeout(() => card.classList.add('is-visible'), i * 80);
          });
        }
      });
    });

    // Gallery items subtle stagger
    gsap.utils.toArray('.gallery-grid').forEach(grid => {
      const items = grid.querySelectorAll('.g-item');
      gsap.set(items, {opacity: 0, y: 18});
      ScrollTrigger.create({
        trigger: grid, start: 'top 80%', once: true,
        onEnter: () => {
          gsap.to(items, {opacity: 1, y: 0, duration: .7, stagger: .035, ease: 'power2.out'});
        }
      });
    });

    // Subtle drift of donate-card-bg
    const donateBg = document.querySelector('.donate-card-bg');
    if(donateBg){
      gsap.to(donateBg, {
        backgroundPosition: '60% 100%, 40% 0%, 100% 0%',
        ease: 'none',
        scrollTrigger: { trigger: '.donate', start:'top bottom', end:'bottom top', scrub: true }
      });
    }
  }

  /* ---------- Hero crossfade slideshow ---------- */
  const slides = document.querySelectorAll('.hero-slide');
  if(slides.length > 1 && !reduceMotion){
    let slideIdx = 0;
    setInterval(() => {
      slides[slideIdx].classList.remove('is-active');
      slideIdx = (slideIdx + 1) % slides.length;
      slides[slideIdx].classList.add('is-active');
    }, 6500);
  }

  /* ---------- Back to top button ---------- */
  const fabTop = document.getElementById('fabTop');
  if(fabTop){
    function toggleFab(){
      if(window.scrollY > 600) fabTop.classList.add('is-visible');
      else fabTop.classList.remove('is-visible');
    }
    toggleFab();
    window.addEventListener('scroll', toggleFab, {passive:true});
    fabTop.addEventListener('click', () => {
      window.scrollTo({top:0, behavior: reduceMotion ? 'auto' : 'smooth'});
    });
  }

  /* ---------- Scroll-spy active nav highlighting ---------- */
  const navLinkEls = document.querySelectorAll('.nav-links a[href^="#"]');
  if(navLinkEls.length && 'IntersectionObserver' in window){
    const linkMap = new Map();
    navLinkEls.forEach(a => {
      const id = a.getAttribute('href').slice(1);
      const sec = document.getElementById(id);
      if(sec) linkMap.set(sec, a);
    });
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const a = linkMap.get(e.target);
        if(!a) return;
        if(e.isIntersecting){
          navLinkEls.forEach(l => l.classList.remove('is-current'));
          a.classList.add('is-current');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    linkMap.forEach((_, sec) => spy.observe(sec));
  }

  /* ---------- Tamil / English translation toggle ---------- */
  const i18n = {
    ta: {
      'nav.about': 'பற்றி',
      'nav.mission': 'நோக்கம்',
      'nav.ministries': 'ஊழியங்கள்',
      'nav.beliefs': 'நம்பிக்கைகள்',
      'nav.sponsor': 'ஆதரவு',
      'nav.visit': 'வருகை',
      'nav.gallery': 'படத்தொகுப்பு',
      'nav.videos': 'காணொளிகள்',
      'nav.faq': 'கேள்விகள்',
      'nav.contact': 'தொடர்பு',
      'nav.donate': 'கொடை',
      'drawer.sponsor': 'குழந்தைக்கு ஆதரவு',
      'drawer.visit': 'ஊழியப் பயணம்',
      'hero.eyebrow': 'பெந்தெகோஸ்தே ஊழியம் · வேலூர், தமிழ்நாடு',
      'hero.cta.donate': 'கொடை',
      'hero.cta.sponsor': 'குழந்தைக்கு ஆதரவளியுங்கள்'
    }
  };

  const langToggle = document.getElementById('langToggle');
  function applyLang(lang){
    document.documentElement.lang = (lang === 'ta') ? 'ta' : 'en';
    document.body.classList.toggle('lang-ta', lang === 'ta');
    // Cache original English text once
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if(!el.dataset.i18nEn) el.dataset.i18nEn = el.textContent;
      const key = el.dataset.i18n;
      if(lang === 'ta' && i18n.ta[key]){
        el.textContent = i18n.ta[key];
      } else {
        el.textContent = el.dataset.i18nEn;
      }
    });
    if(langToggle){
      langToggle.querySelectorAll('[data-lang]').forEach(s => {
        s.classList.toggle('is-active', s.dataset.lang === lang);
      });
    }
  }
  let savedLang = 'en';
  try { savedLang = localStorage.getItem('hvct-lang') || 'en'; } catch(_){}
  applyLang(savedLang);
  if(langToggle){
    langToggle.addEventListener('click', () => {
      const next = document.body.classList.contains('lang-ta') ? 'en' : 'ta';
      try { localStorage.setItem('hvct-lang', next); } catch(_){}
      applyLang(next);
    });
  }

  /* ---------- Magnetic Donate button (21st.dev: Magnetic Button) ---------- */
  /* Subtle damped translate toward cursor; disabled on touch + reduced motion */
  const donateBtn = document.querySelector('.btn-donate-hero');
  if(donateBtn && !reduceMotion && window.matchMedia('(hover: hover)').matches){
    const STRENGTH = 0.22;       // how much of the offset to follow
    const MAX = 14;              // px hard limit
    let target = {x:0, y:0};
    let current = {x:0, y:0};
    let raf = null;
    let active = false;

    function tick(){
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      donateBtn.style.setProperty('--mx', current.x.toFixed(2) + 'px');
      donateBtn.style.setProperty('--my', current.y.toFixed(2) + 'px');
      if(Math.abs(current.x - target.x) > 0.05 || Math.abs(current.y - target.y) > 0.05){
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }
    function start(){ if(!raf) raf = requestAnimationFrame(tick); }

    donateBtn.addEventListener('mouseenter', () => { active = true; donateBtn.classList.add('is-magnetic'); });
    donateBtn.addEventListener('mousemove', (e) => {
      if(!active) return;
      const r = donateBtn.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top + r.height/2;
      target.x = Math.max(-MAX, Math.min(MAX, (e.clientX - cx) * STRENGTH));
      target.y = Math.max(-MAX, Math.min(MAX, (e.clientY - cy) * STRENGTH));
      start();
    });
    donateBtn.addEventListener('mouseleave', () => {
      active = false;
      target.x = 0; target.y = 0;
      donateBtn.classList.remove('is-magnetic');
      start();
    });
  }

  /* ---------- Spotlight cards (21st.dev: Spotlight Card) ---------- */
  /* Update --mx/--my CSS vars on mousemove; cards have a radial gradient overlay */
  function attachSpotlight(selector){
    if(reduceMotion) return;
    document.querySelectorAll(selector).forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }
  attachSpotlight('.ministry-card');
  attachSpotlight('.give-track');

  /* ---------- Gallery items (no tabs in new design) ---------- */
  const items = document.querySelectorAll('.g-item');

  /* ---------- Lazy fade-in for gallery images ---------- */
  const galleryImgs = document.querySelectorAll('.g-item img');
  galleryImgs.forEach(img => {
    img.classList.add('is-loading');
    const settle = () => {
      img.classList.remove('is-loading');
      img.classList.add('is-loaded');
      layoutItem(img.closest('.g-item'));
    };
    if(img.complete && img.naturalWidth > 0){
      settle();
    } else {
      img.addEventListener('load', settle, {once:true});
      img.addEventListener('error', () => img.classList.remove('is-loading'), {once:true});
    }
  });

  /* ---------- True Pinterest masonry layout (no crop, no gaps) ---------- */
  /* Each item snaps into the shortest column. Items are absolutely
     positioned at the column's current top, sized to the column width
     and the photo's natural aspect ratio. No row alignment, no gaps. */
  function layoutGrid(grid){
    if(!grid || grid.classList.contains('gallery-grid--single')) return;
    const cs = getComputedStyle(grid);
    const cols = parseInt(cs.getPropertyValue('--cols')) || 4;
    const gap = parseFloat(cs.getPropertyValue('--gap')) || 14;
    const gridW = grid.getBoundingClientRect().width;
    if(!gridW) return;
    const colW = (gridW - gap * (cols - 1)) / cols;
    const colTops = new Array(cols).fill(0);
    const items = grid.querySelectorAll('.g-item');
    items.forEach(item => {
      const img = item.querySelector('img');
      if(!img || !img.naturalWidth || !img.naturalHeight) return;
      const itemH = (img.naturalHeight / img.naturalWidth) * colW;
      // Find the shortest column
      let minCol = 0;
      for(let i = 1; i < cols; i++){
        if(colTops[i] < colTops[minCol] - 0.5) minCol = i;
      }
      item.style.width = colW + 'px';
      item.style.height = itemH + 'px';
      item.style.left = (minCol * (colW + gap)) + 'px';
      item.style.top = colTops[minCol] + 'px';
      colTops[minCol] += itemH + gap;
    });
    grid.style.height = Math.max(...colTops, 0) + 'px';
  }
  function layoutItem(item){
    const grid = item.closest('.gallery-grid');
    if(grid) layoutGrid(grid);
  }
  function layoutAll(){
    document.querySelectorAll('.gallery-grid:not(.gallery-grid--single)').forEach(layoutGrid);
  }
  layoutAll();
  let layoutRaf = null;
  window.addEventListener('resize', () => {
    if(layoutRaf) cancelAnimationFrame(layoutRaf);
    layoutRaf = requestAnimationFrame(layoutAll);
  }, {passive:true});

  /* ---------- Upgraded lightbox ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const lbSection = document.getElementById('lbSection');
  const lbCount = document.getElementById('lbCount');
  const lbCaption = document.getElementById('lbCaption');
  let lbIndex = 0;
  let lbList = [];

  function openLightbox(idx){
    lbList = Array.from(document.querySelectorAll('.g-item:not(.is-hidden)'));
    lbIndex = idx;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    showLb(true);
  }
  function showLb(initial){
    const item = lbList[lbIndex];
    if(!item) return;
    // Crossfade: take down, swap, fade back up
    lbImg.classList.remove('is-loaded');
    const newSrc = item.getAttribute('href');
    const alt = item.querySelector('img');
    // Update meta now (instant)
    const sectionEl = item.closest('.gallery-section');
    const sectionName = sectionEl ? (sectionEl.dataset.section || sectionEl.querySelector('.gallery-section-title')?.textContent || '') : '';
    if(lbSection) lbSection.textContent = sectionName;
    if(lbCount) lbCount.textContent = String(lbIndex + 1).padStart(2,'0') + ' / ' + String(lbList.length).padStart(2,'0');
    if(lbCaption) lbCaption.textContent = item.dataset.caption || (alt ? alt.alt : '');

    const swap = () => {
      lbImg.src = newSrc;
      lbImg.alt = alt ? alt.alt : '';
      const onload = () => {
        requestAnimationFrame(() => lbImg.classList.add('is-loaded'));
        lbImg.removeEventListener('load', onload);
      };
      if(lbImg.complete && lbImg.naturalWidth > 0){
        onload();
      } else {
        lbImg.addEventListener('load', onload);
      }
    };
    if(initial){
      swap();
    } else {
      setTimeout(swap, 220);
    }
  }
  function closeLb(){
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  function navLb(d){
    if(!lbList.length) return;
    lbIndex = (lbIndex + d + lbList.length) % lbList.length;
    showLb(false);
  }

  items.forEach((it) => {
    it.addEventListener('click', (e) => {
      e.preventDefault();
      const visible = Array.from(document.querySelectorAll('.g-item:not(.is-hidden)'));
      const idx = visible.indexOf(it);
      openLightbox(idx >= 0 ? idx : 0);
    });
  });
  if(lbClose) lbClose.addEventListener('click', closeLb);
  if(lbPrev) lbPrev.addEventListener('click', () => navLb(-1));
  if(lbNext) lbNext.addEventListener('click', () => navLb(1));
  if(lb) lb.addEventListener('click', (e) => {
    // Close only when clicking the backdrop, not when clicking image/controls
    if(e.target === lb || e.target.classList.contains('lb-stage') || e.target.classList.contains('lb-bottom')) closeLb();
  });
  document.addEventListener('keydown', (e) => {
    if(!lb.classList.contains('is-open')) return;
    if(e.key === 'Escape') closeLb();
    if(e.key === 'ArrowLeft') navLb(-1);
    if(e.key === 'ArrowRight') navLb(1);
  });

  /* Swipe gestures for lightbox on touch devices */
  if(lb){
    let touchX = 0, touchY = 0, touching = false;
    lb.addEventListener('touchstart', (e) => {
      if(!lb.classList.contains('is-open') || e.touches.length !== 1) return;
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
      touching = true;
    }, {passive:true});
    lb.addEventListener('touchend', (e) => {
      if(!touching) return;
      touching = false;
      const dx = e.changedTouches[0].clientX - touchX;
      const dy = e.changedTouches[0].clientY - touchY;
      if(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)){
        navLb(dx < 0 ? 1 : -1);
      } else if(dy > 80 && Math.abs(dy) > Math.abs(dx)){
        // Swipe down to close
        closeLb();
      }
    });
  }

  /* ---------- Generalized copy buttons ---------- */
  async function copyText(text){
    try{
      await navigator.clipboard.writeText(text);
      return true;
    } catch(_){
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch(__){}
      document.body.removeChild(ta);
      return ok;
    }
  }
  document.querySelectorAll('.copy-btn[data-copy-target]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copyTarget;
      const ok = await copyText(text);
      if(!ok) return;
      btn.classList.add('is-copied');
      const labelEl = btn.querySelector('span');
      const old = labelEl ? labelEl.textContent : '';
      if(labelEl) labelEl.textContent = 'Copied';
      setTimeout(() => {
        btn.classList.remove('is-copied');
        if(labelEl) labelEl.textContent = old || 'Copy';
      }, 1800);
    });
  });

  /* ---------- Cinematic video player: click-to-load ---------- */
  /* Videos don't download until the user actually presses play.
     Keeps the page lightweight - posters are already on the page. */
  document.querySelectorAll('.video-stage').forEach(stage => {
    function play(){
      if(stage.dataset.playing) return;
      stage.dataset.playing = 'true';
      stage.classList.add('is-playing');
      const src = stage.dataset.video;
      const v = document.createElement('video');
      v.src = src;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = 'auto';
      stage.appendChild(v);
      // Try to play (gesture-allowed on click)
      v.play().catch(()=>{ /* user can press play on the native controls */ });
    }
    stage.addEventListener('click', play);
    stage.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); play(); }
    });
  });

  /* ---------- Scroll-driven parallax on key hero photos ---------- */
  /* Subtle: photo wrapper translates within its overflow:hidden frame
     at ~16% the scroll speed of the surrounding text. */
  const parallaxFrames = Array.from(document.querySelectorAll('.parallax-frame'));
  let parallaxRaf = null;
  function updateParallax(){
    if(reduceMotion) return;
    const vh = window.innerHeight;
    parallaxFrames.forEach(frame => {
      const inner = frame.querySelector('.parallax-inner');
      if(!inner) return;
      const rect = frame.getBoundingClientRect();
      if(rect.bottom < -100 || rect.top > vh + 100){ return; }
      // Progress: 0 when frame entering bottom of viewport, 1 when leaving top.
      const progress = (vh - rect.top) / (vh + rect.height);
      // Translate range: ~10% of the frame height total swing (subtle).
      const translateY = (0.5 - progress) * rect.height * 0.18;
      inner.style.transform = 'translate3d(0,' + translateY.toFixed(1) + 'px,0)';
    });
  }
  function scheduleParallax(){
    if(parallaxRaf) return;
    parallaxRaf = requestAnimationFrame(() => {
      parallaxRaf = null;
      updateParallax();
    });
  }
  if(parallaxFrames.length && !reduceMotion){
    updateParallax();
    window.addEventListener('scroll', scheduleParallax, {passive:true});
    window.addEventListener('resize', scheduleParallax, {passive:true});
  }

  /* ---------- Smooth-scroll polyfill enhancement ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if(id.length > 1){
        const target = document.querySelector(id);
        if(target){
          e.preventDefault();
          target.scrollIntoView({behavior:'smooth', block:'start'});
        }
      }
    });
  });

})();
