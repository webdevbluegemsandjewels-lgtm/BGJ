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
    const avatarEl = document.getElementById('founder-modal-avatar');
    const openModal = (card) => {
      nameEl.textContent = card.dataset.name || '';
      titleEl.textContent = card.dataset.title || '';
      bioEl.textContent = card.dataset.bio || '';
      const avatar = card.querySelector('.founder-avatar');
      avatarEl.textContent = avatar ? avatar.textContent : '';
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
  /* ---- product constellation (circular auto-rotating showcase) ---- */
  const orbitShowcase = document.getElementById('orbit-showcase');
  if (orbitShowcase) {
    const products = [
      { name: 'Diamond Ring', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=500&q=70', desc: 'A refined diamond ring crafted with precision and timeless detailing.' },
      { name: 'Diamond Earrings', img: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=500&q=70', desc: 'Elegant earrings balanced for comfort and finished neatly from every angle.' },
      { name: 'Diamond Pendant', img: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=500&q=70', desc: 'A sophisticated pendant defined by refined craftsmanship and exceptional finish.' },
      { name: 'Diamond Necklace', img: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?auto=format&fit=crop&w=500&q=70', desc: 'An elegant necklace designed with refined proportions and exceptional finishing.' },
      { name: 'Gold Bracelet', img: 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=500&q=70', desc: 'A dependable bracelet built for daily movement without compromising refinement.' },
      { name: 'Diamond Brooch', img: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=500&q=70', desc: 'A statement brooch, precisely pinned and finished with quiet confidence.' },
      { name: "Men's Jewellery", img: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=500&q=70', desc: 'Strong, comfortable jewellery, refined for everyday confidence.' }
    ];
    const total = products.length;
    const centerImg = document.getElementById('orbit-center-img');
    const nameEl = document.getElementById('orbit-name');
    const descEl = document.getElementById('orbit-desc');
    const textEl = document.getElementById('orbit-text');
    const orbitItems = Array.from(orbitShowcase.querySelectorAll('.orbit-item'));
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
  }
  /* ---- testimonial carousel (one centered, slides left/in from right, autoplays) ---- */
  const testimonialCarousel = document.getElementById('testimonial-carousel');
  if (testimonialCarousel) {
    const testimonials = [
      { quote: "We've worked with several manufacturing partners over the years, but Blue Gems and Jewels stands out for its consistency, craftsmanship, and attention to detail. Every piece reflects the standards our clientele expects.", attrib: 'Third-Generation Jeweller' },
      { quote: "Their team understands the expectations of premium jewellery retail. From design execution to final finishing, the quality has always been exceptional.", attrib: 'Owner of a Luxury Jewellery Boutique' },
      { quote: "Reliability is rare in this industry, and Blue Gems and Jewels has earned our complete trust. They consistently deliver products that exceed expectations.", attrib: 'Leading Jewellery Retailer' },
      { quote: "Our relationship with Blue Gems and Jewels has been built on years of trust, transparency, and outstanding craftsmanship. They have become an integral part of our business.", attrib: 'Established Jewellery Entrepreneur' },
      { quote: "When serving discerning customers, quality cannot be compromised. Blue Gems and Jewels has consistently helped us maintain the highest standards.", attrib: 'Premium Jewellery Business Owner' }
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
  <a href="index.html" class="brand"><img src="assets/logo.png" alt="Blue Gems and Jewels" class="brand-logo"></a>
  <div class="nav-links">
    <a href="about.html" data-key="about">About</a>
    <div class="nav-drop">
      <a href="manufacturing.html" data-key="manufacturing craftsmanship workforce">Manufacturing<span class="caret">&#9662;</span></a>
      <div class="nav-drop-menu">
        <a href="manufacturing.html">Manufacturing Process</a>
        <a href="craftsmanship.html">Design &amp; Craftsmanship</a>
        <a href="workforce.html">Workforce &amp; Machinery</a>
      </div>
    </div>
    <a href="products.html" data-key="products">Products</a>
    <div class="nav-drop">
      <a href="certifications.html" data-key="certifications events">Company<span class="caret">&#9662;</span></a>
      <div class="nav-drop-menu">
        <a href="certifications.html">Certifications</a>
        <a href="events.html">Events &amp; Exhibitions</a>
      </div>
    </div>
    <a href="contact.html" class="nav-cta" data-key="contact">Visit Factory</a>
  </div>
  <div class="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></div>
</nav>
<div class="mobile-panel">
  <a href="index.html">Home</a>
  <a href="about.html">About</a>
  <div class="mp-group">
    <span class="mp-heading">Manufacturing</span>
    <a href="manufacturing.html">Process</a>
    <a href="craftsmanship.html">Craftsmanship</a>
    <a href="workforce.html">Workforce &amp; Machinery</a>
  </div>
  <a href="products.html">Products</a>
  <div class="mp-group">
    <span class="mp-heading">Company</span>
    <a href="certifications.html">Certifications</a>
    <a href="events.html">Events &amp; Exhibitions</a>
  </div>
  <a href="contact.html">Contact</a>
</div>`;
