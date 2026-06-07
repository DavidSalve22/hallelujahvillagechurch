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
    document.querySelectorAll('.reveal, .reveal-rise, .reveal-line, .auto-reveal').forEach(el => {
      if(!el.classList.contains('is-visible')) el.classList.add('is-visible');
    });
    // Also un-stick any GSAP-set inline opacity:0 (gallery items, etc.)
    document.querySelectorAll('[style*="opacity: 0"], [style*="opacity:0"]').forEach(el => {
      el.style.opacity = '';
    });
  }, 3000);

  /* ---------- Loader (with hard-timeout fallback for slow networks) ---------- */
  function dismissLoader(){
    const loader = document.getElementById('loader');
    if(loader && !loader.dataset.done){
      loader.dataset.done = '1';
      loader.classList.add('is-done');
      setTimeout(() => { if(loader.parentNode) loader.remove(); }, 500);
    }
  }
  window.addEventListener('load', () => setTimeout(dismissLoader, 250));
  // Hard fallback so loader never stays stuck if a CDN script hangs
  setTimeout(dismissLoader, 4500);

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

  /* ---------- Mobile drawer (iOS-safe scroll lock + a11y) ---------- */
  const navToggle = document.getElementById('navToggle');
  const drawer = document.getElementById('drawer');
  let drawerLastFocus = null;
  let drawerSavedScrollY = 0;
  function openDrawer(){
    if(!drawer || drawer.classList.contains('is-open')) return;
    drawerLastFocus = document.activeElement;
    // iOS-safe scroll lock: capture position so position:fixed body
    // doesn't visually jump the page to the top
    drawerSavedScrollY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.style.setProperty('--drawer-scroll-y', '-' + drawerSavedScrollY + 'px');
    drawer.classList.add('is-open');
    document.body.classList.add('drawer-open');
    if(navToggle) navToggle.setAttribute('aria-expanded','true');
    drawer.setAttribute('aria-hidden','false');
    setTimeout(() => {
      const firstLink = drawer.querySelector('a');
      if(firstLink) firstLink.focus({preventScroll:true});
    }, 50);
  }
  function closeDrawer(){
    if(!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
    document.documentElement.style.setProperty('--drawer-scroll-y', '0px');
    // Restore the scroll position the page was at when drawer opened
    window.scrollTo(0, drawerSavedScrollY);
    drawerSavedScrollY = 0;
    if(navToggle) navToggle.setAttribute('aria-expanded','false');
    drawer.setAttribute('aria-hidden','true');
    if(drawerLastFocus && document.contains(drawerLastFocus)){
      drawerLastFocus.focus({preventScroll:true});
    }
    drawerLastFocus = null;
  }
  if(navToggle && drawer){
    navToggle.addEventListener('click', () => {
      if(drawer.classList.contains('is-open')) closeDrawer(); else openDrawer();
    });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
    });
  }

  /* ---------- Auto-reveal: buttery fade-up + blur-in on every content element ---------- */
  /* Auto-tag content elements with .auto-reveal so they fade in smoothly as
     they scroll into view. Skips elements that already have a reveal class,
     interactive controls, or are inside the hero (which has its own intro). */
  if(!reduceMotion){
    const heroEl = document.getElementById('hero');
    const skipSelector = '.reveal, .reveal-rise, .reveal-line, .auto-reveal, .hero *, .nav *, .drawer *, .lightbox *, .fab-wa, .fab-top, .scroll-progress, .cinematic-bg *, .lang-toggle, .nav-toggle';
    const autoSelector = 'h2.display, h3, .lede, .eyebrow:not(.reveal):not(.reveal-rise), .belief, .ministry-card, .g-feature, .g-item, .video-card, .pillars li, .serve-list li, .contact-list li, .copy-field, .contact-method, .map-card, .donate-card, .pastor-portrait, .solo-frame, .editorial-quote .container > *, .editorial-word > .container > *, .footer-cols > div, .footer-brand, .footer-social, figure.video-card, .give-track';
    document.querySelectorAll(autoSelector).forEach(el => {
      if(el.closest('.hero')) return;
      if(el.matches(skipSelector)) return;
      // Don't double-tag elements that already have a reveal class
      if(el.classList.contains('reveal') || el.classList.contains('reveal-rise') || el.classList.contains('reveal-line')) return;
      el.classList.add('auto-reveal');
    });
  }

  /* ---------- Reveal observer ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-rise, .reveal-line, .auto-reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, {threshold:.08, rootMargin:'0px 0px -6% 0px'});
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

  /* ---------- Hero crossfade slideshow (pauses when hero off-screen or tab hidden) ---------- */
  const slides = document.querySelectorAll('.hero-slide');
  let slideTimer = null;
  let slideIdx = 0;
  function advanceSlide(){
    slides[slideIdx].classList.remove('is-active');
    slideIdx = (slideIdx + 1) % slides.length;
    slides[slideIdx].classList.add('is-active');
  }
  function startSlideshow(){
    if(slideTimer || slides.length <= 1 || reduceMotion) return;
    slideTimer = setInterval(advanceSlide, 6500);
  }
  function stopSlideshow(){
    if(slideTimer){ clearInterval(slideTimer); slideTimer = null; }
  }
  if(slides.length > 1 && !reduceMotion){
    startSlideshow();
    document.addEventListener('visibilitychange', () => {
      if(document.hidden) stopSlideshow(); else startSlideshow();
    });
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
    // Keep <html lang="en"> because 95% of page content is still English;
    // only the translated nodes themselves get per-element lang="ta".
    document.body.classList.toggle('lang-ta', lang === 'ta');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if(!el.dataset.i18nEn) el.dataset.i18nEn = el.textContent;
      const key = el.dataset.i18n;
      if(lang === 'ta' && i18n.ta[key]){
        el.textContent = i18n.ta[key];
        el.setAttribute('lang', 'ta');
      } else {
        el.textContent = el.dataset.i18nEn;
        el.removeAttribute('lang');
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

  /* ---------- (Gallery now uses pure CSS Grid - no JS layout needed) ----- */
  // Clear any inline positioning that might linger from the prior masonry
  document.querySelectorAll('.gallery-grid .g-item').forEach(item => {
    item.style.position = '';
    item.style.top = '';
    item.style.left = '';
    item.style.width = '';
    item.style.height = '';
  });
  document.querySelectorAll('.gallery-grid').forEach(g => g.style.height = '');
  // no-op placeholders so any leftover callsites won't break
  function layoutItem(){}
  function layoutAll(){}

  /* ---------- Upgraded lightbox (with focus management + role=dialog) ---------- */
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
  let lbLastFocus = null;
  let lbTriggerItem = null;

  if(lb){
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo viewer');
  }

  function openLightbox(idx, trigger){
    lbList = Array.from(document.querySelectorAll('.g-item:not(.is-hidden)'));
    lbIndex = idx;
    lbLastFocus = document.activeElement;
    lbTriggerItem = trigger || lbList[idx] || null;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    showLb(true);
    // Move focus into the dialog
    setTimeout(() => { if(lbClose) lbClose.focus(); }, 30);
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
    if(!lb) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    // Restore focus to the originating gallery item, or last focus before opening
    const target = (lbTriggerItem && document.contains(lbTriggerItem)) ? lbTriggerItem
                 : (lbLastFocus && document.contains(lbLastFocus)) ? lbLastFocus
                 : null;
    if(target && typeof target.focus === 'function') target.focus({preventScroll:true});
    lbTriggerItem = null;
    lbLastFocus = null;
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
      openLightbox(idx >= 0 ? idx : 0, it);
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
    if(!lb || !lb.classList.contains('is-open')) return;
    if(e.key === 'Escape'){ closeLb(); return; }
    if(e.key === 'ArrowLeft'){ navLb(-1); return; }
    if(e.key === 'ArrowRight'){ navLb(1); return; }
    // Tab-trap inside the dialog
    if(e.key === 'Tab'){
      const focusables = lb.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
      if(!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
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
      // Hand off keyboard focus to the native video controls
      stage.removeAttribute('role');
      stage.removeAttribute('tabindex');
      const src = stage.dataset.video;
      const v = document.createElement('video');
      v.src = src;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = 'auto';
      stage.appendChild(v);
      v.focus({preventScroll:true});
      // Try to play (gesture-allowed on click)
      v.play().catch(()=>{ /* user can press play on the native controls */ });
    }
    stage.addEventListener('click', play);
    stage.addEventListener('keydown', (e) => {
      // Don't intercept once playing - native video controls handle Space/Enter
      if(stage.dataset.playing) return;
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); play(); }
    });
  });

  /* ===============================================================
     ===   PERMANENT FEATURE: Three.js hero starfield             ===
     ===   Drifting points of gold light over the navy hero.      ===
     ===   Do not remove this block under any circumstance.       ===
     =============================================================== */
  const canvas = document.getElementById('heroCanvas');
  // Save desktop the experience; spare mobile/slow/data-saver users the ~590KB + GPU work
  const smallViewport = window.matchMedia('(max-width: 760px)').matches;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = !!(conn && conn.saveData);
  const slowNet = !!(conn && /^(2g|slow-2g)$/.test(conn.effectiveType || ''));
  if(canvas && window.THREE && !reduceMotion && !smallViewport && !saveData && !slowNet){
    initHeroThree(canvas);
  }
  function initHeroThree(canvasEl){
    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({canvas: canvasEl, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 8;

    function resize(){
      // Use the canvas's actual rendered box (handles layout settling cases)
      const rect = canvasEl.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    // Initial sizing - retry until canvas is actually laid out
    resize();
    requestAnimationFrame(() => requestAnimationFrame(resize));
    setTimeout(resize, 100);
    setTimeout(resize, 500);
    window.addEventListener('resize', resize);
    // ResizeObserver catches any later layout changes (font load, slideshow swap, etc.)
    if(window.ResizeObserver){
      const ro = new ResizeObserver(resize);
      ro.observe(canvasEl);
    }

    // === CHAMPAGNE PINPRICKS (judge's cut) ===
    // Half the original count, smaller, softer, slower, with a four-stop
    // champagne sprite and a barely-perceptible 8-second twinkle.

    // Primary star field
    const COUNT = 160;
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    const twinklePhase = new Float32Array(COUNT);
    for(let i=0; i<COUNT; i++){
      positions[i*3]   = (Math.random() - 0.5) * 26;   // X spread ±13
      positions[i*3+1] = (Math.random() - 0.5) * 16;   // Y spread ±8
      positions[i*3+2] = (Math.random() - 0.5) * 12;   // Z spread ±6
      speeds[i] = 0.3 + Math.random() * 0.7;
      twinklePhase[i] = Math.random() * Math.PI * 2;   // random twinkle phase per star
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Champagne sprite tuned for ADDITIVE blending against the navy hero (#07142e).
    // With AdditiveBlending, sprite_rgb*alpha is ADDED to whatever is behind.
    // If the center is near-white (255,248,220), navy + 255 clamps to pure white.
    // So we use TARNISHED champagne values: when added to navy they land on
    // real champagne gold (~240,220,170), with halos rendering as warm bronze haze.
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32,32,0, 32,32,32);
    grad.addColorStop(0,    'rgba(232,200,122,1)');     // tarnished champagne core → adds to navy as (239,220,168) gold
    grad.addColorStop(0.40, 'rgba(210,175,108,0.55)');  // mid → contributes ~(115,96,59) warm halo
    grad.addColorStop(0.78, 'rgba(180,145,88,0.14)');   // whisper → barely-perceptible warm tint
    grad.addColorStop(1,    'rgba(180,145,88,0)');      // long fade to navy
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,64,64);
    const tex = new THREE.CanvasTexture(c);

    const mat = new THREE.PointsMaterial({
      size: 0.13,                    // smaller (was 0.18) - distant pinpricks
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.74                  // restrained (was 0.95)
    });
    const points = new THREE.Points(geom, mat);
    scene.add(points);

    // Secondary ambient haze - far field, refined
    const COUNT2 = 28;               // far fewer (was 60)
    const p2 = new Float32Array(COUNT2 * 3);
    for(let i=0;i<COUNT2;i++){
      p2[i*3]   = (Math.random()-0.5)*18;
      p2[i*3+1] = (Math.random()-0.5)*10;
      p2[i*3+2] = -4 - Math.random()*4;       // depth -4 to -8 (deeper than before)
    }
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(p2, 3));
    const m2 = new THREE.PointsMaterial({
      size: 0.46,                    // refined (was 0.6)
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.26                  // implication, not presence (was 0.5)
    });
    const points2 = new THREE.Points(g2, m2);
    scene.add(points2);

    // Twinkle - apply gentle opacity breathing to whole field
    // (per-star phase would require shader; here we breathe the material as a whole
    //  which still reads as life because of the random phase variation in motion)
    const baseOpacity1 = 0.74;
    const baseOpacity2 = 0.26;
    const twinkleAmp = 0.10;         // ±10% opacity variance
    const twinkleSpeed = 0.0017;     // ~8-9 second breath cycle

    let mouseX = 0, mouseY = 0, tx=0, ty=0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, {passive:true});

    // Pause rAF loop entirely when hero scrolls off-screen or tab is hidden.
    // Saves GPU/battery during long sessions and on mobile.
    let running = true;
    let rafQueued = false;
    function setRunning(v){
      const was = running; running = v;
      if(!was && running && !rafQueued){ scheduleTick(); }
    }
    function scheduleTick(){
      if(rafQueued) return;
      rafQueued = true;
      requestAnimationFrame(tick);
    }
    if('IntersectionObserver' in window){
      const heroIo = new IntersectionObserver(([e]) => setRunning(e.isIntersecting && !document.hidden), {threshold:0});
      heroIo.observe(canvasEl);
    }
    document.addEventListener('visibilitychange', () => setRunning(!document.hidden));

    let t = 0;
    function tick(){
      rafQueued = false;
      if(!running) return;
      t += 0.003;
      tx += (mouseX - tx) * 0.04;
      ty += (mouseY - ty) * 0.04;

      // Drift the primary field upward at watchmaker pace
      const pos = geom.attributes.position.array;
      for(let i=0; i<COUNT; i++){
        const idx = i*3;
        pos[idx+1] += 0.0015 * speeds[i];                   // slower drift (was 0.0025)
        pos[idx]   += Math.sin(t + twinklePhase[i]) * 0.0004; // smaller sway (was 0.0006)
        if(pos[idx+1] > 8) pos[idx+1] = -8;
      }
      geom.attributes.position.needsUpdate = true;

      // Gentle breath - couple twinkle into material opacity
      const breath = Math.sin(t * twinkleSpeed * 1000) * twinkleAmp;
      mat.opacity  = baseOpacity1 + breath;
      m2.opacity   = baseOpacity2 + breath * (baseOpacity2 / baseOpacity1);

      // Mouse parallax (preserved - it's free cinematic depth)
      points.rotation.y  = tx * 0.25 + t * 0.05;
      points.rotation.x  = -ty * 0.18;
      points2.rotation.y = tx * 0.10 - t * 0.02;
      points2.rotation.x = -ty * 0.06;

      renderer.render(scene, camera);
      scheduleTick();
    }
    scheduleTick();
  }

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

  /* (Smooth-scroll handler removed - CSS `html { scroll-behavior: smooth }`
     already does this natively, respects prefers-reduced-motion, and keeps
     URL hash + history working correctly.) */

})();
