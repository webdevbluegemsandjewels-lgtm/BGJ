// ============================================================
// BLUE GEMS AND JEWELS — shared behaviour
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  /* ---- inject shared nav ---- */
  const navMount = document.getElementById('site-nav');
  if (navMount) navMount.innerHTML = NAV_HTML;
  /* ---- load images/videos from Supabase Storage ---- */
  document.querySelectorAll('[data-img]').forEach(el => {
    el.src = supabaseImage(el.getAttribute('data-img'));
    /* hero videos: keep the local fallback image visible until the video is actually playing */
    if (el.tagName === 'VIDEO' && el.closest('.hero-photo, .ir-hero-bg')) {
      el.addEventListener('playing', () => el.classList.add('is-ready'));
    }
  });
  /* ---- load document links from Supabase Storage ---- */
  document.querySelectorAll('[data-file]').forEach(el => {
    el.href = supabaseFile(el.getAttribute('data-file'));
  });
  /* ---- preload the destination page on link hover/focus/touch ----
     as soon as a visitor shows intent to follow an internal link, fetch
     that page's HTML plus its hero video/fallback image in the
     background, so by the time they actually click, the next page's
     hero is already loading (or fully cached) instead of starting cold */
  const HERO_PRELOAD = {
    'index.html': { video: 'hero/home.mp4' },
    'about.html': { video: 'hero/about.mp4', img: 'assets/hero/about.png' },
    'certifications.html': { video: 'hero/certification.mp4', img: 'assets/hero/cert.png' },
    'contact.html': { video: 'hero/contact.mp4', img: 'assets/hero/contact.png' },
    'investor-relations.html': { video: 'hero/invest.mp4', img: 'assets/hero/invest.png' },
    'events.html': { video: 'hero/events.mp4', img: 'assets/hero/event.png' },
    'products.html': { video: 'hero/products.mp4', img: 'assets/hero/product.png' }
  };
  const preloadedPages = new Set();
  const preloadPage = (href) => {
    if (!href || preloadedPages.has(href)) return;
    preloadedPages.add(href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
    const hero = HERO_PRELOAD[href];
    if (hero) {
      if (hero.img) { const img = new Image(); img.src = hero.img; }
      if (hero.video) {
        const v = document.createElement('video');
        v.preload = 'auto';
        v.muted = true;
        v.src = supabaseImage(hero.video);
      }
    }
  };
  /* the home page is the single most likely destination from anywhere
     on the site (logo click, "Home" nav link) — always start loading
     its hero in the background as soon as any other page opens,
     instead of waiting for the visitor to hover the link first */
  if (document.body.getAttribute('data-page') !== 'home') preloadPage('index.html');
  document.querySelectorAll('a[href$=".html"]').forEach(a => {
    const href = a.getAttribute('href');
    a.addEventListener('mouseenter', () => preloadPage(href), { once: true });
    a.addEventListener('focus', () => preloadPage(href), { once: true });
    a.addEventListener('touchstart', () => preloadPage(href), { passive: true, once: true });
  });
  /* ---- active nav link (data-key may hold several page names, space-separated) ---- */
  const page = document.body.getAttribute('data-page');
  document.querySelectorAll('.nav-links a[data-key], .mobile-panel a[data-key]').forEach(a => {
    if (a.getAttribute('data-key').split(' ').includes(page)) a.classList.add('active');
  });
  /* ---- nav scroll state ---- */
  const nav = document.querySelector('.nav');
  const syncNavHeight = () => {
    if (!nav) return;
    document.documentElement.style.setProperty('--nav-h', `${nav.offsetHeight}px`);
  };
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    syncNavHeight();
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', syncNavHeight);
  onScroll();
  /* ---- mobile menu ---- */
  const toggle = document.querySelector('.nav-toggle');
  const panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', () => panel.classList.toggle('open'));
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => panel.classList.remove('open')));
  }
  /* ---- scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale, .reveal-line');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach((el, i) => {
    el.style.setProperty('--i', i % 6);
    io.observe(el);
  });
  /* ---- stacking-card scroll effect ---- */
  const stackSections = Array.from(document.querySelectorAll('.stack-section'));
  const footerEl = document.querySelector('.footer');
  if (footerEl) stackSections.push(footerEl);
  if (stackSections.length) {
    stackSections.forEach((sec, i) => { sec.style.zIndex = i + 1; });
    /* pin-and-reveal: sections taller than the viewport get their inner
       content nudged upward as the user scrolls through them, so the
       full height is seen before the next card covers this one. */
    const revealSections = document.querySelectorAll('.stack-section');
    const measureReveal = () => {
      revealSections.forEach(sec => {
        const inner = sec.querySelector(':scope > .wrap');
        if (!inner) return;
        inner.style.transform = 'none';
        const style = getComputedStyle(sec);
        const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        const available = window.innerHeight - padding;
        const extra = inner.offsetHeight - available;
        sec._revealTop = sec.offsetTop;
        sec._revealExtra = extra > 0 ? extra + 8 : 0;
        sec._revealInner = inner;
      });
    };
    let stackTicking = false;
    const applyStack = () => {
      stackTicking = false;
      const vh = window.innerHeight;
      revealSections.forEach(sec => {
        if (!sec._revealInner || !sec._revealExtra) return;
        const progress = Math.min(Math.max((window.scrollY - sec._revealTop) / sec._revealExtra, 0), 1);
        sec._revealInner.style.transform = `translateY(${-progress * sec._revealExtra}px)`;
      });
      for (let i = 0; i < stackSections.length - 1; i++) {
        const current = stackSections[i];
        const next = stackSections[i + 1];
        const nextTop = next.getBoundingClientRect().top;
        const progress = 1 - Math.min(Math.max(nextTop / vh, 0), 1);
        const scale = 1 - progress * 0.06;
        const opacity = 1 - progress * 0.35;
        current.style.transform = `scale(${scale})`;
        current.style.opacity = opacity;
      }
    };
    const updateStack = () => {
      if (stackTicking) return;
      stackTicking = true;
      requestAnimationFrame(applyStack);
    };
    const remeasure = () => { measureReveal(); updateStack(); };
    document.addEventListener('scroll', updateStack, { passive: true });
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(remeasure);
    }
    setTimeout(remeasure, 600);
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => remeasure());
      revealSections.forEach(sec => {
        const inner = sec.querySelector(':scope > .wrap');
        if (inner) ro.observe(inner);
      });
    }
    remeasure();
  }
  /* ---- hero parallax ---- */
  document.querySelectorAll('.hero-bg').forEach(bg => {
    document.addEventListener('scroll', () => {
      const y = window.scrollY;
      bg.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
    }, { passive: true });
  });
  /* ---- founder profile popup ---- */
  const founderModal = document.getElementById('founder-modal');
  if (founderModal) {
    const nameEl = document.getElementById('founder-modal-name');
    const titleEl = document.getElementById('founder-modal-title');
    const bioEl = document.getElementById('founder-modal-bio');
    const avatarImgEl = document.getElementById('founder-modal-avatar-img');
    const openModal = (card) => {
      nameEl.textContent = card.dataset.name || '';
      titleEl.textContent = card.dataset.title || '';
      bioEl.textContent = card.dataset.bio || '';
      const cardImg = card.querySelector('.founder-avatar img');
      avatarImgEl.src = cardImg ? cardImg.src : '';
      avatarImgEl.alt = cardImg ? cardImg.alt : '';
      founderModal.classList.add('open');
      founderModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
      founderModal.classList.remove('open');
      founderModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    document.querySelectorAll('.founder-card').forEach(card => {
      card.addEventListener('click', () => openModal(card));
    });
    founderModal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && founderModal.classList.contains('open')) closeModal();
    });
  }
  /* ---- certification stacked-card carousel ---- */
  const certStack = document.getElementById('cert-stack');
  if (certStack) {
    const cards = Array.from(certStack.querySelectorAll('.cert-stack-card'));
    const total = cards.length;
    const dotsWrap = document.getElementById('cert-dots');
    const textEl = document.getElementById('cert-text');
    const indexEl = document.getElementById('cert-text-index');
    const titleEl = document.getElementById('cert-text-title');
    const descEl = document.getElementById('cert-text-desc');
    const meta1LabelEl = document.getElementById('cert-meta1-label');
    const meta1ValueEl = document.getElementById('cert-meta1-value');
    const meta2LabelEl = document.getElementById('cert-meta2-label');
    const meta2ValueEl = document.getElementById('cert-meta2-value');
    let active = 0;
    let switching = false;

    cards.forEach(() => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'cert-dot';
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    const layout = (offset) => {
      if (offset >= 4) return { transform: 'translateY(60px) scale(.8)', opacity: 0, z: 0, pe: 'none' };
      const translateY = offset * 14;
      const scale = 1 - offset * 0.045;
      const rotate = offset === 0 ? 0 : (offset % 2 === 0 ? -3 : 3);
      const opacity = 1 - offset * 0.22;
      return {
        transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
        opacity, z: total - offset, pe: offset === 0 ? 'auto' : 'none'
      };
    };

    const render = () => {
      cards.forEach((card, i) => {
        const offset = (i - active + total) % total;
        const s = layout(offset);
        card.style.transform = s.transform;
        card.style.opacity = s.opacity;
        card.style.zIndex = s.z;
        card.style.pointerEvents = s.pe;
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === active));
    };

    const applyText = () => {
      const card = cards[active];
      indexEl.textContent = `Certification ${String(active + 1).padStart(2, '0')}`;
      titleEl.textContent = card.dataset.name || '';
      descEl.textContent = card.dataset.desc || '';
      meta1LabelEl.textContent = card.dataset.meta1Label || '';
      meta1ValueEl.textContent = card.dataset.meta1Value || '';
      meta2LabelEl.textContent = card.dataset.meta2Label || '';
      meta2ValueEl.textContent = card.dataset.meta2Value || '';
    };

    const goTo = (index) => {
      if (switching) return;
      active = ((index % total) + total) % total;
      switching = true;
      textEl.classList.add('switching');
      render();
      setTimeout(() => {
        applyText();
        textEl.classList.remove('switching');
        setTimeout(() => { switching = false; }, 350);
      }, 200);
    };
    const next = () => goTo(active + 1);
    const prev = () => goTo(active - 1);

    applyText();
    render();

    document.getElementById('cert-next').addEventListener('click', () => { next(); resetAutoplay(); });
    document.getElementById('cert-prev').addEventListener('click', () => { prev(); resetAutoplay(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetAutoplay(); }));
    cards.forEach((card, i) => {
      card.addEventListener('click', () => {
        if (i === active) { next(); resetAutoplay(); }
      });
    });

    /* autoplay, pauses on hover/focus/interaction */
    let autoplayTimer = null;
    const startAutoplay = () => { autoplayTimer = setInterval(next, 6500); };
    const stopAutoplay = () => { if (autoplayTimer) clearInterval(autoplayTimer); };
    const resetAutoplay = () => { stopAutoplay(); startAutoplay(); };
    startAutoplay();
    certStack.addEventListener('mouseenter', stopAutoplay);
    certStack.addEventListener('mouseleave', startAutoplay);

    /* first glimpse: the moment this section is reached (well after the
       hero, never during it), the whole carousel takes over the full
       screen, the surrounding text disappears, and every certificate
       fans out full-width so the visitor sees the whole set at a
       glance — then it collapses back into the normal in-page stack */
    const glimpseSection = document.getElementById('cert-showcase');
    const spreadLayout = (i) => {
      const mid = (total - 1) / 2;
      const offset = i - mid;
      const spacing = Math.min(240, window.innerWidth / (total + 1));
      return {
        transform: `translateX(${offset * spacing}px) scale(.9) rotate(${offset * 3}deg)`,
        opacity: 1, z: 20 - Math.abs(offset), pe: 'none'
      };
    };
    const showGlimpse = () => {
      stopAutoplay();
      document.body.classList.add('cert-glimpse-active');
      document.body.style.overflow = 'hidden';
      cards.forEach((card, i) => {
        const s = spreadLayout(i);
        card.style.transform = s.transform;
        card.style.opacity = s.opacity;
        card.style.zIndex = s.z;
        card.style.pointerEvents = s.pe;
      });
      setTimeout(() => {
        document.body.classList.remove('cert-glimpse-active');
        document.body.style.overflow = '';
        render();
        setTimeout(startAutoplay, 700);
      }, 1800);
    };
    if (glimpseSection) {
      const hero = document.querySelector('.hero');
      /* multiple thresholds so the callback keeps re-firing as the user
         keeps scrolling — a single threshold only fires once per
         crossing, which would permanently miss the trigger if the hero
         guard happened to reject that one moment */
      const glimpseIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.intersectionRatio < 0.5) return;
          if (hero) {
            const heroRect = hero.getBoundingClientRect();
            if (heroRect.bottom > window.innerHeight * 0.4) return;
          }
          glimpseIo.disconnect();
          showGlimpse();
        });
      }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
      glimpseIo.observe(glimpseSection);
    }

    /* contained wheel input on desktop — nudges the stack, then cools down
       so normal page scrolling isn't trapped */
    let wheelAccum = 0;
    let wheelLocked = false;
    certStack.addEventListener('wheel', (e) => {
      if (wheelLocked) return;
      wheelAccum += e.deltaY;
      if (Math.abs(wheelAccum) > 60) {
        e.preventDefault();
        wheelAccum > 0 ? next() : prev();
        resetAutoplay();
        wheelAccum = 0;
        wheelLocked = true;
        setTimeout(() => { wheelLocked = false; }, 700);
      }
    }, { passive: false });

    /* touch swipe on mobile */
    let touchStartX = 0;
    certStack.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    certStack.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        dx < 0 ? next() : prev();
        resetAutoplay();
      }
    }, { passive: true });
  }
  /* ---- past events (vertical poster-stack showcase) ---- */
  const peStack = document.getElementById('pe-stack');
  if (peStack) {
    const peEvents = [
      {
        title: 'IIJS 2026',
        exhibition: 'IIJS — India International Jewellery Show',
        location: 'India',
        year: '2026',
        desc: "Blue Gems and Jewels took part in IIJS 2026, one of India's largest B2B jewellery exhibitions, presenting its collections to manufacturers, retailers, and exporters nationwide. The exhibition marked an important platform for showcasing our manufacturing capability.",
        image: { src: 'Past Events/IIJS_Aug_2026 image 1.jpeg', position: 'top' }
      },
      {
        title: 'The BOJ Show 2026',
        exhibition: 'The BOJ Show — Business of Jewellery',
        location: 'New Delhi, India',
        year: '2026',
        desc: 'Blue Gems and Jewels took part in The BOJ Show 2026 in New Delhi, presenting refined jewellery collections to retailers and buyers for focused, relationship-led trade conversations. The showcase reflected our continued commitment to design consistency and manufacturing discipline.',
        image: 'Past Events/29 April  2026 the boj delhi taj 1.jpg'
      },
      {
        title: 'Prêt by Couture 2026',
        exhibition: 'Prêt by Couture India',
        location: 'Mumbai, India',
        year: '2026',
        desc: 'At Prêt by Couture India 2026 in Mumbai, Blue Gems and Jewels presented a curated selection of contemporary, retailer-ready fine jewellery. The platform allowed us to connect directly with retailers seeking modern, wearable design.',
        image: 'Past Events/19 feb 2026 pret by couture, mumbai grand hyat.jpg'
      },
      {
        title: 'Couture India 2025',
        exhibition: 'Couture India Jewellery Show',
        location: 'New Delhi, India',
        year: '2025',
        desc: 'Blue Gems and Jewels exhibited at Couture India 2025 in New Delhi, presenting distinctive designs and fine finishing to a premium retail audience. The show reinforced our focus on proportion, setting, and polish.',
        image: 'Past Events/Couture 2025 delhi_.jpg'
      },
      {
        title: 'IGI D Show 2025',
        exhibition: 'IGI D Show',
        location: 'Goa, India',
        year: '2025',
        desc: 'Blue Gems and Jewels participated in the IGI D Show 2025 in Goa, showcasing diamond jewellery crafted to meet recognised gemological standards. The exhibition connected us with buyers who value certified quality and craftsmanship.',
        image: 'Past Events/IGI D show goa, 2025.jpg'
      },
      {
        title: 'Prêt by Couture 2025',
        exhibition: 'Prêt by Couture India',
        location: 'India',
        year: '2025',
        desc: 'Blue Gems and Jewels joined Prêt by Couture India in February 2025, presenting modern, wearable fine jewellery aligned with contemporary retail preferences. The showcase highlighted our design versatility and finishing standards.',
        image: 'Past Events/Feb 2025 pret by couture_.jpg'
      },
      {
        title: 'IIJS Signature 2024',
        exhibition: 'IIJS Bharat — Signature',
        location: 'Mumbai, India',
        year: '2024',
        desc: 'Blue Gems and Jewels exhibited at IIJS Bharat — Signature 2024 in Mumbai, presenting design-led collections at the opening trade platform of the calendar. The show provided an early opportunity for focused trade conversations with retailers.',
        image: 'Past Events/Iijs signature 2024 bombay.jpg'
      },
      {
        title: 'IIJS Tritiya 2024',
        exhibition: 'IIJS Bharat — Tritiya',
        location: 'Bengaluru, India',
        year: '2024',
        desc: 'Blue Gems and Jewels participated in IIJS Bharat — Tritiya 2024 in Bengaluru, connecting with South Indian retail markets and showcasing collections suited to regional demand. The exhibition reflected our commitment to serving diverse retail tastes.',
        image: 'Past Events/Iijs tritya banglore 2024.jpg'
      },
      {
        title: 'IGI D Show 2024',
        exhibition: 'IGI D Show',
        location: 'Goa, India',
        year: '2024',
        desc: 'Blue Gems and Jewels presented its diamond jewellery collections at the IGI D Show 2024 in Goa, an exhibition centred on certified diamond craftsmanship. The platform allowed us to engage buyers who prioritise gemological trust.',
        image: 'Past Events/IGI D show goa, 2024.jpg'
      },
      {
        title: 'IIJS 2022',
        exhibition: 'India International Jewellery Show',
        location: 'India',
        year: '2022',
        desc: "Blue Gems and Jewels took part in IIJS 2022, one of India's largest B2B jewellery exhibitions, presenting its collections to manufacturers, retailers, and exporters nationwide. The exhibition marked an important platform for showcasing our manufacturing capability.",
        image: 'Past Events/Iijs 2022 IMAGE 1.jpg'
      }
    ];
    const peImgSrc = (img) => typeof img === 'string' ? img : img.src;
    const peImgPosition = (img) => (typeof img === 'object' && img.position) ? `center ${img.position}` : 'center';

    const pillars = peEvents.map((ev, i) => {
      const el = document.createElement('div');
      el.className = 'pe-pillar' + (i === 0 ? ' pe-active' : ' pe-inactive');
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', ev.title);

      const bg = document.createElement('div');
      bg.className = 'pe-pillar-bg active';

      const img = document.createElement('img');
      img.className = 'pe-pillar-img active';
      img.alt = ev.title;

      const scrim = document.createElement('div');
      scrim.className = 'pe-pillar-scrim';

      const tag = document.createElement('div');
      tag.className = 'pe-pillar-tag';
      tag.innerHTML = `<span><small>${ev.year}</small>${ev.title}</span>`;

      const detail = document.createElement('div');
      detail.className = 'pe-pillar-detail';
      detail.innerHTML = `
        <span class="pe-pillar-num">${String(i + 1).padStart(2, '0')} / ${String(peEvents.length).padStart(2, '0')}</span>
        <h3 class="pe-pillar-title">${ev.title}</h3>
        <span class="pe-pillar-exhibition">${ev.exhibition}</span>
        <div class="pe-pillar-meta"><span>${ev.location}</span><span class="pe-meta-dot">&middot;</span><span>${ev.year}</span></div>
        <p class="pe-pillar-desc">${ev.desc}</p>
      `;

      const infoBtn = document.createElement('button');
      infoBtn.type = 'button';
      infoBtn.className = 'pe-info-btn';
      infoBtn.textContent = 'i';
      infoBtn.setAttribute('aria-label', `About ${ev.title}`);

      const url = supabaseImage(peImgSrc(ev.image));
      img.src = url;
      img.style.objectPosition = peImgPosition(ev.image);
      bg.style.backgroundImage = `url("${url}")`;

      el.append(bg, img, scrim, tag, detail, infoBtn);
      peStack.appendChild(el);

      const p = { el, ev, img, infoBtn, infoLocked: false };
      img.addEventListener('load', () => { if (el.classList.contains('pe-active')) computeActiveWidth(p); }, { once: true });

      infoBtn.addEventListener('mouseenter', () => el.classList.add('pe-info-open'));
      infoBtn.addEventListener('mouseleave', () => { if (!p.infoLocked) el.classList.remove('pe-info-open'); });
      infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        p.infoLocked = !p.infoLocked;
        el.classList.toggle('pe-info-open', p.infoLocked);
      });

      return p;
    });

    /* on desktop/tablet the expanded panel's width adapts to the real
       aspect ratio of its photo, so the blurred margin either side of
       the (uncropped, letterboxed) image stays snug instead of a fixed
       one-size-fits-all panel width leaving wide empty bars */
    const PE_INACTIVE_W = 64;
    const PE_GAP = 8;
    const clearPillarWidth = (p) => { p.el.style.width = ''; };
    const computeActiveWidth = (p) => {
      if (window.innerWidth <= 640) return;
      const stackRect = peStack.getBoundingClientRect();
      if (!stackRect.width || !stackRect.height) return;
      /* fall back to a sensible landscape aspect until the real image
         has decoded — bailing out here left the unclamped CSS fallback
         width (56%) in place, which overflows the row and clips
         whichever pillar lands near the edge (worst for pillars late
         in the fetch queue, i.e. the last one or two in the list) */
      const aspect = (p.img.naturalWidth && p.img.naturalHeight)
        ? p.img.naturalWidth / p.img.naturalHeight
        : 1.4;
      const reserved = (pillars.length - 1) * (PE_INACTIVE_W + PE_GAP);
      const maxWidth = Math.max(220, stackRect.width - reserved - PE_GAP);
      const minWidth = stackRect.width * 0.28;
      const idealWidth = stackRect.height * aspect;
      const finalWidth = Math.min(maxWidth, Math.max(minWidth, idealWidth));
      p.el.style.width = `${finalWidth}px`;
    };

    let activeIndex = 0;
    let hoverIndex = null;
    let peRenderRaf = null;

    const applyRender = () => {
      const displayIndex = hoverIndex !== null ? hoverIndex : activeIndex;
      pillars.forEach((p, i) => {
        const isDisplayed = i === displayIndex;
        p.el.classList.toggle('pe-active', isDisplayed);
        p.el.classList.toggle('pe-inactive', !isDisplayed);
        if (isDisplayed) {
          computeActiveWidth(p);
        } else {
          clearPillarWidth(p);
          p.infoLocked = false;
          p.el.classList.remove('pe-info-open');
        }
      });
    };
    /* rAF-batched so rapid pointer movement across many strips (each
       triggering mouseenter/mouseleave) only ever costs one layout
       pass per frame instead of stacking up and lagging behind */
    const render = () => {
      if (peRenderRaf) return;
      peRenderRaf = requestAnimationFrame(() => { peRenderRaf = null; applyRender(); });
    };

    /* while true, the scroll listener's live "open whichever pillar is
       centered" logic backs off — set right after a deliberate tap so
       that pillar's own centering scroll doesn't get overridden mid-
       animation by the very scroll it just triggered */
    let ignoreScrollAuto = false;
    const openPillar = (i) => {
      activeIndex = i; hoverIndex = null;
      ignoreScrollAuto = true;
      render();
      if (window.innerWidth <= 640) pillars[i].el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      /* generous safety-net timeout — the primary way this clears is the
         next touchstart (below). Boundary pillars (first/last) can't
         actually be scrolled to dead-center since there's no trailing
         content, so the browser's settle-scroll can run past a short
         timeout here; if it did, the live "center" detector would
         immediately reassign activeIndex to a neighbour and undo the
         tap the moment it re-armed. */
      setTimeout(() => { ignoreScrollAuto = false; }, 1200);
    };

    pillars.forEach((p, i) => {
      p.el.addEventListener('mouseenter', () => { hoverIndex = i; render(); });
      p.el.addEventListener('mouseleave', () => { hoverIndex = null; render(); });
      p.el.addEventListener('focus', () => { hoverIndex = i; render(); });
      p.el.addEventListener('blur', () => { hoverIndex = null; render(); });
      p.el.addEventListener('click', (e) => { if (!e.target.closest('.pe-info-btn')) openPillar(i); });
      p.el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPillar(i); }
      });

      /* touch browsers commonly cancel the synthetic "click" after any
         scroll happens on an ancestor, which is exactly this stack —
         so a real tap (no meaningful finger movement) is detected by
         hand and used as the authoritative way to open a pillar */
      let touchStartX = 0, touchStartY = 0, touchMoved = false;
      p.el.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        touchStartX = t.clientX; touchStartY = t.clientY; touchMoved = false;
        ignoreScrollAuto = false;
      }, { passive: true });
      p.el.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        if (Math.abs(t.clientX - touchStartX) > 8 || Math.abs(t.clientY - touchStartY) > 8) touchMoved = true;
      }, { passive: true });
      p.el.addEventListener('touchend', (e) => { if (!touchMoved && !e.target.closest('.pe-info-btn')) openPillar(i); });
    });

    applyRender();

    let peResizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(peResizeTimer);
      peResizeTimer = setTimeout(() => {
        const displayIndex = hoverIndex !== null ? hoverIndex : activeIndex;
        if (window.innerWidth <= 640) pillars.forEach(clearPillarWidth);
        else computeActiveWidth(pillars[displayIndex]);
        updateScrollHint();
      }, 150);
    });

    /* mobile: dragging/flicking the strip opens whichever pillar is
       nearest the center as you scroll, live — no tap required — and
       a small vertical cue on the right reads "More" until the strip
       is scrolled all the way, then switches to "End" */
    const scrollHint = document.getElementById('pe-scroll-hint');
    const updateScrollHint = () => {
      if (!scrollHint) return;
      const maxScroll = peStack.scrollWidth - peStack.clientWidth;
      if (window.innerWidth > 640 || maxScroll <= 4) {
        scrollHint.style.display = 'none';
        return;
      }
      scrollHint.style.display = '';
      const atEnd = peStack.scrollLeft >= maxScroll - 4;
      scrollHint.classList.toggle('pe-hint-end', atEnd);
      scrollHint.querySelector('span').textContent = atEnd ? 'End' : 'More';
    };
    const pillarAtScrollCenter = () => {
      /* at either scroll limit there's no trailing/leading content left
         to center against, so the nearest-to-center math can never
         actually land on the first/last pillar — snap to it directly
         whenever the strip is scrolled all the way to that edge */
      const maxScroll = peStack.scrollWidth - peStack.clientWidth;
      if (peStack.scrollLeft <= 2) return 0;
      if (peStack.scrollLeft >= maxScroll - 2) return pillars.length - 1;
      const centerX = peStack.getBoundingClientRect().left + peStack.clientWidth / 2;
      let closestIndex = activeIndex;
      let closestDist = Infinity;
      pillars.forEach((p, i) => {
        const r = p.el.getBoundingClientRect();
        const dist = Math.abs((r.left + r.width / 2) - centerX);
        if (dist < closestDist) { closestDist = dist; closestIndex = i; }
      });
      return closestIndex;
    };
    let peScrollRaf = null;
    peStack.addEventListener('scroll', () => {
      if (peScrollRaf) return;
      peScrollRaf = requestAnimationFrame(() => {
        peScrollRaf = null;
        updateScrollHint();
        if (window.innerWidth > 640 || ignoreScrollAuto) return;
        const idx = pillarAtScrollCenter();
        if (idx !== activeIndex) { activeIndex = idx; hoverIndex = null; applyRender(); }
      });
    }, { passive: true });
    updateScrollHint();
  }
  /* ---- product constellation (circular auto-rotating showcase) ----
     supports any number of orbit-showcase instances on a page, each
     driven by its own product list (keyed off data-orbit) and each
     ring built to fit however many items that list has. */
  const ORBIT_PRODUCTS = {
    women: [
      { name: 'Diamond Ring', img: supabaseImage('Products/ring.png'), desc: 'A refined diamond ring crafted with precision and timeless detailing.' },
      { name: 'Diamond Earrings', img: supabaseImage('Products/earring.png'), desc: 'Elegant earrings balanced for comfort and finished neatly from every angle.' },
      { name: 'Fine Pendant', img: supabaseImage('Products/pendant.jpg'), desc: 'A sophisticated pendant defined by refined craftsmanship and exceptional finish.' },
      { name: 'Fine Necklace', img: supabaseImage('Products/necklace.png'), desc: 'An elegant necklace designed with refined proportions and exceptional finishing.' },
      { name: 'Brooch Detail', img: supabaseImage('Products/brooches.jpg'), desc: 'A statement brooch, precisely pinned and finished with quiet confidence.' },
      { name: 'Gold Cuff', img: supabaseImage('Products/ring.png'), desc: 'A rigid gold cuff, comfortable to wear and finished with a confident line.' }
    ],
    men: [
      { name: 'Diamond Ring', img: supabaseImage('Products/ring.png'), desc: 'A refined diamond ring crafted with precision and timeless detailing.' },
      { name: 'Fine Necklace', img: supabaseImage('Products/necklace.png'), desc: 'An elegant necklace designed with refined proportions and exceptional finishing.' },
      { name: "Men's Gold Bracelet", img: supabaseImage('Products/mens.png'), desc: 'Strong, comfortable jewellery, refined for everyday confidence.' },
      { name: 'Diamond Earrings', img: supabaseImage('Products/earring.png'), desc: 'Elegant earrings balanced for comfort and finished neatly from every angle.' },
      { name: 'Brooch Detail', img: supabaseImage('Products/brooches.jpg'), desc: 'A statement brooch, precisely pinned and finished with quiet confidence.' }
    ]
  };
  document.querySelectorAll('.orbit-showcase[data-orbit]').forEach(orbitShowcase => {
    const products = ORBIT_PRODUCTS[orbitShowcase.dataset.orbit];
    if (!products || !products.length) return;
    const total = products.length;
    const ring = orbitShowcase.querySelector('.orbit-ring');
    const centerImg = orbitShowcase.querySelector('.orbit-center-img');
    const nameEl = orbitShowcase.querySelector('.orbit-name');
    const descEl = orbitShowcase.querySelector('.orbit-desc');
    const textEl = orbitShowcase.querySelector('.orbit-text');
    if (!ring || !centerImg || !nameEl || !descEl || !textEl) return;

    /* build one ring slot per non-center product, evenly spaced around the circle */
    const ringCount = total - 1;
    const angleStep = 360 / ringCount;
    ring.innerHTML = '';
    for (let i = 0; i < ringCount; i++) {
      const angle = (i - (ringCount - 1) / 2) * angleStep;
      const item = document.createElement('div');
      item.className = 'orbit-item';
      item.style.transform = `rotate(${angle}deg) translate(var(--orbit-r)) rotate(${-angle}deg)`;
      item.innerHTML = '<div class="orbit-item-face"><img alt=""></div>';
      ring.appendChild(item);
    }
    const orbitItems = Array.from(ring.querySelectorAll('.orbit-item'));
    const faceImgs = orbitItems.map(item => item.querySelector('.orbit-item-face img'));
    faceImgs.forEach(img => { img.onerror = () => { img.style.opacity = '0'; }; });
    centerImg.onerror = () => { centerImg.style.opacity = '0'; };
    let active = 0;

    const applyContent = () => {
      const p = products[active];
      centerImg.style.opacity = '';
      centerImg.src = p.img;
      centerImg.alt = p.name;
      nameEl.textContent = p.name;
      descEl.textContent = p.desc;
      for (let i = 1; i < total; i++) {
        const outerIndex = (active + i) % total;
        const outer = products[outerIndex];
        const img = faceImgs[i - 1];
        img.style.opacity = '';
        img.src = outer.img;
        img.alt = outer.name;
        orbitItems[i - 1].dataset.productIndex = outerIndex;
      }
      requestAnimationFrame(() => {
        centerImg.classList.add('in');
        textEl.classList.add('in');
      });
    };

    const render = (animate) => {
      if (!animate) { applyContent(); return; }
      centerImg.classList.remove('in');
      textEl.classList.remove('in');
      setTimeout(applyContent, 620);
    };

    const goTo = (index) => {
      if (index === active) return;
      active = ((index % total) + total) % total;
      render(true);
    };

    let autoplayTimer = null;
    const startAutoplay = () => {
      autoplayTimer = setInterval(() => goTo(active + 1), 4500);
    };
    const resetAutoplay = () => { clearInterval(autoplayTimer); startAutoplay(); };

    orbitItems.forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.productIndex, 10);
        if (!isNaN(idx)) {
          goTo(idx);
          resetAutoplay();
        }
      });
    });

    render(false);
    startAutoplay();
  });
  /* ---- testimonial carousel (one centered, slides left/in from right, autoplays) ---- */
  const testimonialCarousel = document.getElementById('testimonial-carousel');
  if (testimonialCarousel) {
    const testimonials = [
      { quote: "We've worked with several manufacturing partners over the years, but Blue Gems and Jewels stands out for its consistency, craftsmanship, and attention to detail. Every piece reflects the standards our clientele expects.", attrib: 'Third-Generation Jeweller from Delhi' },
      { quote: "Their team understands the expectations of premium jewellery retail. From design execution to final finishing, the quality has always been exceptional.", attrib: "Bengaluru's Leading Luxury Jewellery Boutique" },
      { quote: "Reliability is rare in this industry, and Blue Gems and Jewels has earned our complete trust. They consistently deliver products that exceed expectations.", attrib: 'Leading Jewellery Retailer from Chennai' },
      { quote: "Our relationship with Blue Gems and Jewels has been built on years of trust, transparency, and outstanding craftsmanship. They have become an integral part of our business.", attrib: "Pune's Top Jewellery Entrepreneur" },
      { quote: "When serving discerning customers, quality cannot be compromised. Blue Gems and Jewels has consistently helped us maintain the highest standards.", attrib: 'Premium Jewellery Business Owner from Hyderabad' }
    ];
    const total = testimonials.length;
    const slide = document.getElementById('testimonial-slide');
    const textEl = document.getElementById('testimonial-text');
    const attribEl = document.getElementById('testimonial-attrib');
    const dotsWrap = document.getElementById('testimonial-dots');
    testimonials.forEach(() => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'testimonial-dot';
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);
    let active = 0;
    let switching = false;

    const applyContent = () => {
      const t = testimonials[active];
      textEl.textContent = t.quote;
      attribEl.textContent = t.attrib;
      dots.forEach((d, i) => d.classList.toggle('active', i === active));
      slide.classList.remove('out');
      slide.classList.add('in');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        slide.classList.remove('in');
        setTimeout(() => { switching = false; }, 600);
      }));
    };

    const goTo = (index) => {
      if (switching) return;
      switching = true;
      active = ((index % total) + total) % total;
      slide.classList.add('out');
      setTimeout(applyContent, 600);
    };
    const next = () => goTo(active + 1);
    const prev = () => goTo(active - 1);

    applyContent();
    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetAutoplay(); }));

    const AUTOPLAY_MS = 2500;
    let autoplayTimer = setInterval(next, AUTOPLAY_MS);
    const resetAutoplay = () => { clearInterval(autoplayTimer); autoplayTimer = setInterval(next, AUTOPLAY_MS); };
    testimonialCarousel.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    testimonialCarousel.addEventListener('mouseleave', resetAutoplay);

    /* swipe/drag left or right to change testimonial */
    let dragStartX = 0;
    let dragging = false;
    const dragThreshold = 40;
    const onDragStart = (x) => { dragStartX = x; dragging = true; };
    const onDragEnd = (x) => {
      if (!dragging) return;
      dragging = false;
      const dx = x - dragStartX;
      if (Math.abs(dx) > dragThreshold) {
        dx < 0 ? next() : prev();
        resetAutoplay();
      }
    };
    testimonialCarousel.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientX), { passive: true });
    testimonialCarousel.addEventListener('touchend', (e) => onDragEnd(e.changedTouches[0].clientX), { passive: true });
    testimonialCarousel.addEventListener('mousedown', (e) => onDragStart(e.clientX));
    testimonialCarousel.addEventListener('mouseup', (e) => onDragEnd(e.clientX));
    testimonialCarousel.addEventListener('mouseleave', () => { dragging = false; });
  }
  /* ---- investor relations: tabs + accordion ---- */
  const irPanel = document.getElementById('ir-panel');
  const irTabsFloat = document.getElementById('ir-tabs');
  if (irPanel && irTabsFloat) {
    const tabs = Array.from(irTabsFloat.querySelectorAll('.ir-tab'));
    const panels = Array.from(irPanel.querySelectorAll('.ir-tab-panel'));
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-tab');
        tabs.forEach(t => t.classList.toggle('active', t === tab));
        panels.forEach(p => p.classList.toggle('active', p.getAttribute('data-panel') === key));
      });
    });
    irPanel.querySelectorAll('.ir-item-head').forEach(head => {
      head.addEventListener('click', () => {
        head.closest('.ir-item').classList.toggle('open');
      });
    });
  }
  /* ---- counter animation ---- */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    let started = false;
    const counterIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          const dur = 1600;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          counterIo.disconnect();
        }
      });
    }, { threshold: 0.4 });
    counterIo.observe(el);
  });
  /* ---- contact form (no backend — demo only) ---- */
  const form = document.getElementById('inquiry-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Message Sent ✓';
      btn.style.background = 'var(--gold-400)';
      form.reset();
      setTimeout(() => { btn.textContent = original; }, 3200);
    });
  }
});
/* ============================================================
   SHARED NAV
   ============================================================ */
const NAV_HTML = `
<nav class="nav">
  <a href="index.html" class="brand"><img src="assets/logo.jpg" alt="Blue Gems and Jewels" class="brand-logo"></a>
  <div class="nav-links">
    <a href="about.html" data-key="about">About</a>
    <a href="products.html" data-key="products">Products</a>
    <div class="nav-drop">
      <a href="certifications.html" data-key="certifications events investor-relations">Company<span class="caret">&#9662;</span></a>
      <div class="nav-drop-menu">
        <a href="certifications.html">Certifications</a>
        <a href="events.html">Events &amp; Exhibitions</a>
        <a href="investor-relations.html">Investor Relations</a>
      </div>
    </div>
    <a href="contact.html" class="nav-cta" data-key="contact">Visit Factory</a>
  </div>
  <div class="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></div>
</nav>
<div class="mobile-panel">
  <a href="index.html">Home</a>
  <a href="about.html">About</a>
  <a href="products.html">Products</a>
  <div class="mp-group">
    <span class="mp-heading">Company</span>
    <a href="certifications.html">Certifications</a>
    <a href="events.html">Events &amp; Exhibitions</a>
    <a href="investor-relations.html">Investor Relations</a>
  </div>
  <a href="contact.html">Contact</a>
</div>`;
