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
  /* Tamil translations: 238 entries covering every visible English string.
     Scripture from Tamil OV Bible (1860). Pastor T. John Ravi Chandran to review
     tamil-review.md before going live. Proper names (HVCT, John, Vellore, etc.)
     intentionally kept in English where natural in Indian Pentecostal usage. */
  const i18n = {
    ta: {
      // === about ===
      'about.body1': 'கிறிஸ்துவின் சரீரமாகிய சபையின் ஒற்றுமையைக் காத்து, வேதாகம கொள்கைகளை உயர்த்திப் பிடித்து, பரிசுத்த ஆவியின் ஞானஸ்நானத்தைக் (Acts 2:4) கனப்படுத்த நாங்கள் உழைக்கிறோம். சிறியவர்களிலும், மிகுந்த தேவையுள்ளவர்களிலுமே எங்கள் ஊழியம் — விதவைகள், அநாதைக் குழந்தைகள், கிராமப்புற போதகர்கள், குஷ்டரோகிகள், முதியோர்கள், மற்றும் ஞாயிறு பள்ளி குழந்தைகளின் மத்தியில்.',
      'about.body2': 'அவசரமான மூன்று ஊழியங்களில் — கிராமப்புற போதகர்களுக்கான தலைமைத்துவப் பயிற்சி, அநாதைக் குழந்தைகளுக்கான கல்வி, மற்றும் விதவைகளுக்கும் வேதாகம ஸ்திரீகளுக்குமான தொடர் ஊழியம் — உங்கள் ஜெபத்தையும் கூட்டுறவையும் கேட்கிறோம்.',
      'about.eyebrow': 'HVCT பற்றி',
      'about.lede': 'Hallelujah Village Church Trust என்பது தேவனுடைய கிருபையின் கீழும், பரிசுத்த ஆவியானவரின் வெளிச்சத்தின் கீழும் கூடிவந்திருக்கும் ஒரு பெந்தெகோஸ்தே ஐக்கியமாகும். மாற்கு 16:15-ல் உள்ள மகா கட்டளையே — "நீங்கள் உலகமெங்கும்போய், சர்வசிருஷ்டிக்கும் சுவிசேஷத்தைப் பிரசங்கியுங்கள்" — எங்கள் இருதயத்தின் துடிப்பாக இருக்கிறது.',
      'about.markCite': '— மாற்கு 16:15',
      'about.markVerse': 'நீங்கள் உலகமெங்கும்போய், சர்வசிருஷ்டிக்கும் சுவிசேஷத்தைப் பிரசங்கியுங்கள்.',
      'about.photoCaption': '"இயேசு கிறிஸ்துவின் நாமத்தில் ஒன்றுசேர்ந்த, உண்மையுள்ள கிறிஸ்தவர்களின் சகோதரத்துவம்."',
      'about.pillar1': 'கிராமப்புற போதகர்களுக்கான தலைமைத்துவப் பயிற்சி',
      'about.pillar2': 'அநாதைக் குழந்தைகளுக்கான கல்வி',
      'about.pillar3': 'விதவைகளுக்கும் வேதாகம ஸ்திரீகளுக்குமான பராமரிப்பு',
      'about.title': 'இயேசுவின் நாமத்தில் ஒன்றுசேர்ந்த, உண்மையுள்ள கிறிஸ்தவர்களின் சகோதரத்துவம்.',

      // === belief1 ===
      'belief1.body': 'பரிசுத்த வேதாகமம், தேவ ஏவுதலினால் அருளப்பட்ட தேவ வசனமாகும்; இது பரிசுத்த ஆவியானவரால் ஏவப்பட்டு பேசிய, எழுதிய பூர்வீக பரிசுத்தவான்களின் ஊழியத்தின் பலனாகும். புதிய ஏற்பாட்டில் பதிவு செய்யப்பட்டிருக்கும் புதிய உடன்படிக்கையை, நடக்கையிலும் உபதேசத்திலும் தவறாத வழிகாட்டியாக நாங்கள் ஏற்றுக்கொள்கிறோம்.',
      'belief1.num': 'i',
      'belief1.refs': '2 Tim. 3:16 · 1 Thess. 2:13 · 2 Peter 1:21',
      'belief1.title': 'வேதாகமம்',

      // === belief2 ===
      'belief2.body': 'எங்கள் தேவன் ஒருவரே; ஆனால் சமமான மூன்று நபராக — பிதா, குமாரன், பரிசுத்த ஆவியானவர் — வெளிப்பட்டிருக்கிறார். பிதாவானவர் எல்லாரிலும் பெரியவர்; வார்த்தையை அனுப்பினவரும், ஜனிப்பித்தவரும் ஆவார். குமாரனாகிய இயேசுகிறிஸ்து, மாம்சமான வார்த்தை; ஆதிமுதல் பிதாவோடிருந்த ஏகசுதனாகிய அவரே. பரிசுத்த ஆவியானவர் பிதாவினிடத்திலிருந்தும் குமாரனிடத்திலிருந்தும் புறப்படுகிறவர்; நித்தியமானவர்.',
      'belief2.num': 'ii',
      'belief2.refs': 'Deut. 6:4 · Phil. 2:6 · John 14:28 · John 16:28 · John 1:1, 14, 18 · John 14:16 · John 15:26',
      'belief2.title': 'திரித்துவம்',

      // === belief3 ===
      'belief3.body': 'மனிதன் தேவனுடைய சாயலிலும், சொரூபத்திலும் உண்டாக்கப்பட்ட சிருஷ்டியாயிருக்கிறான்; ஆனாலும் ஆதாமின் மீறுதலாலும் வீழ்ச்சியாலும் பாவம் உலகத்தில் பிரவேசித்தது. "எல்லாரும் பாவஞ்செய்து, தேவமகிமையற்றவர்களாகியிருக்கிறார்கள்." தேவகுமாரனாகிய இயேசுகிறிஸ்து பிசாசின் கிரியைகளை அழிக்கும்படிக்கு வெளிப்பட்டார்; மனிதனை மீட்டு தேவனிடத்தில் சேர்க்கும்படி தம்முடைய ஜீவனைக் கொடுத்து இரத்தத்தைச் சிந்தினார். இரட்சிப்பு என்பது கிரியைகளையும் நியாயப்பிரமாணத்தையும் சாராமல், இயேசுகிறிஸ்துவின்மேலுள்ள விசுவாசத்தினாலே, கிருபையினாலே மனிதனுக்குக் கொடுக்கப்பட்ட தேவ வரம்; அது தேவனுக்கு ஏற்றதான கிரியைகளை உண்டாக்குகிறது.',
      'belief3.num': 'iii',
      'belief3.refs': 'Rom. 3:10, 23 · Rom. 5:14 · 1 John 3:8 · Eph. 2:8–10',
      'belief3.title': 'மனிதன், அவன் வீழ்ச்சி மற்றும் மீட்பு',

      // === belief4 ===
      'belief4.body': 'மனிதன் இரட்சிப்பை நோக்கி எடுக்கும் முதல் படி, மனந்திரும்புதலை உண்டாக்குகிற தேவ துக்கமாகும். மறுபிறப்பு எல்லா மனிதருக்கும் அவசியம்; அதை அனுபவிக்கும்போது நித்திய ஜீவன் உண்டாகும்.',
      'belief4.num': 'iv',
      'belief4.refs': '2 Cor. 7:10 · John 3:3–5 · 1 John 5:12',
      'belief4.title': 'நித்திய ஜீவனும் மறுபிறப்பும்',

      // === belief5 ===
      'belief5.body': 'ஜல ஞானஸ்நானம் முழுக்காட்டுதலின் மூலமாக நிறைவேற்றப்படுவதாகும்; இது நம்முடைய கர்த்தர் நேரடியாகக் கொடுத்த கட்டளை; இது விசுவாசிகளுக்கு மட்டுமே உரியது. இந்த சடங்கு, கிறிஸ்தவன் கிறிஸ்துவின் மரணம், அடக்கம், உயிர்த்தெழுதலில் ஐக்கியப்படுகிறான் என்பதற்கான அடையாளமாகும். ஞானஸ்நான ஆகமம்: "தேவகுமாரனாகிய கர்த்தராகிய இயேசுகிறிஸ்துவின்மேல் உள்ள உமது விசுவாசத்தின் அறிக்கையின்பேரில், அவருடைய அதிகாரத்தினாலே, பிதா, குமாரன், பரிசுத்த ஆவியின் நாமத்தினாலே நான் உமக்கு ஞானஸ்நானம் கொடுக்கிறேன். ஆமென்."',
      'belief5.num': 'v',
      'belief5.refs': 'Matt. 28:19 · Rom. 6:4 · Col. 2:12 · Acts 8:36–39',
      'belief5.title': 'ஜல ஞானஸ்நானம்',

      // === belief6 ===
      'belief6.body': 'பரிசுத்த ஆவியினாலும் அக்கினியினாலும் ஆகிய ஞானஸ்நானம், கர்த்தராகிய இயேசுகிறிஸ்துவினால் இக்காலத்தில் எல்லா விசுவாசிகளுக்கும் வாக்குப்பண்ணப்பட்ட தேவ வரமாகும்; இது மறுபிறப்புக்குப் பிற்பாடு பெறப்படுகிறது. இந்த அனுபவத்திற்கு உரிய முதற்சாட்சி, பரிசுத்த ஆவியானவர் தாமே பேசத் தந்தருளுகிறபடி அந்நிய பாஷைகளைப் பேசுவதாகும்.',
      'belief6.num': 'vi',
      'belief6.refs': 'Matt. 3:11 · John 14:16,17 · Acts 1:8 · Acts 2:1–4, 38–39 · Acts 19:1–7',
      'belief6.title': 'பரிசுத்த ஆவியின் ஞானஸ்நானம்',

      // === belief7 ===
      'belief7.body': 'பரிசுத்தமில்லாமல் ஒருவனும் கர்த்தரைத் தரிசிக்கமாட்டான். பரிசுத்தமாக்கப்படுதல் என்பது மறுபிறப்பின் வேளையில் ஆரம்பித்து, கிறிஸ்துவின் வருகையில் இரட்சிப்பு பூரணமாகும்வரை தொடர்ந்து நடைபெறுகிற, ஒரு உறுதியான ஆனாலும் வளர்ச்சியடைகிற கிருபையின் கிரியை என்று நாங்கள் விசுவாசிக்கிறோம்.',
      'belief7.num': 'vii',
      'belief7.refs': 'Heb. 12:14 · 1 Thess. 5:23 · 2 Peter 3:18 · 2 Cor. 3:18 · Phil. 3:12–14 · 1 Cor. 1:30',
      'belief7.title': 'பரிசுத்தமாக்கப்படுதல்',

      // === belief8 ===
      'belief8.body': 'சுகமளித்தல் என்பது மனித சரீரத்தின் வியாதிகளுக்காக ஏற்படுத்தப்பட்டது; இது விசுவாச ஜெபத்தினாலும், கைகளை வைப்பதினாலும், தேவ வல்லமையினாலே நிறைவேற்றப்படுகிறது. இது கிறிஸ்துவின் பாவநிவாரண பலியில் ஏற்படுத்தப்பட்டதாகும்; இது இக்காலத்தில் சபையின் ஒவ்வொரு அங்கத்தினருக்கும் உரிய பாக்கியமாகும்.',
      'belief8.num': 'viii',
      'belief8.refs': 'James 5:14,15 · Mark 16:18 · Isa. 53:4–5 · Matt. 8:17 · 1 Peter 2:24',
      'belief8.title': 'தெய்வீக சுகமளித்தல்',

      // === belief9 ===
      'belief9.body': 'அவருடைய வருகை சமீபமாயிருக்கிறது. "கிறிஸ்துவுக்குள் மரித்தவர்கள் முதலாவது எழுந்திருப்பார்கள். பின்பு உயிரோடிருக்கிறவர்களும் மீதியாயிருக்கிறவர்களுமாகிய நாம், கர்த்தருக்கு எதிர்கொண்டுபோக மேகங்கள்மேல் அவர்களோடேகூட ஆகாயத்தில் எடுத்துக்கொள்ளப்படுவோம்." மகா உபத்திரவத்திற்குப் பிற்பாடு, ராஜாதி ராஜாவாகவும், கர்த்தாதி கர்த்தராகவும் அவர் பூமிக்குத் திரும்பி வருவார்; தம்முடைய பரிசுத்தவான்களோடேகூட ஆயிரம் வருஷம் அரசாளுவார்.',
      'belief9.num': 'ix',
      'belief9.refs': 'Acts 1:11 · 1 Thess. 4:16–17 · Rev. 5:10 · Rev. 20:6',
      'belief9.title': 'நீதிமான்களின் உயிர்த்தெழுதலும் நம் கர்த்தரின் மறுவருகையும்',

      // === belief10 ===
      'belief10.body': 'கிறிஸ்துவை ஏற்றுக்கொள்ளாமல் தன் பாவங்களில் சரீரப்பிரகாரமாய் மரிக்கிறவன், அக்கினிக்கடலில் நித்தியமாய் ஆக்கினைக்குள்ளாகிறான். "நித்திய" மற்றும் "என்றென்றைக்கும்" என்னும் சொற்கள், தேவ சமுகத்தில் பரிசுத்தவான்கள் அனுபவிக்கும் ஆனந்தத்தைக் குறிக்கப் பயன்படுத்தப்படும் முடிவில்லாத காலம் என்னும் அதே அர்த்தத்தைக் கொண்டிருக்கின்றன.',
      'belief10.num': 'x',
      'belief10.refs': 'Heb. 9:27 · Rev. 19:20',
      'belief10.title': 'நரகமும் நித்திய தண்டனையும்',

      // === beliefs ===
      'beliefs.eyebrow': 'எங்கள் விசுவாச அறிக்கை',
      'beliefs.lede': 'எங்கள் உபதேசம் தேவ ஏவுதலினால் அருளப்பட்ட வேதாகமத்தில் வேரூன்றியிருக்கிறது. கீழே கொடுக்கப்பட்டுள்ள சுருக்கங்கள் எங்கள் ஆராதனையையும், சாட்சியையும், ஊழியத்தையும் வடிவமைக்கும் முக்கிய விசுவாசக் கோட்பாடுகளாகும்.',
      'beliefs.title': 'நாங்கள் விசுவாசிப்பவை — அவை எழுதப்பட்டிருக்கும் இடம்.',

      // === contact ===
      'contact.address': 'T. John Ravi Chandran\nChurch Street\nமேல்மொனவூர் கிராமம்\nஅப்துல்லாபுரம் அஞ்சல்\nவேலூர் 632010\nதமிழ்நாடு மாநிலம்\nதென்னிந்தியா',
      'contact.card.eyebrow': 'தொடர்பு கொள்ளுங்கள்',
      'contact.card.note': 'அவர் தாமே நேரடியாகப் பதிலளிக்கிறார் — பெரும்பாலும் ஒரு நாளுக்குள். உங்களுக்கு எது எளிதோ அந்த வழியைத் தேர்ந்தெடுங்கள்.',
      'contact.card.title': 'போதகர் Johnஐத் தொடர்புகொள்ள மிக விரைவான வழி WhatsApp தான்.',
      'contact.cardFoot': '"இடைவிடாமல் ஜெபம்பண்ணுங்கள்." — 1 தெசலோனிக்கேயர் 5:17',
      'contact.eyebrow': 'தொடர்பு',
      'contact.labelAddress': 'முகவரி',
      'contact.labelEmail': 'மின்னஞ்சல்',
      'contact.labelPastor': 'போதகர்',
      'contact.labelPaypal': 'PayPal (காணிக்கை)',
      'contact.labelPhone': 'தொலைபேசி & WhatsApp',
      'contact.lede': 'நீங்கள் ஒரு குழந்தைக்கு ஆதரவளிக்க விரும்பினாலும், எங்களைச் சந்திக்கத் திட்டமிட்டாலும், அல்லது எங்களோடு ஒரு ஜெபம் ஏறெடுக்க விரும்பினாலும் — உங்கள் குரலைக் கேட்பது எங்களுக்குப் பெருமை.',
      'contact.method1Label': 'WhatsApp-இல் செய்தி அனுப்புங்கள்',
      'contact.method1Value': '+91 98428 91578',
      'contact.method2Label': 'நேரடியாக அழையுங்கள்',
      'contact.method2Value': '+91 98428 91578',
      'contact.method3Label': 'மின்னஞ்சல் அனுப்புங்கள்',
      'contact.method3Value': 'johnrchandran@gmail.com',
      'contact.phoneWa': '+91 98428 91578 · WhatsApp',
      'contact.title': 'போதகர் Johnஐத் தொடர்புகொள்ளுங்கள்.',

      // === donate ===
      'donate.bank.accountName': 'கணக்கின் பெயர்',
      'donate.bank.accountNumber': 'கணக்கு எண்',
      'donate.bank.bank': 'வங்கி',
      'donate.bank.branchAddress': 'கிளை முகவரி',
      'donate.bank.cta': 'Federal Bank wire விவரங்கள்',
      'donate.bank.label': 'வங்கி / Wire Transfer',
      'donate.bank.micr': 'MICR கோட்',
      'donate.bank.sub': 'பெரிய அல்லது மாதாந்திர காணிக்கைகளுக்கு',
      'donate.bank.swift': 'SWIFT கோட்',
      'donate.copyBtn': 'நகலெடுங்கள்',
      'donate.eyebrow': 'HVCT உடன் கூட்டாளராக இணையுங்கள்',
      'donate.foot': 'உங்கள் ஜெபங்களுக்காகவும் கூட்டுறவுக்காகவும் நன்றி. "நன்மையான எந்த ஈவும்... ஜோதிகளின் பிதாவினிடத்திலிருந்து இறங்கிவருகிறது."',
      'donate.foot.cite': '— யாக்கோபு 1:17',
      'donate.lede': 'எவ்வளவு சிறிய காணிக்கையாயிருந்தாலும், அது வேலூரின் கிராமங்களில் பெரிய காரியத்தைச் செய்யும். நீங்கள் ஒரு பிள்ளைக்கு உணவளிக்கிறீர்கள், ஒரு அநாதைக்குக் கல்வி கொடுக்கிறீர்கள், ஒரு கிராமப்புற போதகரை உற்சாகப்படுத்துகிறீர்கள், மேலும் தமிழ்நாட்டிற்குள் சுவிசேஷத்தை அதிகமாய் அனுப்புகிறீர்கள்.',
      'donate.paypal.cta': 'PayPal-ஐத் திறக்கவும்',
      'donate.paypal.label': 'PayPal',
      'donate.paypal.note': 'PayPal.me இணைப்பு தயாரானவுடன் இங்கே சேர்க்கப்படும். தற்சமயம் PayPal-இல் உள்ள "Send Money to a Friend" வசதியைப் பயன்படுத்தவும்.',
      'donate.paypal.sendTo': 'இந்த முகவரிக்கு அனுப்பவும்',
      'donate.paypal.sub': 'வெளிநாட்டு காணிக்கைகளுக்கு',
      'donate.title': 'விதவைகள், அநாதைகள், கிராமப்புற போதகர்கள் மற்றும் கிராமச் சபையோடு கூட நில்லுங்கள்.',

      // === drawer ===
      'drawer.sponsor': 'ஒரு குழந்தைக்கு ஆதரவளியுங்கள்',
      'drawer.visit': 'மிஷனரிப் பயணம்',

      // === fab ===
      'fab.backToTop': 'மேலே திரும்பவும்',
      'fab.whatsapp': 'போதகர் Johnக்கு WhatsApp அனுப்புங்கள்',

      // === faq ===
      'faq.a1': 'ஒரு அநாதைக் குழந்தையின் உணவு, கல்வி, உடை மற்றும் பராமரிப்புக்காக நேரடியாகச் செல்லும் மாதாந்திர காணிக்கையை நீங்கள் அர்ப்பணிக்கிறீர்கள். நீங்கள் தொடர்பு கொள்ளும்போது போதகர் John உங்களுடன் தனிப்பட்ட முறையில் மாதாந்திரத் தொகையை உறுதிப்படுத்துவார் — உங்கள் குடும்பத்திற்கு ஏற்றவாறு இருக்கும்படி அதை நெகிழ்வாக வைத்திருக்கிறோம்.\n\nநீங்கள் யாருக்கு ஆதரவளிக்கிறீர்கள் என்பதை, புகைப்படங்களையும் அவ்வப்போது புதிய செய்திகளையும் உங்களுடன் பகிர்ந்துகொள்வோம், மேலும் சபையின் வழியாக நீங்கள் அந்தக் குழந்தைக்குக் கடிதம் எழுதலாம்.',
      'faq.a2': 'ஒவ்வொரு காணிக்கையும் மூன்று ஊழியங்களுக்காகப் பயன்படுத்தப்படுகிறது: கிராமப்புற போதகர்களுக்கான பயிற்சி, அநாதைக் குழந்தைகளின் கல்வி மற்றும் பராமரிப்பு, விதவைகள் மற்றும் வேதாகம ஸ்திரீகளின் ஊழியம். ஒரு குறிப்பிட்ட குழந்தைக்காக அல்லது போதகருக்காகக் கொடுக்கப்படும் காணிக்கைகள் அந்த நோக்கத்திற்கே பயன்படுத்தப்படுகின்றன. நிதியின் மீது போதகர் John தனிப்பட்ட முறையில் பொறுப்பேற்கிறார், கேட்டால் விவரங்களை மகிழ்ச்சியுடன் பகிர்ந்துகொள்வார்.',
      'faq.a3': 'ஆம் — பல்வேறு கலாச்சாரப் பின்னணியிலிருந்து வரும் மிஷனரிகள், போதகர்கள், ஆசிரியர்கள், செவிலியர்கள் மற்றும் மன்றாட்டுக்காரர்களை நாங்கள் அன்புடன் வரவேற்கிறோம். சில நாட்கள் வரலாம் அல்லது நீண்ட நாட்கள் தங்கலாம். முதலில் WhatsApp மூலம் தொடர்பு கொள்ளுங்கள், பயணத்தை ஒன்றாகத் திட்டமிடுவோம் — ஏற்ற பருவத்தை பரிந்துரைப்போம், தங்குமிடத்தை ஏற்பாடு செய்வோம், மேலும் Gipsy Camp-ல், போதகர்களின் கூட்டங்களில், கிராமச் சபைகளில் என்ன எதிர்பார்க்கலாம் என்பதை விளக்குவோம்.',
      'faq.a4': 'ஆம். Hallelujah Village Church Trust என்பதே இந்த ஊழியத்தின் பதிவு செய்யப்பட்ட பெயராகும். போதகர் T. John Ravi Chandran நிறுவனப் போதகராகவும், பொறுப்பாளராகவும் இருக்கிறார். அதிகாரப்பூர்வ ஆவணங்களுக்கு அல்லது ரசீது தேவைப்படும் பெரிய காணிக்கைகளுக்கு, தயவுசெய்து போதகர் Johnஐ நேரடியாகத் தொடர்பு கொள்ளுங்கள், உங்களுக்குத் தேவையானதை அவர் வழங்குவார்.',
      'faq.a5': 'நிச்சயமாக. ஒரு முறை கொடுக்கப்படும் காணிக்கைகளும் ஆழ்ந்த நன்றியுடன் ஏற்றுக்கொள்ளப்படுகின்றன, அவை வேலூர் கிராமங்களில் வெகுதூரம் பயன்படுகின்றன. எங்களுடன் கூட்டாளராக இணையக்கூடியவர்களுடன் இந்த தளத்தைப் பகிர்ந்துகொள்ளலாம், அல்லது எங்கள் போதகர்களுக்காகவும், விதவைகளுக்காகவும், குழந்தைகளுக்காகவும் ஜெபிக்கலாம். ஜெபமே ஒவ்வொரு மிஷன் ஊழியத்தின் முதல் வேலை — தயவுசெய்து எங்களுக்காக ஜெபியுங்கள்.',
      'faq.a6': '+91 98428 91578-க்கு WhatsApp அனுப்புவதே வேகமான வழி — அவர் தனிப்பட்ட முறையில், பொதுவாக ஒரு நாளுக்குள் பதிலளிப்பார். johnrchandran@gmail.com-க்கு மின்னஞ்சல் அனுப்பினாலும் சரி. நெட்வொர்க் மெதுவாக இருக்கும் நாட்களில் தயவுசெய்து பொறுமையாக இருக்கவும்; வேலூர் கிராமங்களில் எப்போதும் சிக்னல் கிடைப்பதில்லை.',
      'faq.eyebrow': 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      'faq.lede': 'ஆதரவாளர்களிடமிருந்தும், மிஷனரிகளிடமிருந்தும், நண்பர்களிடமிருந்தும் நாங்கள் அடிக்கடி கேட்கும் கேள்விகள் — இன்றிரவு நீங்கள் WhatsApp-ல் தொடர்பு கொண்டால் போதகர் John உங்களுக்கு நேரடியாகக் கொடுக்கும் பதில்கள் இவை.',
      'faq.q1': 'ஒரு அநாதைக் குழந்தைக்கு ஆதரவளிப்பது எப்படிச் செயல்படுகிறது?',
      'faq.q2': 'என் காணிக்கை உண்மையில் எங்கே செல்கிறது?',
      'faq.q3': 'நான் வந்து மிஷன் ஊழியத்தைப் பார்வையிடலாமா?',
      'faq.q4': 'HVCT பதிவு செய்யப்பட்ட டிரஸ்டா?',
      'faq.q5': 'என்னால் ஒவ்வொரு மாதமும் கொடுக்க முடியாது. என்னால் இன்னும் உதவ முடியுமா?',
      'faq.q6': 'போதகர் Johnஐ தொடர்பு கொள்ள சிறந்த வழி எது?',
      'faq.title': 'நீங்கள் கேட்பதற்கு முன்பே, நேர்மையான பதில்கள்.',

      // === footer ===
      'footer.col1': 'பார்வையிடுங்கள்',
      'footer.col2': 'பங்குசேருங்கள்',
      'footer.col3': 'எங்களைக் கண்டடையுங்கள்',
      'footer.colFollow': 'பின்தொடருங்கள்',
      'footer.copyright': '© Hallelujah Village Church Trust',
      'footer.markVerse': '"நீங்கள் உலகமெங்கும்போய், சர்வசிருஷ்டிக்கும் சுவிசேஷத்தைப் பிரசங்கியுங்கள்." — மாற்கு 16:15',
      'footer.tagline': 'தமிழ்நாட்டின் கிராமங்களுக்கு சுவிசேஷத்தைச் சுமந்து செல்கிறோம்.',

      // === gallery ===
      'gallery.blind.caption': 'பார்வையற்ற ஒரு குடும்பத்தின் வீட்டுக்கு மளிகைப் பொருட்களுடனும் ஜெபத்துடனும் சென்று சந்திக்கிறோம்.',
      'gallery.blind.featEyebrow': 'சந்திப்பிலிருந்து',
      'gallery.blind.featQuote': '"பார்வையற்ற ஒரு குடும்பத்தின் வீட்டுக்கு மளிகைப் பொருட்களுடனும் ஜெபத்துடனும் சென்று சந்திக்கிறோம்."',
      'gallery.blind.title': 'பார்வையற்ற குடும்ப சந்திப்பு',
      'gallery.eyebrow': 'புகைப்பட தொகுப்பு',
      'gallery.gipsy.caption': 'Gipsy Camp-ல் உள்ள மக்களுடன் சுவிசேஷத்தைப் பகிர்ந்து, உணவு வழங்கி, அவர்களோடு ஜெபிக்கிறோம்.',
      'gallery.gipsy.featEyebrow': 'Gipsy Camp · April 2026',
      'gallery.gipsy.featQuote': '"மாலை நேரத்தில் குடும்பங்களுக்கு போதகர் John வசனம் பிரசங்கிக்கிறார்."',
      'gallery.gipsy.title': 'Gipsy Camp நற்செய்திப் பணி',
      'gallery.lede': 'எங்கள் கிராம ஊழியத்திலிருந்து சில தருணங்கள் — மாலை நேரத்தில் நடந்த Gipsy Camp நற்செய்திப் பணியிலிருந்து, எங்கள் பிள்ளைகளுடன் நடந்த Vacation Bible School வரை.',
      'gallery.meeting.caption': 'எங்கள் கிராமப்புற போதகர்களின் கூட்டமைப்பு ஒன்றுகூடி, கூட்டாக போஜனம் பண்ணுகிறோம்.',
      'gallery.meeting.featEyebrow': 'சகோதர ஐக்கியம்',
      'gallery.meeting.featQuote': '"கிராமச் சபைக்கு வெளியே வெள்ளை உடையில் ஒன்றுகூடிய போதகர்களின் கூட்டமைப்பு."',
      'gallery.meeting.title': 'போதகர்கள் கூட்டம்',
      'gallery.teaching.caption': 'கிராமப்புற போதகர்கள் கூட்டத்தில் போதகர் John தேவ வசனத்தைப் பகிர்ந்து போதிக்கிறார்.',
      'gallery.teaching.featEyebrow': 'April 2026 · பிரசங்க பீடம்',
      'gallery.teaching.featQuote': '"கிராமப்புற போதகர்கள் கூட்டத்தில் போதகர் John பிரசங்கிக்கிறார்."',
      'gallery.teaching.title': 'போதகர்களுக்கான வசன ஊழியம்',
      'gallery.title': 'முகங்கள், இடங்கள், உண்மையுள்ள சாட்சி.',
      'gallery.vbs.caption': 'எங்கள் பிள்ளைகளுடன் நடத்தப்படும் Vacation Bible School.',
      'gallery.vbs.featEyebrow': 'VBS · May 2026',
      'gallery.vbs.featQuote': '"எங்கள் பிள்ளைகளுடன் நடத்தப்படும் Vacation Bible School."',
      'gallery.vbs.title': 'VBS பிள்ளைகள் ஊழியம்',

      // === hero ===
      'hero.cta.donate': 'காணிக்கை',
      'hero.cta.sponsor': 'ஒரு குழந்தைக்கு ஆதரவளியுங்கள்',
      'hero.eyebrow': 'பெந்தெகோஸ்தே ஊழியம் · வேலூர், தமிழ்நாடு',
      'hero.meta.basedIn': 'இருப்பிடம்',
      'hero.meta.basedInVal': 'மேல்மொனவூர் கிராமம், வேலூர்',
      'hero.meta.commission': 'மகா கட்டளை',
      'hero.meta.commissionVal': 'மாற்கு 16:15',
      'hero.meta.ledBy': 'வழிநடத்துபவர்',
      'hero.meta.ledByVal': 'போதகர் T. John Ravi Chandran',
      'hero.scroll': 'கீழே செல்லுங்கள்',
      'hero.sub': 'Hallelujah Village Church Trust கிராமப்புற இந்தியாவில் சபைகளை நாட்டி, நம்மிடையே சிறியவர்களாகிய விதவைகள், அநாதைக் குழந்தைகள், கிராமப்புற போதகர்கள் மற்றும் பாதிக்கப்பட்டவர்களுக்கு இயேசு கிறிஸ்துவின் நாமத்தில் ஊழியம் செய்து வருகிறது.',
      'hero.title.line1': 'சுவிசேஷத்தை எடுத்துச் செல்கிறோம்',
      'hero.title.line2': 'தமிழ்நாட்டின் கிராமங்களுக்கு',
      'hero.title.line3em': 'மகிமை இயேசுவுக்கே.',
      'hero.welcome': 'மருத்துவ, கல்வி, கிரூஸேட், வேதாகம மற்றும் சமூகப் பணிகளில் கூட்டாக ஈடுபடவும், ஊழிய மையங்களுக்கு வருகை தந்து சிலகாலம் தங்கி ஊழியத்தில் பங்கேற்கவும் வெவ்வேறு கலாச்சாரங்களைச் சேர்ந்த மிஷனரிகளையும் வளம் சேர்க்கும் ஊழியர்களையும் HVCT அன்புடன் வரவேற்கிறது.',

      // === map ===
      'map.cta': 'வழிகாட்டுதலைப் பெறுங்கள்',
      'map.eyebrow': 'எங்களைக் கண்டடையுங்கள்',
      'map.lede': 'வேலூர் மாவட்டம், மேல்மொனவூரில் சர்ச் ஸ்ட்ரீட்டில் அமைந்துள்ள ஒரு கிராமச் சபை — எங்கள் ஊழியத்தின் இதயம்.',
      'map.title': 'இயேசு HVCT மிஷன் சென்டர், மேல்மொனவூர் கிராமம்.',

      // === ministries ===
      'ministries.crusades.body': 'இரண்டு மாவட்டங்களிலுள்ள கிராமங்களில் வெளியரங்கக் கூட்டங்கள், சுவிசேஷப் பணி மற்றும் சீடத்துவப் பயிற்சி நடத்தப்படுகிறது.',
      'ministries.crusades.title': 'சுவிசேஷ கூட்டங்கள்',
      'ministries.education.body': 'எங்கள் பராமரிப்பில் உள்ள அநாதைக் குழந்தைகளுக்கு பள்ளிக் கல்வி, உணவு மற்றும் ஒரு பிரகாசமான எதிர்காலம் — அத்துடன் கூட்டாளர்களுக்கான ஆதரவுத் திட்டமும் உண்டு.',
      'ministries.education.title': 'அநாதைக் குழந்தைகளுக்கான கல்வி',
      'ministries.eyebrow': 'நாங்கள் செய்கிற ஊழியங்கள்',
      'ministries.medical.body': 'வேலூர் மற்றும் திருவண்ணாமலை மாவட்டங்களில் உள்ள கிராமப்புறங்களில், மருத்துவ வசதியின்றி இருப்பவர்களுக்கு இலவச மருத்துவ முகாம்கள் மற்றும் பராமரிப்பு வழங்கப்படுகிறது.',
      'ministries.medical.title': 'மருத்துவ ஊழியம்',
      'ministries.missionaries.body': 'வேற்று கலாச்சாரங்களைச் சேர்ந்த மிஷனரிகள் எங்களிடம் வந்து, தங்கி, எங்களுடன் இணைந்து ஊழியம் செய்வதற்கு அன்பான அழைப்பு.',
      'ministries.missionaries.title': 'மிஷனரிகளை அன்புடன் வரவேற்கிறோம்',
      'ministries.social.body': 'எங்கள் சமூகத்தில் உள்ள விதவைகள், முதியோர்கள், குஷ்டரோகிகள் மற்றும் மிகவும் பாதிக்கப்பட்டோருடன் இணைந்து நின்று உதவி செய்கிறோம்.',
      'ministries.social.title': 'சமூக சேவை',
      'ministries.teaching.body': 'கிராமப்புற போதகர்களுக்கும், வேதாகம ஸ்திரீகளுக்கும் பிரசங்கம், வேதாகமப் போதனை மற்றும் தலைமைத்துவப் பயிற்சி அளிக்கப்படுகிறது.',
      'ministries.teaching.title': 'வேதாகமப் போதனை',
      'ministries.title': 'கிராமத்திற்கும் ஆத்துமாவிற்கும் ஊழியம் செய்கிற பணிகள்.',

      // === mission ===
      'mission.eyebrow': 'எங்கள் ஊழியநோக்கம்',
      'mission.statement': 'வேலூர் மற்றும் திருவண்ணாமலை மாவட்டங்களின் தொலைதூர கிராமங்களில் சபைகளை நாட்டுவதே எங்கள் நோக்கம் — தாழ்த்தப்பட்டோருக்கு சுவிசேஷத்தை அறிவித்து, ஞானஸ்நானம் கொடுத்து, சீடராக்குதல்; தேவ வசனத்திற்கு உண்மையாய் நிலைத்திருத்தல்.',
      'mission.verseCite': '— மாற்கு 16:15',
      'mission.verseText': 'நீங்கள் உலகமெங்கும்போய், சர்வசிருஷ்டிக்கும் சுவிசேஷத்தைப் பிரசங்கியுங்கள்.',

      // === nav ===
      'nav.about': 'எங்களைக் குறித்து',
      'nav.beliefs': 'விசுவாச அறிக்கை',
      'nav.contact': 'தொடர்பு',
      'nav.donate': 'காணிக்கை',
      'nav.faq': 'கேள்விகள்',
      'nav.gallery': 'புகைப்படங்கள்',
      'nav.ministries': 'ஊழியங்கள்',
      'nav.mission': 'ஊழியம்',
      'nav.sponsor': 'ஆதரவளியுங்கள்',
      'nav.videos': 'காணொளிகள்',
      'nav.visit': 'வருகை',

      // === pastor ===
      'pastor.body1': 'போதகர் T. John Ravi Chandran பல வருடங்களாக வேலூர் மற்றும் திருவண்ணாமலை மாவட்டங்களின் தூசி நிறைந்த பாதைகளில் நடந்துள்ளார் — எந்த ஒரு பிரசங்கியும் கால் வைக்காத கிராமங்களில் சபைகளை நாட்டியும், அதே ஆவியின் நெருப்பைச் சுமந்து செல்லும் கிராமப்புற போதகர்களின் ஒரு சகோதரத்துவத்தைத் திரட்டியும் வந்துள்ளார்.',
      'pastor.body2': 'ஒரு போர்வீரன் தன் தளபதியின் கட்டளையைச் சுமந்து செல்வதுபோல, அவர் ஒரே ஒரு வேதவசனத்தை இதயத்தில் சுமந்து செல்கிறார் — "நீங்கள் உலகமெங்கும்போய், சர்வசிருஷ்டிக்கும் சுவிசேஷத்தைப் பிரசங்கியுங்கள்" (மாற்கு 16:15). இதற்காகவே HVCT நிறுவப்பட்டது. இதற்காகவே அவர் மாலை வேளையில் Gipsy Camp-க்கு திரும்பத் திரும்பச் செல்கிறார்; விதவைகளோடு தரையில் அமர்ந்து உரையாடுகிறார்; தங்கள் சொந்த மக்களுக்குப் போதிக்கின்ற கிராமப்புற போதகர்களுக்குப் போதிக்கிறார். ஊழியமே அவருடைய வாழ்க்கை; அவரோ அந்த அழைப்புக்கு உண்மையாயிருக்கிறார்.',
      'pastor.body3': 'மற்ற கலாச்சாரங்களிலிருந்து வரும் மிஷனரிமார், ஆசிரியர்கள், செவிலியர்கள், மற்றும் மன்றாட்டுக்காரர்கள் — நேரில் வந்து பார்க்கவும், அவருடன் சேர்ந்து அந்தப் பாதைகளில் சிலவற்றில் நடக்கவும் — அவர் இதயம் திறந்து அழைக்கிறார்.',
      'pastor.ctaVisit': 'ஊழியத்தைச் சந்திக்க வாருங்கள்',
      'pastor.ctaWhatsApp': 'போதகர் Johnக்கு WhatsApp அனுப்புங்கள் →',
      'pastor.eyebrow': 'போதகரைச் சந்திக்கவும்',
      'pastor.lede': 'போதகர் T. John Ravi Chandran பல வருடங்களாக வேலூர் மற்றும் திருவண்ணாமலை மாவட்டங்களின் தூசி நிறைந்த பாதைகளில் நடந்துள்ளார் — எந்த ஒரு பிரசங்கியும் கால் வைக்காத கிராமங்களில் சபைகளை நாட்டியும், அதே ஆவியின் நெருப்பைச் சுமந்து செல்லும் கிராமப்புற போதகர்களின் ஒரு சகோதரத்துவத்தைத் திரட்டியும் வந்துள்ளார்.',
      'pastor.portraitName': 'போதகர் T. John Ravi Chandran',
      'pastor.portraitRole': 'ஸ்தாபகர் மற்றும் போதகர், HVCT',
      'pastor.title': '"சுவிசேஷம் இன்னும் சென்றடையாத இடங்களுக்குச் செல்வதே நோக்கம்."',

      // === quote ===
      'quote.markCite': '— மாற்கு 16:15',
      'quote.markVerse': 'நீங்கள் உலகமெங்கும்போய், சர்வசிருஷ்டிக்கும் சுவிசேஷத்தைப் பிரசங்கியுங்கள்.',

      // === sponsor ===
      'sponsor.body2': 'உலகெங்கிலும் இருந்து ஆதரவாளர்களுடன் சேர்ந்து நடப்பது எங்களுக்குப் பெரும் பெருமை. நீங்கள் தொடர்பு கொள்ளும்போது மாதாந்திரத் தொகையை போதகர் John உறுதிப்படுத்துவார் — உங்கள் குடும்பத்திற்குப் பொருத்தமான கொடுக்கும் வழியை நாம் ஒன்றாகக் காண்போம்.',
      'sponsor.ctaBegin': 'ஆதரவளிக்கத் தொடங்குங்கள்',
      'sponsor.ctaEmail': 'போதகர் Johnக்கு மின்னஞ்சல் அனுப்புங்கள்',
      'sponsor.eyebrow': 'ஒரு அநாதைக் குழந்தைக்கு ஆதரவளியுங்கள்',
      'sponsor.lede': 'எங்கள் பராமரிப்பில் உள்ள பல குழந்தைகளுக்கு, உள்ளூர் சபையே அவர்கள் அறிந்த ஒரே குடும்பம். உங்கள் மாதாந்திர ஆதரவு உணவு, கல்வி, உடை, மற்றும் அவர்களின் பெயர் அறிந்த ஒரு சமூகத்தின் அமைதியான அன்பை வழங்குகிறது.',
      'sponsor.title': 'ஒரு குழந்தைக்கு ஒரு வேளை உணவையும், பள்ளி இருக்கையையும், ஒரு எதிர்காலத்தையும் கொடுங்கள்.',

      // === videos ===
      'videos.cap1': 'Gipsy Camp · அந்திவேளையில் கூடிவருதல்',
      'videos.cap2': 'Gipsy Camp · சுவிசேஷத்தை அறிவித்தல்',
      'videos.cap3': 'Gipsy Camp · மக்களோடு ஜெபித்தல்',
      'videos.cap4': 'போதகர்கள் போதனை · April 2026',
      'videos.eyebrow': 'ஊழியத்தைப் பாருங்கள்',
      'videos.lede': 'Gipsy Camp ஊழியத்திலிருந்தும், போதகர்கள் போதனை கூட்டத்திலிருந்தும் சில குறுகிய வீடியோக்கள் — மெதுவான இணைய இணைப்புகளில் வீடியோக்கள் ஏற்றப்படும் வரை தயவுசெய்து பொறுமையாக இருங்கள்.',
      'videos.metaChapter': 'அத்தியாயம்',
      'videos.metaGipsyVellore': 'Gipsy Camp · வேலூர்',
      'videos.metaTeachingApril2026': 'போதகர்கள் போதனை · April 2026',
      'videos.title': 'காணொளித் தருணங்கள்.',

      // === visit ===
      'visit.ctaPlan': 'வருகையைத் திட்டமிடுங்கள்',
      'visit.ctaWhatsApp': 'போதகர் Johnக்கு WhatsApp அனுப்புங்கள்',
      'visit.eyebrow': 'ஒரு மிஷனரிப் பயணம் மேற்கொள்ளுங்கள்',
      'visit.lede': 'வெவ்வேறு கலாச்சாரங்களில் இருந்து வரும் மிஷனரிகள், போதகர்கள், ஆசிரியர்கள், செவிலியர்கள் மற்றும் வளவாளர்களை நாங்கள் திறந்த கரங்களுடன் வரவேற்கிறோம். மிஷன் களங்களைப் பார்வையிட வாருங்கள், சில காலம் தங்கி, ஊழியத்தில் நேரடியாகப் பங்கேற்கலாம்.',
      'visit.serve1Body': 'எங்கள் குழுவுடன் சேர்ந்து சேவை செய்யுங்கள்',
      'visit.serve1Label': 'மருத்துவ முகாம்கள்',
      'visit.serve2Body': 'கற்பியுங்கள், வழிநடத்துங்கள், ஊக்கப்படுத்துங்கள்',
      'visit.serve2Label': 'பிள்ளைகளுக்கான நிகழ்ச்சிகள்',
      'visit.serve3Body': 'கிராமங்களில் பிரசங்கியுங்கள்',
      'visit.serve3Label': 'சுவிசேஷக் கூட்டங்கள்',
      'visit.serve4Body': 'கிராமத்துத் தலைவர்களை பலப்படுத்துங்கள்',
      'visit.serve4Label': 'போதகர் பயிற்சி',
      'visit.serve5Body': 'விதவைகள் மற்றும் முதியோர்களுடன் சேர்ந்து நடந்து செல்லுங்கள்',
      'visit.serve5Label': 'சமூக சேவை',
      'visit.title': 'வேலூரின் கிராமங்களுக்கு வாருங்கள், தங்குங்கள், ஊழியம் செய்யுங்கள்.',

      // === word ===
      'word.eyebrow': 'நாங்கள் ஊழியம் செய்யும் இடம்',
      'word.foot': 'தமிழ்நாடு · தென் இந்தியா',
      'word.text': 'வேலூர்'
    }
  };

  const langToggle = document.getElementById('langToggle');
  // Convert "\n\n" into a paragraph break and single "\n" into <br> for Tamil
  // long-form answers that span multiple paragraphs (FAQ a1, etc.).
  function tamilToHtml(s){
    const esc = String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // Two newlines = paragraph break, one newline = soft break
    return esc.split(/\n\n+/).map(p => p.replace(/\n/g, '<br>')).join('<br><br>');
  }
  function applyLang(lang){
    // Keep <html lang="en"> because 95% of page content is still English;
    // only the translated nodes themselves get per-element lang="ta".
    document.body.classList.toggle('lang-ta', lang === 'ta');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      // Cache original innerHTML once so we can restore <em>, <br>, links, etc.
      if(el.dataset.i18nEnHtml === undefined) el.dataset.i18nEnHtml = el.innerHTML;
      const key = el.dataset.i18n;
      if(lang === 'ta' && i18n.ta[key] !== undefined){
        el.innerHTML = tamilToHtml(i18n.ta[key]);
        el.setAttribute('lang', 'ta');
      } else {
        el.innerHTML = el.dataset.i18nEnHtml;
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
     at ~16% the scroll speed of the surrounding text.
     Skip on mobile - constant scroll listener + transform updates contribute
     to iOS GPU memory pressure and on small screens the effect is barely visible. */
  const parallaxIsMobile = window.matchMedia('(max-width: 760px)').matches;
  const parallaxFrames = parallaxIsMobile ? [] : Array.from(document.querySelectorAll('.parallax-frame'));
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
