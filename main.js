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

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const hero = document.getElementById('hero');

  function updateNav(){
    const y = window.scrollY;
    if(y > 24) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');

    if(hero){
      const heroBottom = hero.offsetTop + hero.offsetHeight - 80;
      if(y < heroBottom) nav.classList.add('is-light');
      else nav.classList.remove('is-light');
    }
  }
  updateNav();
  window.addEventListener('scroll', updateNav, {passive:true});

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

  /* ---------- Gallery filter ---------- */
  const tabs = document.querySelectorAll('.g-tab');
  const items = document.querySelectorAll('.g-item');

  // Decorative bento sizes for gallery
  items.forEach((el, i) => {
    if(i % 7 === 0) el.classList.add('is-tall');
    if(i % 11 === 3) el.classList.add('is-wide');
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.filter;
      items.forEach(item => {
        const match = cat === 'all' || item.dataset.cat === cat;
        item.classList.toggle('is-hidden', !match);
      });
      if(window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  let lbIndex = 0;
  let lbList = [];

  function openLightbox(idx){
    lbList = Array.from(document.querySelectorAll('.g-item:not(.is-hidden)'));
    lbIndex = idx;
    showLb();
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function showLb(){
    const item = lbList[lbIndex];
    if(!item) return;
    lbImg.src = item.getAttribute('href');
    const altImg = item.querySelector('img');
    lbImg.alt = altImg ? altImg.alt : '';
  }
  function closeLb(){
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  function navLb(d){
    if(!lbList.length) return;
    lbIndex = (lbIndex + d + lbList.length) % lbList.length;
    showLb();
  }

  items.forEach((it, i) => {
    it.addEventListener('click', (e) => {
      e.preventDefault();
      // recompute index against visible list
      const visible = Array.from(document.querySelectorAll('.g-item:not(.is-hidden)'));
      const idx = visible.indexOf(it);
      openLightbox(idx >= 0 ? idx : 0);
    });
  });
  if(lbClose) lbClose.addEventListener('click', closeLb);
  if(lbPrev) lbPrev.addEventListener('click', () => navLb(-1));
  if(lbNext) lbNext.addEventListener('click', () => navLb(1));
  if(lb) lb.addEventListener('click', (e) => { if(e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if(!lb.classList.contains('is-open')) return;
    if(e.key === 'Escape') closeLb();
    if(e.key === 'ArrowLeft') navLb(-1);
    if(e.key === 'ArrowRight') navLb(1);
  });

  /* ---------- Copy PayPal email ---------- */
  const copyBtn = document.getElementById('copyBtn');
  const paypalEmail = document.getElementById('paypalEmail');
  if(copyBtn && paypalEmail){
    copyBtn.addEventListener('click', async () => {
      const text = paypalEmail.textContent.trim();
      try{
        await navigator.clipboard.writeText(text);
      } catch(_){
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch(__){}
        document.body.removeChild(ta);
      }
      copyBtn.classList.add('is-copied');
      const label = copyBtn.querySelector('.copy-label');
      const old = label ? label.textContent : '';
      if(label) label.textContent = 'Copied';
      setTimeout(() => {
        copyBtn.classList.remove('is-copied');
        if(label) label.textContent = old || 'Copy';
      }, 1800);
    });
  }

  /* ---------- Three.js hero — drifting points of light ---------- */
  const canvas = document.getElementById('heroCanvas');
  if(canvas && window.THREE && !reduceMotion){
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
      const w = canvasEl.clientWidth;
      const h = canvasEl.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    // Star/sparkle field
    const COUNT = 320;
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for(let i=0; i<COUNT; i++){
      positions[i*3]   = (Math.random() - 0.5) * 22;
      positions[i*3+1] = (Math.random() - 0.5) * 14;
      positions[i*3+2] = (Math.random() - 0.5) * 10;
      speeds[i] = 0.3 + Math.random() * 0.7;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Round sprite texture
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32,32,0, 32,32,32);
    grad.addColorStop(0, 'rgba(255,225,170,1)');
    grad.addColorStop(0.4, 'rgba(214,168,104,0.55)');
    grad.addColorStop(1, 'rgba(214,168,104,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,64,64);
    const tex = new THREE.CanvasTexture(c);

    const mat = new THREE.PointsMaterial({
      size: 0.18,
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.95
    });
    const points = new THREE.Points(geom, mat);
    scene.add(points);

    // Secondary slow ring of larger soft particles
    const COUNT2 = 60;
    const p2 = new Float32Array(COUNT2 * 3);
    for(let i=0;i<COUNT2;i++){
      p2[i*3] = (Math.random()-0.5)*18;
      p2[i*3+1] = (Math.random()-0.5)*10;
      p2[i*3+2] = -2 - Math.random()*4;
    }
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(p2, 3));
    const m2 = new THREE.PointsMaterial({
      size: 0.6, map: tex, transparent:true, depthWrite:false,
      blending: THREE.AdditiveBlending, opacity: 0.5
    });
    const points2 = new THREE.Points(g2, m2);
    scene.add(points2);

    let mouseX = 0, mouseY = 0, tx=0, ty=0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, {passive:true});

    let t = 0;
    function tick(){
      t += 0.003;
      // ease mouse
      tx += (mouseX - tx) * 0.04;
      ty += (mouseY - ty) * 0.04;

      const pos = geom.attributes.position.array;
      for(let i=0; i<COUNT; i++){
        const idx = i*3;
        pos[idx+1] += 0.0025 * speeds[i];           // drift upward
        pos[idx]   += Math.sin(t + i) * 0.0006;     // sway sideways
        if(pos[idx+1] > 7) pos[idx+1] = -7;          // wrap
      }
      geom.attributes.position.needsUpdate = true;

      points.rotation.y = tx * 0.25 + t * 0.05;
      points.rotation.x = -ty * 0.18;
      points2.rotation.y = tx * 0.10 - t * 0.02;
      points2.rotation.x = -ty * 0.06;

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();
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
