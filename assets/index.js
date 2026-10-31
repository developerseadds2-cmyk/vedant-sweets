/* ==========================================================================
   Artisanal Confirmation & Alert Modal System
   ========================================================================== */
function showConfirmModal({
  title = 'Please Confirm',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false
} = {}) {
  return new Promise((resolve) => {
    let modal = document.getElementById('vs-custom-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'vs-custom-confirm-modal';
      modal.className = 'vs-modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="vs-modal-box">
        <div class="vs-modal-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
          </svg>
        </div>
        <h3 class="vs-modal-title">${title}</h3>
        <p class="vs-modal-message">${message}</p>
        <div class="vs-modal-actions">
          <button type="button" class="vs-modal-btn vs-modal-btn--cancel" data-modal-cancel>
            ${cancelText}
          </button>
          <button type="button" class="vs-modal-btn ${isDestructive ? 'vs-modal-btn--confirm' : 'vs-modal-btn--primary'}" data-modal-confirm>
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    const close = (result) => {
      modal.classList.remove('is-active');
      setTimeout(() => {
        resolve(result);
      }, 200);
    };

    modal.querySelector('[data-modal-confirm]').onclick = () => close(true);
    modal.querySelector('[data-modal-cancel]').onclick = () => close(false);
    modal.onclick = (e) => {
      if (e.target === modal) close(false);
    };

    // Trigger reflow & open
    void modal.offsetWidth;
    modal.classList.add('is-active');
  });
}

function showAlertModal(message, title = 'Notice') {
  return new Promise((resolve) => {
    let modal = document.getElementById('vs-custom-alert-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'vs-custom-alert-modal';
      modal.className = 'vs-modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="vs-modal-box">
        <div class="vs-modal-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="vs-modal-title">${title}</h3>
        <p class="vs-modal-message">${message}</p>
        <div class="vs-modal-actions">
          <button type="button" class="vs-modal-btn vs-modal-btn--primary" data-modal-ok>
            Okay
          </button>
        </div>
      </div>
    `;

    const close = () => {
      modal.classList.remove('is-active');
      setTimeout(resolve, 200);
    };

    modal.querySelector('[data-modal-ok]').onclick = close;
    modal.onclick = (e) => {
      if (e.target === modal) close();
    };

    void modal.offsetWidth;
    modal.classList.add('is-active');
  });
}

if (!customElements.get('vedanta-hero-slider')) {
  class VedantaHeroSlider extends HTMLElement {
    connectedCallback() {
      this.slides = Array.from(this.querySelectorAll('[data-hero-slide]'));
      this.dots = Array.from(this.querySelectorAll('[data-hero-index]'));
      this.index = Math.max(0, this.slides.findIndex((slide) => slide.classList.contains('is-active')));
      this.interval = Number(this.dataset.interval) || 5000;
      this.autoplayEnabled = this.dataset.autoplay === 'true';
      this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.playing = this.autoplayEnabled && !this.motionPreference.matches;

      this.handleClick = this.handleClick.bind(this);
      this.handleKeydown = this.handleKeydown.bind(this);
      this.handleFocus = this.handleFocus.bind(this);
      this.handleMotionChange = this.handleMotionChange.bind(this);
      this.addEventListener('click', this.handleClick);
      this.addEventListener('keydown', this.handleKeydown);
      this.addEventListener('focusin', this.handleFocus);
      this.motionPreference.addEventListener('change', this.handleMotionChange);
      this.updateAutoplay();
    }

    disconnectedCallback() {
      this.stopAutoplay();
      this.removeEventListener('click', this.handleClick);
      this.removeEventListener('keydown', this.handleKeydown);
      this.removeEventListener('focusin', this.handleFocus);
      this.motionPreference.removeEventListener('change', this.handleMotionChange);
    }

    handleClick(event) {
      const button = event.target.closest('button[data-hero-action], button[data-hero-index]');
      if (!button || !this.contains(button)) return;

      if (button.dataset.heroAction === 'previous') {
        this.showSlide(this.index - 1);
      } else if (button.dataset.heroAction === 'next') {
        this.showSlide(this.index + 1);
      } else if (button.dataset.heroAction === 'toggle') {
        this.playing = !this.playing && !this.motionPreference.matches;
        this.updateAutoplay();
      } else if (button.hasAttribute('data-hero-index')) {
        this.showSlide(Number(button.dataset.heroIndex));
      }
    }

    handleKeydown(event) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.showSlide(this.index - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.showSlide(this.index + 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        this.showSlide(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        this.showSlide(this.slides.length - 1);
      }
    }

    handleMotionChange(event) {
      if (event.matches) this.playing = false;
      this.updateAutoplay();
    }

    handleFocus() {
      if (!this.playing) return;
      this.playing = false;
      this.updateAutoplay();
    }

    showSlide(nextIndex) {
      this.index = (nextIndex + this.slides.length) % this.slides.length;
      this.updateAutoplay();
    }

    updateSlides() {
      this.querySelector('.vs-hero-slider__slides').setAttribute('aria-live', this.playing ? 'off' : 'polite');
      this.slides.forEach((slide, index) => {
        const active = index === this.index;
        slide.hidden = !active;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });

      this.dots.forEach((dot, index) => {
        const active = index === this.index;
        dot.classList.toggle('is-active', active);
        if (active) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });

      this.classList.toggle('is-playing', this.playing);
      this.classList.toggle('is-paused', this.autoplayEnabled && !this.playing);
      const toggle = this.querySelector('[data-hero-action="toggle"]');
      if (toggle) {
        toggle.setAttribute('aria-label', this.playing ? toggle.dataset.pauseLabel : toggle.dataset.playLabel);
      }
    }

    updateAutoplay() {
      this.stopAutoplay();
      this.updateSlides();
      if (!this.playing || this.slides.length < 2) return;
      this.timer = window.setInterval(() => this.showSlide(this.index + 1), this.interval);
    }

    stopAutoplay() {
      if (this.timer) {
        window.clearInterval(this.timer);
        this.timer = null;
      }
    }
  }

  customElements.define('vedanta-hero-slider', VedantaHeroSlider);
}

function closeMobileMenu(header) {
  const toggle = header.querySelector('[data-mobile-menu-toggle]');
  const navigation = header.querySelector('.vs-navigation');
  if (!toggle || !navigation) return;

  header.dataset.menuOpen = 'false';
  navigation.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', toggle.dataset.openLabel);
}

function prepareMobileMenus(root = document) {
  root.querySelectorAll('.vs-header-root').forEach((header) => {
    header.dataset.mobileNavReady = 'true';
    header.dataset.menuOpen = 'false';
  });
}

prepareMobileMenus();
document.addEventListener('shopify:section:load', (event) => prepareMobileMenus(event.target));

document.addEventListener('click', (event) => {
  const closeControl = event.target.closest('[data-mobile-menu-close]');
  if (closeControl) {
    const header = closeControl.closest('.vs-header-root');
    if (header) {
      closeMobileMenu(header);
      if (closeControl.classList.contains('vs-navigation__close')) {
        header.querySelector('[data-mobile-menu-toggle]')?.focus();
      }
    }
    return;
  }

  const toggle = event.target.closest('[data-mobile-menu-toggle]');
  if (toggle) {
    const header = toggle.closest('.vs-header-root');
    const navigation = header?.querySelector('.vs-navigation');
    if (!header || !navigation) return;

    const isOpen = toggle.getAttribute('aria-expanded') !== 'true';
    header.dataset.menuOpen = String(isOpen);
    navigation.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? toggle.dataset.closeLabel : toggle.dataset.openLabel);
    if (isOpen) navigation.querySelector('[data-mobile-menu-close]')?.focus();
    return;
  }

  const navLink = event.target.closest('.vs-navigation a');
  if (navLink) {
    // If it's the mobile accordion toggle, DO NOT close the mobile menu!
    if ((navLink.hasAttribute('data-mobile-mega-toggle') || navLink.hasAttribute('data-mobile-submenu-toggle')) && window.innerWidth <= 1050) {
      return;
    }
    const header = event.target.closest('.vs-header-root');
    if (header) closeMobileMenu(header);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const header = document.querySelector('.vs-header-root[data-menu-open="true"]');
  if (!header) return;

  closeMobileMenu(header);
  header.querySelector('[data-mobile-menu-toggle]')?.focus();
});

window.matchMedia('(min-width: 1051px)').addEventListener('change', (event) => {
  if (!event.matches) return;
  document.querySelectorAll('.vs-header-root[data-menu-open="true"]').forEach(closeMobileMenu);
});

// Preloader
const preloader = document.getElementById('vs-preloader');
if (preloader) {
  const hidePreloader = () => {
    preloader.classList.add('is-loaded');
    setTimeout(() => preloader.remove(), 600);
  };
  if (document.readyState === 'complete') {
    hidePreloader();
  } else {
    window.addEventListener('load', hidePreloader);
    setTimeout(hidePreloader, 2500); // Fail-safe fallback
  }
}

// Sticky header blur on scroll
const headerRoot = document.querySelector('.vs-header-root[data-sticky="true"]');
if (headerRoot) {
  const onScroll = () => {
    headerRoot.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initCategoryCarousels(root = document) {
  // If on tablet/phone (<= 1024px), sections render in grid mode without slider initialization
  if (window.innerWidth <= 1024) return;

  root.querySelectorAll('[data-category-carousel]').forEach((carousel) => {
    if (carousel.dataset.carouselReady === 'true') return;

    const track = carousel.querySelector('[data-carousel-track]');
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    if (!track) return;

    const originalCards = Array.from(track.querySelectorAll('.vs-category-card, .vs-category-circle-card'));
    if (originalCards.length < 2) return;

    const enableLoop = carousel.dataset.loop !== 'false';
    const enableAutoplay = carousel.dataset.autoplay !== 'false';
    const interval = Math.max(1800, parseInt(carousel.dataset.interval, 10) || 3000);

    let singleSetWidth = 0;
    let isNormalizing = false;
    let autoplayTimer = null;

    if (enableLoop) {
      // Create before-clones and after-clones for seamless looping
      const fragmentBefore = document.createDocumentFragment();
      const fragmentAfter = document.createDocumentFragment();

      originalCards.forEach((card) => {
        const cloneBefore = card.cloneNode(true);
        cloneBefore.setAttribute('aria-hidden', 'true');
        cloneBefore.dataset.clone = 'before';
        fragmentBefore.appendChild(cloneBefore);

        const cloneAfter = card.cloneNode(true);
        cloneAfter.setAttribute('aria-hidden', 'true');
        cloneAfter.dataset.clone = 'after';
        fragmentAfter.appendChild(cloneAfter);
      });

      track.insertBefore(fragmentBefore, track.firstChild);
      track.appendChild(fragmentAfter);

      // Measure offset between Set 0 and Set 1
      const firstOriginal = track.children[originalCards.length];
      const measureWidth = () => {
        singleSetWidth = firstOriginal.offsetLeft - track.children[0].offsetLeft;
        if (singleSetWidth > 0 && track.scrollLeft < 20) {
          track.style.scrollBehavior = 'auto';
          track.scrollLeft = singleSetWidth;
          track.style.scrollBehavior = '';
        }
      };

      measureWidth();
      requestAnimationFrame(measureWidth);
      window.addEventListener('resize', measureWidth);

      // Boundary reset for seamless infinite loop
      track.addEventListener(
        'scroll',
        () => {
          if (isNormalizing || singleSetWidth <= 0) return;
          if (track.scrollLeft >= singleSetWidth * 2 - 10) {
            isNormalizing = true;
            track.style.scrollBehavior = 'auto';
            track.scrollLeft -= singleSetWidth;
            track.style.scrollBehavior = '';
            requestAnimationFrame(() => {
              isNormalizing = false;
            });
          } else if (track.scrollLeft <= 10) {
            isNormalizing = true;
            track.style.scrollBehavior = 'auto';
            track.scrollLeft += singleSetWidth;
            track.style.scrollBehavior = '';
            requestAnimationFrame(() => {
              isNormalizing = false;
            });
          }
        },
        { passive: true }
      );

      if (prevBtn) prevBtn.disabled = false;
      if (nextBtn) nextBtn.disabled = false;
    }

    const getStep = () => {
      const card = track.querySelector('.vs-category-circle-card, .vs-category-card');
      return card ? card.offsetWidth + 28 : 200;
    };

    const scrollNext = () => {
      track.scrollBy({ left: getStep(), behavior: 'smooth' });
    };

    const scrollPrev = () => {
      track.scrollBy({ left: -getStep(), behavior: 'smooth' });
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        scrollPrev();
        restartAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        scrollNext();
        restartAutoplay();
      });
    }

    // Autoplay functionality
    const startAutoplay = () => {
      if (!enableAutoplay || autoplayTimer) return;
      autoplayTimer = window.setInterval(scrollNext, interval);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const restartAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('touchstart', stopAutoplay, { passive: true });
    carousel.addEventListener('touchend', startAutoplay, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      startAutoplay();
    }

    carousel.dataset.carouselReady = 'true';
  });
}

initCategoryCarousels();
document.addEventListener('shopify:section:load', (event) => initCategoryCarousels(event.target));

// Collection Filter Sidebar Toggle & AJAX Filter Updating
function initCollectionFilters() {
  document.addEventListener('click', (event) => {
    const toggleBtn = event.target.closest('[data-toggle-filters]');
    const backdrop = event.target.closest('[data-filter-backdrop]');
    const sidebar = document.getElementById('vs-filter-sidebar');
    const backdropEl = document.querySelector('[data-filter-backdrop]');

    if (toggleBtn && sidebar) {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = sidebar.classList.toggle('is-open');
      if (backdropEl) backdropEl.classList.toggle('is-active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      return;
    }

    if (backdrop && sidebar) {
      event.preventDefault();
      event.stopPropagation();
      sidebar.classList.remove('is-open');
      backdrop.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  });

  // AJAX Collection Navigation & Filter updating without page refresh
  async function loadCollectionPage(url) {
    const catalogContainer = document.querySelector('.vs-catalog-content');
    if (!catalogContainer) {
      window.location.href = url;
      return;
    }

    // Visual loading state
    catalogContainer.style.opacity = '0.45';
    catalogContainer.style.pointerEvents = 'none';

    try {
      const response = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (!response.ok) throw new Error('Network response error');
      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // Update catalog content (products grid, toolbar count, pagination)
      const newCatalog = doc.querySelector('.vs-catalog-content');
      if (newCatalog) {
        catalogContainer.innerHTML = newCatalog.innerHTML;
      }

      // Update banner title & breadcrumbs
      const newBanner = doc.querySelector('.vs-collection-banner');
      const currentBanner = document.querySelector('.vs-collection-banner');
      if (newBanner && currentBanner) {
        currentBanner.innerHTML = newBanner.innerHTML;
      }

      // Update active state in sidebar filters
      const newSidebar = doc.querySelector('.vs-filter-sidebar');
      const currentSidebar = document.querySelector('.vs-filter-sidebar');
      if (newSidebar && currentSidebar) {
        currentSidebar.innerHTML = newSidebar.innerHTML;
      }

      // Update browser URL history
      window.history.pushState({ url }, '', url);
    } catch (err) {
      console.error('AJAX collection fetch error:', err);
      window.location.href = url;
    } finally {
      catalogContainer.style.opacity = '1';
      catalogContainer.style.pointerEvents = '';
    }
  }

  // Intercept category filter clicks for AJAX load
  document.addEventListener('click', (event) => {
    const link = event.target.closest('.vs-filter-link, .vs-filter-clear-all, .vs-empty-btn');
    if (link && link.href) {
      event.preventDefault();
      loadCollectionPage(link.href);
    }
  });

  // Intercept Sort By dropdown changes for AJAX sort
  document.addEventListener('change', (event) => {
    const sortSelect = event.target.closest('[data-collection-sort]');
    if (sortSelect) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('sort_by', sortSelect.value);
      loadCollectionPage(currentUrl.toString());
    }
  });

  // Handle browser back / forward navigation
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.url) {
      loadCollectionPage(event.state.url);
    } else {
      window.location.reload();
    }
  });

  // Interactive filter tag pills
  document.addEventListener('click', (event) => {
    const tag = event.target.closest('.vs-filter-tag');
    if (tag) {
      tag.classList.toggle('is-active');
    }
  });
}

initCollectionFilters();

/* ==========================================================================
   Mega Menu Dynamic Category & Product Hover Image Switching
   ========================================================================== */
function initMegaMenuTabs() {
  document.addEventListener('mouseover', (event) => {
    // 1. Support for Category Left-Nav Hover (data-mega-cat)
    const navItem = event.target.closest('.vs-megamenu__nav-item[data-mega-cat]');
    if (navItem) {
      const menu = navItem.closest('.vs-megamenu');
      if (menu) {
        const catKey = navItem.dataset.megaCat;
        const allNavItems = menu.querySelectorAll('.vs-megamenu__nav-item');
        allNavItems.forEach((item) => item.classList.remove('is-active'));
        navItem.classList.add('is-active');

        const allPanels = menu.querySelectorAll('.vs-megamenu__panel');
        allPanels.forEach((panel) => panel.classList.remove('is-active'));

        const targetPanel = menu.querySelector(`#mega-panel-${catKey}`);
        if (targetPanel) {
          targetPanel.classList.add('is-active');
          // Reset card back to default collection view when switching categories
          const card = targetPanel.querySelector('.vs-megamenu__photo-card');
          if (card && card.dataset.defaultImg) {
            const img = card.querySelector('.vs-megamenu__photo-img');
            const title = card.querySelector('.vs-megamenu__photo-title');
            const cta = card.querySelector('.vs-megamenu__photo-cta');
            if (img) img.src = card.dataset.defaultImg;
            if (title && card.dataset.defaultTitle) title.textContent = card.dataset.defaultTitle;
            if (cta && card.dataset.defaultCta) cta.textContent = card.dataset.defaultCta;
            if (card.dataset.defaultHref) card.href = card.dataset.defaultHref;
          }
        }
      }
      return;
    }

    // 2. Product link hover: Update right-side photo card to show that specific product's photo
    const prodLink = event.target.closest('.vs-megamenu__product-link[data-mega-prod-img]');
    if (prodLink) {
      const panel = prodLink.closest('.vs-megamenu__panel');
      if (panel) {
        const card = panel.querySelector('.vs-megamenu__photo-card');
        if (card) {
          const img = card.querySelector('.vs-megamenu__photo-img');
          const title = card.querySelector('.vs-megamenu__photo-title');
          const cta = card.querySelector('.vs-megamenu__photo-cta');

          if (img && prodLink.dataset.megaProdImg) {
            img.src = prodLink.dataset.megaProdImg;
          }
          if (title && prodLink.dataset.megaProdTitle) {
            title.textContent = prodLink.dataset.megaProdTitle;
          }
          if (cta) {
            cta.textContent = prodLink.dataset.megaProdPrice ? `Buy Now — ${prodLink.dataset.megaProdPrice} →` : 'View Product →';
          }
          card.href = prodLink.href;
        }
      }
      return;
    }

    // 3. Legacy fallback support
    const catItem = event.target.closest('.vs-megamenu__cat-item');
    if (!catItem) return;

    const targetId = catItem.dataset.megaTarget;
    if (!targetId) return;

    const menu = catItem.closest('.vs-megamenu');
    if (!menu) return;

    // Set active item in sidebar
    const allItems = menu.querySelectorAll('.vs-megamenu__cat-item');
    allItems.forEach((item) => {
      item.classList.remove('is-active');
      const tabLink = item.querySelector('.vs-megamenu__cat-link');
      if (tabLink) tabLink.setAttribute('aria-selected', 'false');
    });

    catItem.classList.add('is-active');
    const activeLink = catItem.querySelector('.vs-megamenu__cat-link');
    if (activeLink) activeLink.setAttribute('aria-selected', 'true');

    // Switch visible showcase tab panel
    const allPanels = menu.querySelectorAll('.vs-megamenu__tab-panel');
    allPanels.forEach((panel) => {
      panel.classList.remove('is-active');
    });

    const targetPanel = menu.querySelector(`#${targetId}`);
    if (targetPanel) {
      targetPanel.classList.add('is-active');
    }
  });
}

initMegaMenuTabs();

/* ==========================================================================
   Voice Search with Web Speech API
   ========================================================================== */
function initVoiceSearch() {
  const voiceButtons = document.querySelectorAll('[data-voice-search]');
  if (!voiceButtons.length) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  voiceButtons.forEach((btn) => {
    const form = btn.closest('form');
    const input = form ? form.querySelector('input[type="search"]') : null;
    if (!form || !input) return;

    if (!SpeechRecognition) {
      btn.title = 'Voice search is not supported in this browser';
      btn.style.opacity = '0.5';
      btn.addEventListener('click', () => {
        alert('Voice search is not supported in this browser. Please use Chrome, Edge, or Safari.');
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Indian English / Hindi context default

    let isListening = false;
    const defaultPlaceholder = input.getAttribute('placeholder') || 'Search sweets...';

    const setListeningState = (listening) => {
      isListening = listening;
      if (listening) {
        btn.classList.add('is-listening');
        input.setAttribute('placeholder', 'Listening... speak now...');
        input.focus();
      } else {
        btn.classList.remove('is-listening');
        input.setAttribute('placeholder', defaultPlaceholder);
      }
    };

    const startListening = () => {
      try {
        recognition.start();
        setListeningState(true);
      } catch (err) {
        console.warn('SpeechRecognition error:', err);
        setListeningState(false);
      }
    };

    btn.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
        setListeningState(false);
      } else {
        // Trigger browser's explicit permission prompt if not yet granted
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
              // Permission granted, close stream and start speech recognition
              stream.getTracks().forEach((track) => track.stop());
              startListening();
            })
            .catch((err) => {
              console.warn('getUserMedia audio permission error:', err);
              // Fallback to direct recognition attempt
              startListening();
            });
        } else {
          startListening();
        }
      }
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        input.value = transcript.trim();
        setListeningState(false);
        // Automatically submit the search
        setTimeout(() => {
          form.submit();
        }, 300);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Voice search error:', event.error);
      setListeningState(false);
      // Don't show aggressive alert popups if user canceled or speech paused
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        input.setAttribute('placeholder', 'Mic blocked – click icon at top address bar to Allow');
        setTimeout(() => {
          input.setAttribute('placeholder', defaultPlaceholder);
        }, 5000);
      }
    };

    recognition.onend = () => {
      setListeningState(false);
    };
  });
}

initVoiceSearch();

/* ==========================================================================
   Predictive Debounced AJAX Search & Popular Search Suggestions
   ========================================================================== */
function initPredictiveSearch() {
  const searchRoots = document.querySelectorAll('[data-predictive-search-root]');
  if (!searchRoots.length) return;

  searchRoots.forEach((root) => {
    const form = root.querySelector('[data-search-form]');
    const input = root.querySelector('[data-search-input]');
    const dropdown = root.querySelector('[data-search-dropdown]');
    const popularSection = root.querySelector('[data-search-popular]');
    const resultsSection = root.querySelector('[data-search-results]');
    const resultsList = root.querySelector('[data-search-list]');
    const loadingEl = root.querySelector('[data-search-loading]');
    const emptyEl = root.querySelector('[data-search-empty]');
    const footerEl = root.querySelector('[data-search-footer]');
    const queryText = root.querySelector('[data-search-query-text]');
    const queryTextFooter = root.querySelector('[data-search-query-text-footer]');
    const viewAllLink = root.querySelector('[data-search-view-all-link]');

    if (!input || !dropdown) return;

    let debounceTimer = null;
    let abortController = null;

    // Show Popular Searches state
    const showPopularState = () => {
      dropdown.classList.add('is-open');
      dropdown.setAttribute('aria-hidden', 'false');
      if (popularSection) popularSection.style.display = 'block';
      if (resultsSection) resultsSection.style.display = 'none';
    };

    // Close Dropdown
    const closeDropdown = () => {
      dropdown.classList.remove('is-open');
      dropdown.setAttribute('aria-hidden', 'true');
    };

    // Focus on Input: Show Popular Searches if query is empty
    input.addEventListener('focus', () => {
      const q = input.value.trim();
      if (!q) {
        showPopularState();
      } else {
        dropdown.classList.add('is-open');
        dropdown.setAttribute('aria-hidden', 'false');
      }
    });

    // Handle Popular Tag clicks
    root.querySelectorAll('[data-search-keyword]').forEach((tag) => {
      tag.addEventListener('click', (e) => {
        e.preventDefault();
        const keyword = tag.getAttribute('data-search-keyword');
        input.value = keyword;
        input.focus();
        fetchResults(keyword);
      });
    });

    // Debounced Input Handler
    input.addEventListener('input', (e) => {
      const query = e.target.value.trim();

      clearTimeout(debounceTimer);

      if (!query) {
        showPopularState();
        return;
      }

      // Show dropdown & loading state
      dropdown.classList.add('is-open');
      dropdown.setAttribute('aria-hidden', 'false');
      if (popularSection) popularSection.style.display = 'none';
      if (resultsSection) resultsSection.style.display = 'block';
      if (loadingEl) loadingEl.style.display = 'flex';
      if (emptyEl) emptyEl.style.display = 'none';
      if (resultsList) resultsList.innerHTML = '';
      if (footerEl) footerEl.style.display = 'none';

      // 300ms Debounce
      debounceTimer = setTimeout(() => {
        fetchResults(query);
      }, 300);
    });

    // Fetch predictive search results via Shopify Predictive Search API
    const fetchResults = (query) => {
      if (abortController) abortController.abort();
      abortController = new AbortController();

      const searchUrl = `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[options][unavailable_products]=show&resources[options][fields]=title,vendor,product_type,variants.title`;

      fetch(searchUrl, { signal: abortController.signal })
        .then((res) => {
          if (!res.ok) throw new Error('Search failed');
          return res.json();
        })
        .then((data) => {
          if (loadingEl) loadingEl.style.display = 'none';

          const products = data.resources?.results?.products || [];

          if (queryText) queryText.textContent = query;
          if (queryTextFooter) queryTextFooter.textContent = query;
          if (viewAllLink) viewAllLink.href = `/search?q=${encodeURIComponent(query)}`;

          if (products.length === 0) {
            if (emptyEl) emptyEl.style.display = 'block';
            if (resultsList) resultsList.innerHTML = '';
            if (footerEl) footerEl.style.display = 'none';
          } else {
            if (emptyEl) emptyEl.style.display = 'none';
            if (footerEl) footerEl.style.display = 'block';

            renderProductResults(products);
          }
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.warn('Predictive search error:', err);
          if (loadingEl) loadingEl.style.display = 'none';
        });
    };

    // Render HTML product list inside dropdown
    const renderProductResults = (products) => {
      if (!resultsList) return;

      const html = products.map((prod) => {
        const title = prod.title;
        const url = prod.url;
        const vendor = prod.vendor || 'Vedant Sweets';
        const img = prod.featured_image?.url || prod.image || '';
        const price = prod.price ? `Rs. ${parseFloat(prod.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '';

        return `
          <a href="${url}" class="vs-search-item">
            ${img ? `<img src="${img}" alt="${title}" class="vs-search-item__thumb" width="52" height="52" loading="lazy">` : '<div class="vs-search-item__thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem;">🍬</div>'}
            <div class="vs-search-item__info">
              <span class="vs-search-item__vendor">${vendor}</span>
              <h4 class="vs-search-item__title">${title}</h4>
              <span class="vs-search-item__price">${price}</span>
            </div>
          </a>
        `;
      }).join('');

      resultsList.innerHTML = html;
    };

    // Close when clicking outside
    document.addEventListener('click', (event) => {
      if (!root.contains(event.target)) {
        closeDropdown();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    });
  });
}

initPredictiveSearch();

/* ==========================================================================
   Delivery Location Modal & Geolocation Handler
   ========================================================================== */
function initDeliveryLocationModal() {
  const modal = document.getElementById('vs-location-modal');
  const openButtons = document.querySelectorAll('[data-open-location-modal]');
  const closeButtons = document.querySelectorAll('[data-close-location-modal]');
  const detectBtn = document.querySelector('[data-detect-location]');
  const form = document.querySelector('[data-location-form]');
  const feedback = document.querySelector('[data-location-feedback]');
  const locationDisplayEls = document.querySelectorAll('[data-current-delivery-address]');

  const pincodeInput = document.getElementById('vs-delivery-pincode');
  const addressInput = document.getElementById('vs-delivery-address');
  const cityInput = document.getElementById('vs-delivery-city');
  const stateInput = document.getElementById('vs-delivery-state');

  // Load saved location on page load
  try {
    const saved = localStorage.getItem('vs_delivery_location');
    if (saved) {
      const data = JSON.parse(saved);
      applyDeliveryLocation(data, false);
    }
  } catch (e) {
    console.warn('Error reading saved delivery location:', e);
  }

  function showFeedback(message, type = 'info') {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.style.display = 'block';
    feedback.style.color = type === 'error' ? '#c02626' : (type === 'success' ? '#006341' : '#555');
  }

  function clearFeedback() {
    if (!feedback) return;
    feedback.textContent = '';
    feedback.style.display = 'none';
  }

  function openModal() {
    const targetModal = document.getElementById('vs-location-modal');
    if (!targetModal) return;
    targetModal.classList.add('is-open');
    targetModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    clearFeedback();
  }

  function closeModal() {
    const targetModal = document.getElementById('vs-location-modal');
    if (!targetModal) return;
    targetModal.classList.remove('is-open');
    targetModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function applyDeliveryLocation(data, saveToStorage = true) {
    let displayTitle = '';
    if (data.city && data.pincode) {
      displayTitle = `${data.city} - ${data.pincode}`;
    } else if (data.city) {
      displayTitle = data.city;
    } else if (data.pincode) {
      displayTitle = `PIN ${data.pincode}`;
    } else if (data.address) {
      displayTitle = data.address.substring(0, 18) + (data.address.length > 18 ? '...' : '');
    } else {
      displayTitle = 'Selected';
    }

    locationDisplayEls.forEach((el) => {
      el.textContent = displayTitle;
      el.setAttribute('title', data.fullAddress || displayTitle);
    });

    if (pincodeInput && data.pincode) pincodeInput.value = data.pincode;
    if (addressInput && data.address) addressInput.value = data.address;
    if (cityInput && data.city) cityInput.value = data.city;
    if (stateInput && data.state) stateInput.value = data.state;

    if (saveToStorage) {
      try {
        localStorage.setItem('vs_delivery_location', JSON.stringify(data));
      } catch (err) {
        console.warn('Could not save location to localStorage:', err);
      }
    }
  }

  // Global event delegation for opening and closing modal
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-open-location-modal]');
    if (openBtn) {
      e.preventDefault();
      openModal();
      return;
    }

    const closeBtn = e.target.closest('[data-close-location-modal]');
    if (closeBtn) {
      e.preventDefault();
      closeModal();
      return;
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Geolocation detector
  if (detectBtn) {
    detectBtn.addEventListener('click', () => {
      if (!('geolocation' in navigator)) {
        showFeedback('Geolocation is not supported by your browser.', 'error');
        return;
      }

      const originalBtnHTML = detectBtn.innerHTML;
      detectBtn.disabled = true;
      detectBtn.style.opacity = '0.7';
      showFeedback('Detecting your current location... Please allow location access if prompted.', 'info');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          showFeedback('Location coordinates found. Fetching address details...', 'info');

          try {
            // Reverse geocode via OpenStreetMap Nominatim with fallback
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
            if (!res.ok) throw new Error('Network response failed');
            const result = await res.json();
            
            const addr = result.address || {};
            const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'My Location';
            const state = addr.state || '';
            const pincode = addr.postcode || '';
            const road = addr.road || addr.neighbourhood || addr.residential || '';
            const formattedAddress = [road, addr.suburb, city].filter(Boolean).join(', ');

            const locationData = {
              city,
              state,
              pincode,
              address: formattedAddress || result.display_name || '',
              fullAddress: result.display_name || formattedAddress,
              lat,
              lon
            };

            applyDeliveryLocation(locationData, true);
            showFeedback('✓ Location set successfully!', 'success');

            setTimeout(() => {
              closeModal();
              detectBtn.innerHTML = originalBtnHTML;
              detectBtn.disabled = false;
              detectBtn.style.opacity = '';
            }, 1000);

          } catch (err) {
            console.warn('Reverse geocoding error:', err);
            // Fallback: save coordinates at least
            const locationData = {
              city: 'Current Location',
              state: '',
              pincode: '',
              address: `GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
              fullAddress: `GPS: ${lat}, ${lon}`,
              lat,
              lon
            };
            applyDeliveryLocation(locationData, true);
            showFeedback('✓ Location detected via GPS!', 'success');
            setTimeout(() => {
              closeModal();
              detectBtn.innerHTML = originalBtnHTML;
              detectBtn.disabled = false;
              detectBtn.style.opacity = '';
            }, 1000);
          }
        },
        (error) => {
          detectBtn.innerHTML = originalBtnHTML;
          detectBtn.disabled = false;
          detectBtn.style.opacity = '';
          
          let errorMsg = 'Unable to retrieve location.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'Location access was denied. Please allow location permissions in your browser or type your address manually below.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = 'Location information is unavailable on your device.';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = 'Location request timed out. Please try again or type manually.';
          }
          showFeedback(errorMsg, 'error');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // Manual Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const pincode = pincodeInput ? pincodeInput.value.trim() : '';
      const address = addressInput ? addressInput.value.trim() : '';
      const city = cityInput ? cityInput.value.trim() : '';
      const state = stateInput ? stateInput.value.trim() : '';

      if (!pincode) {
        showFeedback('Please enter a valid pincode.', 'error');
        pincodeInput?.focus();
        return;
      }
      if (!city) {
        showFeedback('Please enter your city.', 'error');
        cityInput?.focus();
        return;
      }
      if (!address) {
        showFeedback('Please enter your flat / street address.', 'error');
        addressInput?.focus();
        return;
      }

      const locationData = {
        city,
        state,
        pincode,
        address,
        fullAddress: `${address}, ${city}, ${state} - ${pincode}`
      };

      applyDeliveryLocation(locationData, true);
      showFeedback('✓ Address saved successfully!', 'success');

      setTimeout(() => {
        closeModal();
      }, 700);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDeliveryLocationModal);
} else {
  initDeliveryLocationModal();
}

/* ==========================================================================
   Sign In Drawer (Hariba Style Slide-in Drawer)
   ========================================================================== */
function initLoginDrawer() {
  const drawer = document.getElementById('vs-login-drawer');
  if (!drawer) return;

  const loginView = document.getElementById('vs-login-view');
  const recoverView = document.getElementById('vs-recover-view');
  const registerView = document.getElementById('vs-register-view');

  function showView(viewName) {
    if (loginView) loginView.style.display = viewName === 'login' ? 'block' : 'none';
    if (recoverView) recoverView.style.display = viewName === 'recover' ? 'block' : 'none';
    if (registerView) registerView.style.display = viewName === 'register' ? 'block' : 'none';

    const titleEl = document.getElementById('vs-login-drawer-title');
    if (titleEl) {
      if (viewName === 'register') titleEl.textContent = 'Register';
      else if (viewName === 'recover') titleEl.textContent = 'Reset Password';
      else titleEl.textContent = 'Login';
    }
  }

  function openDrawer() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    showView('login');
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Delegated click handling
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-open-login-drawer]');
    if (openBtn) {
      e.preventDefault();
      openDrawer();
      return;
    }

    const closeBtn = e.target.closest('[data-close-login-drawer]');
    if (closeBtn) {
      e.preventDefault();
      closeDrawer();
      return;
    }

    const switchBtn = e.target.closest('[data-switch-auth]');
    if (switchBtn) {
      e.preventDefault();
      const targetView = switchBtn.dataset.switchAuth;
      showView(targetView);
    }
  });

  // Escape key closes drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLoginDrawer);
} else {
  initLoginDrawer();
}

/* ==========================================================================
   Mobile Bottom Bar Search Popup & Mega Menu Accordion Handler
   ========================================================================== */
function initMobileInteractions() {
  const searchModal = document.getElementById('vs-mobile-search-modal');
  const searchInput = document.getElementById('vs-mobile-search-input');

  document.addEventListener('click', (e) => {
    // Open search modal
    const openSearchBtn = e.target.closest('[data-open-mobile-search]');
    if (openSearchBtn) {
      e.preventDefault();
      if (searchModal) {
        searchModal.removeAttribute('inert');
        searchModal.setAttribute('aria-hidden', 'false');
        searchModal.classList.add('is-open');
        setTimeout(() => searchInput?.focus(), 150);
      }
      return;
    }

    // Close search modal
    const closeSearchBtn = e.target.closest('[data-close-mobile-search]');
    if (closeSearchBtn) {
      e.preventDefault();
      if (searchModal) {
        if (searchModal.contains(document.activeElement)) {
          document.activeElement.blur();
        }
        searchModal.classList.remove('is-open');
        searchModal.setAttribute('aria-hidden', 'true');
        searchModal.setAttribute('inert', '');
      }
      return;
    }

    // Mobile Shop All / Mega Menu Accordion Toggle
    const megaToggle = e.target.closest('[data-mobile-mega-toggle]');
    if (megaToggle && window.innerWidth <= 1050) {
      e.preventDefault();
      const parentItem = megaToggle.closest('.vs-nav-item--has-megamenu');
      if (parentItem) {
        parentItem.classList.toggle('is-expanded');
      }
      return;
    }

    // Mobile Submenu Accordion Toggle
    const submenuToggle = e.target.closest('[data-mobile-submenu-toggle]');
    if (submenuToggle && window.innerWidth <= 1050) {
      e.preventDefault();
      const parentItem = submenuToggle.closest('.vs-nav-item--has-submenu');
      if (parentItem) {
        parentItem.classList.toggle('is-expanded');
      }
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal && searchModal.classList.contains('is-open')) {
      searchModal.classList.remove('is-open');
      searchModal.setAttribute('aria-hidden', 'true');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileInteractions);
} else {
  initMobileInteractions();
}

/* ==========================================================================
   Product Detail Page (PDP) Interactions: Gallery, Variants & Quantity
   ========================================================================== */
function initPDPInteractions() {
  const pdpSection = document.querySelector('.vs-pdp-section');
  if (!pdpSection) return;

  const mainImg = document.getElementById('vs-pdp-main-image');
  const thumbs = pdpSection.querySelectorAll('.vs-pdp-thumb');
  const qtyInput = document.getElementById('vs-product-qty');
  const nativeSelect = document.getElementById('vs-native-variant-select');
  const variantInput = document.getElementById('vs-variant-id-input');
  const priceDisplay = pdpSection.querySelector('[data-product-price]');
  const compareDisplay = pdpSection.querySelector('[data-compare-price]');
  const addBtn = pdpSection.querySelector('.vs-pdp-add-btn');
  const addBtnText = pdpSection.querySelector('.vs-pdp-add-text');

  // Thumbnail switching & auto-play slideshow when multiple photos exist
  let activeIndex = 0;
  let autoplayTimer = null;

  function switchToIndex(index) {
    if (!thumbs || thumbs.length <= 1) return;
    activeIndex = (index + thumbs.length) % thumbs.length;
    thumbs.forEach((t, i) => {
      const isActive = i === activeIndex;
      t.classList.toggle('is-active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const targetThumb = thumbs[activeIndex];
    const src = targetThumb ? targetThumb.dataset.thumbnailSrc : null;
    if (src && mainImg) {
      mainImg.style.opacity = '0.35';
      mainImg.src = src;
      mainImg.onload = () => {
        mainImg.style.opacity = '1';
      };
    }
  }

  function startAutoplay() {
    if (thumbs.length > 1 && !autoplayTimer) {
      autoplayTimer = setInterval(() => {
        switchToIndex(activeIndex + 1);
      }, 3500);
    }
  }

  function pauseAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  thumbs.forEach((thumb, idx) => {
    thumb.addEventListener('click', () => {
      pauseAutoplay();
      switchToIndex(idx);
      startAutoplay();
    });
  });

  const galleryEl = pdpSection.querySelector('.vs-pdp-gallery');
  if (galleryEl) {
    galleryEl.addEventListener('mouseenter', pauseAutoplay);
    galleryEl.addEventListener('mouseleave', startAutoplay);
  }

  if (thumbs.length > 1) {
    startAutoplay();
  }

  // Quantity controls with visual reloader feedback
  document.addEventListener('click', (e) => {
    const qtyBtn = e.target.closest('[data-qty-action]');
    if (qtyBtn && qtyInput) {
      e.preventDefault();
      const action = qtyBtn.dataset.qtyAction;
      let val = parseInt(qtyInput.value, 10) || 1;
      if (action === 'increase') {
        val += 1;
      } else if (action === 'decrease' && val > 1) {
        val -= 1;
      }
      qtyInput.value = val;

      // Show loader feedback on PDP quantity control
      const qtyCtrl = qtyBtn.closest('.vs-pdp-qty-control');
      if (qtyCtrl) {
        qtyCtrl.classList.add('is-updating');
        clearTimeout(qtyCtrl._loaderTimeout);
        qtyCtrl._loaderTimeout = setTimeout(() => {
          qtyCtrl.classList.remove('is-updating');
        }, 320);
      }
    }
  });

  // Direct manual quantity input listener on PDP
  if (qtyInput) {
    qtyInput.addEventListener('input', () => {
      const qtyCtrl = qtyInput.closest('.vs-pdp-qty-control');
      if (qtyCtrl) {
        qtyCtrl.classList.add('is-updating');
        clearTimeout(qtyCtrl._loaderTimeout);
        qtyCtrl._loaderTimeout = setTimeout(() => {
          qtyCtrl.classList.remove('is-updating');
        }, 350);
      }
    });
  }

  // Variant Option Pills selection
  const pills = pdpSection.querySelectorAll('.vs-pdp-pill');
  if (pills.length && nativeSelect) {
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const group = pill.closest('.vs-pdp-option-group');
        if (!group) return;

        // Toggle active pill in group
        group.querySelectorAll('.vs-pdp-pill').forEach((p) => p.classList.remove('is-active'));
        pill.classList.add('is-active');

        // Update selected display text
        const displayLabel = group.querySelector('.vs-pdp-option-selected');
        if (displayLabel) displayLabel.textContent = pill.dataset.optionValue;

        // Determine selected options across all groups
        const selectedValues = Array.from(pdpSection.querySelectorAll('.vs-pdp-option-group')).map((grp) => {
          const activePill = grp.querySelector('.vs-pdp-pill.is-active');
          return activePill ? activePill.dataset.optionValue : '';
        });

        const targetTitle = selectedValues.join(' / ');

        // Find matching option in native select
        const matchingOption = Array.from(nativeSelect.options).find(
          (opt) => opt.text.includes(targetTitle) || opt.value === pill.dataset.optionValue
        );

        if (matchingOption) {
          nativeSelect.value = matchingOption.value;
          if (variantInput) variantInput.value = matchingOption.value;

          // Update price and availability
          if (priceDisplay && matchingOption.dataset.price) {
            priceDisplay.textContent = matchingOption.dataset.price;
          }
          if (compareDisplay && matchingOption.dataset.comparePrice) {
            compareDisplay.textContent = matchingOption.dataset.comparePrice;
          }

          const qty = parseInt(matchingOption.dataset.inventory, 10);
          const isAvailable = matchingOption.dataset.available === 'true' || qty > 0;
          if (addBtn) {
            addBtn.disabled = !isAvailable;
            if (addBtnText) addBtnText.textContent = isAvailable ? 'Add to Cart' : 'Sold Out';
          }

          // Update dynamic stock & SKU display
          const stockBullet = pdpSection.querySelector('.vs-stock-bullet');
          const stockText = pdpSection.querySelector('[data-stock-text]');
          const skuDisplay = pdpSection.querySelector('[data-sku-text]');

          if (stockBullet && stockText) {
            if (isAvailable) {
              stockBullet.className = 'vs-stock-bullet vs-stock-bullet--in-stock';
              stockText.className = 'vs-stock-text';
              if (qty > 0) {
                stockText.textContent = qty <= 5 ? `Only ${qty} left in stock!` : `In Stock — ${qty} available`;
              } else {
                stockText.textContent = 'In Stock';
              }
            } else {
              stockBullet.className = 'vs-stock-bullet vs-stock-bullet--out-of-stock';
              stockText.className = 'vs-stock-text vs-stock-text--sold';
              stockText.textContent = 'Sold Out';
            }
          }

          if (skuDisplay && matchingOption.dataset.sku) {
            skuDisplay.textContent = `SKU: ${matchingOption.dataset.sku}`;
          }
        }
      });
    });
  }
  // Sync Sticky Bottom Bar with Main Form
  const stickyBar = document.getElementById('vs-pdp-sticky-bar');
  const stickySelect = document.getElementById('vs-sticky-variant-select');
  const stickyPrice = pdpSection.querySelector('[data-sticky-price]');
  const stickyAddBtn = document.getElementById('vs-sticky-add-btn');
  const stickyBtnText = document.getElementById('vs-sticky-btn-text');
  const mainTrigger = document.getElementById('vs-pdp-main-trigger');
  const mainForm = document.getElementById('vs-product-form');

  // Show/Hide sticky bar: Appears whenever user scrolls down to or past the Product Details section
  if (stickyBar) {
    const tabsSection = pdpSection.querySelector('.vs-pdp-tabs-section');
    const targetElement = tabsSection || mainForm?.querySelector('.vs-pdp-actions-row') || mainTrigger;

    const handleScroll = () => {
      if (!targetElement) return;
      const rect = targetElement.getBoundingClientRect();
      // When tabs section reaches top half of viewport, or buy buttons scrolled past
      if (rect.top <= window.innerHeight * 0.75) {
        stickyBar.classList.add('is-visible');
      } else {
        stickyBar.classList.remove('is-visible');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    // Check on initial load
    handleScroll();
  }

  // Handle sticky bar variant change
  if (stickySelect) {
    stickySelect.addEventListener('change', () => {
      const selectedOpt = stickySelect.options[stickySelect.selectedIndex];
      if (variantInput) variantInput.value = stickySelect.value;
      if (nativeSelect) nativeSelect.value = stickySelect.value;

      if (stickyPrice && selectedOpt.dataset.price) {
        stickyPrice.textContent = selectedOpt.dataset.price;
      }
      if (priceDisplay && selectedOpt.dataset.price) {
        priceDisplay.textContent = selectedOpt.dataset.price;
      }

      const isAvail = selectedOpt.dataset.available === 'true';
      if (stickyAddBtn) {
        stickyAddBtn.disabled = !isAvail;
        if (stickyBtnText) stickyBtnText.textContent = isAvail ? 'Add To Cart' : 'Sold Out';
      }
      if (addBtn) {
        addBtn.disabled = !isAvail;
        if (addBtnText) addBtnText.textContent = isAvail ? 'Add to Cart' : 'Sold Out';
      }
    });
  }

  // Sticky Add To Cart Button submits the form
  if (stickyAddBtn && mainForm) {
    stickyAddBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Look for the main add to cart submit button or submit form
      if (addBtn && !addBtn.disabled) {
        addBtn.click();
      } else {
        mainForm.requestSubmit ? mainForm.requestSubmit() : mainForm.submit();
      }
    });
  }

  // Horizontal Tabs Switching (Product Details, Return & Exchange, Shipping)
  const tabButtons = pdpSection.querySelectorAll('.vs-pdp-tab-btn');
  const tabPanels = pdpSection.querySelectorAll('.vs-pdp-tab-panel');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach((p) => {
        p.classList.remove('is-active');
        p.style.display = 'none';
      });

      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const targetId = btn.dataset.tabTarget;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.style.display = 'block';
        targetPanel.classList.add('is-active');
      }
    });
  });

  // Read More Smooth Scroll & Tab Focus Handler
  const readMoreBtn = pdpSection.querySelector('[data-scroll-to-tabs]');
  if (readMoreBtn) {
    readMoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const tabsSection = document.getElementById('vs-pdp-tabs');
      if (tabsSection) {
        // Activate "Product Details" tab
        const detailsTabBtn = tabsSection.querySelector('[data-tab-target="tab-details"]');
        if (detailsTabBtn && !detailsTabBtn.classList.contains('is-active')) {
          detailsTabBtn.click();
        }

        // Measure actual header height dynamically to ensure tabs & title are completely visible
        const header = document.querySelector('.vs-header-root');
        const headerHeight = header ? header.offsetHeight : 140;
        const extraBuffer = 35; // Breathing room above tab headings
        const totalOffset = headerHeight + extraBuffer;

        const elementPosition = tabsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - totalOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }
    });
  }

  // Related Products Carousel Arrows
  const track = document.getElementById('vs-related-track');
  const prevBtn = pdpSection.querySelector('[data-related-nav="prev"]');
  const nextBtn = pdpSection.querySelector('[data-related-nav="next"]');

  if (track && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -300, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPDPInteractions);
} else {
  initPDPInteractions();
}

/* ==========================================================================
   Artisanal Cart Interactions (AJAX Quantity Updates with Inline Loader)
   ========================================================================== */
function initCartInteractions() {
  const cartSection = document.getElementById('vs-cart-section');
  if (!cartSection) return;

  const formatMoney = (cents) => {
    // Format according to Shopify active currency style
    const rupees = (cents / 100).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
    return `Rs. ${rupees}`;
  };

  const updateCartLine = async (lineKey, newQuantity, pillEl, rowEl) => {
    if (!pillEl) return;
    pillEl.classList.add('is-loading');
    if (rowEl) rowEl.classList.add('is-updating');

    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: lineKey,
          quantity: newQuantity
        })
      });

      if (!response.ok) {
        throw new Error(`Cart update failed: ${response.status}`);
      }

      const cartData = await response.json();

      // Check if item was removed (quantity = 0)
      if (newQuantity === 0) {
        if (rowEl) {
          rowEl.style.transition = 'opacity 200ms ease, transform 200ms ease';
          rowEl.style.opacity = '0';
          rowEl.style.transform = 'translateX(20px)';
          setTimeout(() => {
            rowEl.remove();
            // If no items left, reload to show empty state
            if (cartData.item_count === 0) {
              window.location.reload();
            }
          }, 200);
        }
      } else {
        // Find updated line item from response
        const updatedItem = cartData.items.find(
          (item) => item.key === lineKey || item.id === parseInt(lineKey, 10)
        );

        if (updatedItem && rowEl) {
          const lineTotalEl = rowEl.querySelector('.vs-cart-line-total');
          if (lineTotalEl) {
            lineTotalEl.textContent = formatMoney(updatedItem.final_line_price);
          }
          const qtyInput = rowEl.querySelector('.vs-cart-qty-val');
          if (qtyInput) {
            qtyInput.value = updatedItem.quantity;
          }
        }
      }

      // Update Subtotal & Total in Order Summary
      const subtotalEl = document.getElementById('vs-cart-subtotal');
      const totalEl = document.getElementById('vs-cart-total');
      const mobileTopTotal = document.querySelector('[data-cart-mobile-total]');
      if (subtotalEl) subtotalEl.textContent = formatMoney(cartData.total_price);
      if (totalEl) totalEl.textContent = formatMoney(cartData.total_price);
      if (mobileTopTotal) mobileTopTotal.textContent = formatMoney(cartData.total_price);

      // Update Header Cart Badge count if present
      const headerCartBadges = document.querySelectorAll('.vs-action-item--cart .vs-badge-count');
      headerCartBadges.forEach((badge) => {
        badge.textContent = cartData.item_count;
      });

    } catch (err) {
      console.error('Error updating cart quantity:', err);
      // Fallback: submit standard form if AJAX fails
      const form = document.getElementById('vs-cart-form');
      if (form) form.submit();
    } finally {
      pillEl.classList.remove('is-loading');
      if (rowEl) rowEl.classList.remove('is-updating');
    }
  };

  // Quantity button click listeners (+ / -) using document event delegation
  document.addEventListener('click', (e) => {
    const qtyBtn = e.target.closest('#vs-cart-section [data-qty-action]');
    if (!qtyBtn) return;
    e.preventDefault();

    const pill = qtyBtn.closest('.vs-cart-qty-pill');
    const row = qtyBtn.closest('.vs-cart-row');
    if (!pill) return;

    const input = pill.querySelector('.vs-cart-qty-val');
    if (!input) return;

    const lineKey = pill.dataset.lineKey || input.dataset.lineKey || (row ? row.dataset.lineKey : null);
    const action = qtyBtn.dataset.qtyAction;
    let currentQty = parseInt(input.value, 10) || 1;

    let targetQty = currentQty;
    if (action === 'increase') {
      targetQty = currentQty + 1;
    } else if (action === 'decrease') {
      targetQty = Math.max(0, currentQty - 1);
    }

    if (targetQty !== currentQty) {
      input.value = targetQty;
      updateCartLine(lineKey, targetQty, pill, row);
    }
  });

  // Direct input change listener
  document.addEventListener('change', (e) => {
    const input = e.target.closest('#vs-cart-section .vs-cart-qty-val');
    if (!input) return;

    const pill = input.closest('.vs-cart-qty-pill');
    const row = input.closest('.vs-cart-row');
    const lineKey = input.dataset.lineKey || (pill ? pill.dataset.lineKey : null) || (row ? row.dataset.lineKey : null);
    let targetQty = parseInt(input.value, 10);
    if (isNaN(targetQty) || targetQty < 0) {
      targetQty = 1;
      input.value = 1;
    }

    if (lineKey) {
      updateCartLine(lineKey, targetQty, pill, row);
    }
  });

  // Remove Line button listener (✕)
  document.addEventListener('click', async (e) => {
    const removeBtn = e.target.closest('#vs-cart-section [data-remove-line]');
    if (!removeBtn) return;
    e.preventDefault();

    const lineKey = removeBtn.dataset.removeLine;
    const row = removeBtn.closest('.vs-cart-row');
    const pill = row ? row.querySelector('.vs-cart-qty-pill') : null;

    if (lineKey) {
      const confirmed = await showConfirmModal({
        title: 'Remove Item',
        message: 'Are you sure you want to remove this item from your cart?',
        confirmText: 'Remove',
        cancelText: 'Keep Item',
        isDestructive: true
      });

      if (confirmed) {
        updateCartLine(lineKey, 0, pill, row);
      }
    }
  });
}

/* ==========================================================================
   Bestsellers Slider (Infinite Loop & Auto-scroll)
   ========================================================================== */
function initBestsellersSlider(root = document) {
  // If on tablet/phone (<= 1024px), sections render in grid mode without slider initialization
  if (window.innerWidth <= 1024) return;

  root.querySelectorAll('[data-bestsellers-slider]').forEach((slider) => {
    if (slider.dataset.sliderReady === 'true') return;

    const track = slider.querySelector('[data-bs-track]');
    const prevBtn = slider.querySelector('[data-bs-prev]');
    const nextBtn = slider.querySelector('[data-bs-next]');
    if (!track) return;

    const originalCards = Array.from(track.querySelectorAll('.vs-bs-card'));
    if (originalCards.length < 2) return;

    const enableLoop = slider.dataset.loop !== 'false';
    const enableAutoplay = slider.dataset.autoplay !== 'false';
    const interval = Math.max(1800, parseInt(slider.dataset.interval, 10) || 4000);

    let singleSetWidth = 0;
    let isNormalizing = false;
    let autoplayTimer = null;

    if (enableLoop) {
      const fragmentBefore = document.createDocumentFragment();
      const fragmentAfter = document.createDocumentFragment();

      originalCards.forEach((card) => {
        const cloneBefore = card.cloneNode(true);
        cloneBefore.setAttribute('aria-hidden', 'true');
        cloneBefore.dataset.clone = 'before';
        fragmentBefore.appendChild(cloneBefore);

        const cloneAfter = card.cloneNode(true);
        cloneAfter.setAttribute('aria-hidden', 'true');
        cloneAfter.dataset.clone = 'after';
        fragmentAfter.appendChild(cloneAfter);
      });

      track.insertBefore(fragmentBefore, track.firstChild);
      track.appendChild(fragmentAfter);

      const firstOriginal = track.children[originalCards.length];
      const measureWidth = () => {
        singleSetWidth = firstOriginal.offsetLeft - track.children[0].offsetLeft;
        if (singleSetWidth > 0 && track.scrollLeft < 20) {
          track.style.scrollBehavior = 'auto';
          track.scrollLeft = singleSetWidth;
          track.style.scrollBehavior = '';
        }
      };

      measureWidth();
      requestAnimationFrame(measureWidth);
      window.addEventListener('resize', measureWidth);

      track.addEventListener(
        'scroll',
        () => {
          if (isNormalizing || singleSetWidth <= 0) return;
          if (track.scrollLeft >= singleSetWidth * 2 - 15) {
            isNormalizing = true;
            track.style.scrollBehavior = 'auto';
            track.scrollLeft -= singleSetWidth;
            track.style.scrollBehavior = '';
            requestAnimationFrame(() => { isNormalizing = false; });
          } else if (track.scrollLeft <= 15) {
            isNormalizing = true;
            track.style.scrollBehavior = 'auto';
            track.scrollLeft += singleSetWidth;
            track.style.scrollBehavior = '';
            requestAnimationFrame(() => { isNormalizing = false; });
          }
        },
        { passive: true }
      );
    }

    const getStep = () => {
      const card = track.querySelector('.vs-bs-card');
      return card ? card.offsetWidth + 24 : 260;
    };

    const scrollNext = () => {
      track.scrollBy({ left: getStep(), behavior: 'smooth' });
    };

    const scrollPrev = () => {
      track.scrollBy({ left: -getStep(), behavior: 'smooth' });
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        scrollPrev();
        restartAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        scrollNext();
        restartAutoplay();
      });
    }

    const startAutoplay = () => {
      if (!enableAutoplay || autoplayTimer) return;
      autoplayTimer = window.setInterval(scrollNext, interval);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const restartAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('touchstart', stopAutoplay, { passive: true });
    slider.addEventListener('touchend', startAutoplay, { passive: true });

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      startAutoplay();
    }

    slider.dataset.sliderReady = 'true';
  });
}

/* ==========================================================================
   Wishlist Functionality (Stored in LocalStorage & synced to Header Count)
   ========================================================================== */
function initWishlist() {
  const getWishlist = () => {
    try {
      return JSON.parse(localStorage.getItem('vs_wishlist') || '[]');
    } catch {
      return [];
    }
  };

  let saveWishlist = (items) => {
    try {
      localStorage.setItem('vs_wishlist', JSON.stringify(items));
    } catch (e) {
      console.warn('Wishlist save error:', e);
    }
    updateWishlistBadges(items.length);
  };

  let toastTimeout = null;
  const showWishlistToast = (productTitle, productImg, isAdded) => {
    let toast = document.getElementById('vs-wishlist-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'vs-wishlist-toast';
      toast.className = 'vs-wishlist-toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      ${productImg ? `<img src="${productImg}" class="vs-wishlist-toast__thumb" alt="${productTitle}">` : ''}
      <div class="vs-wishlist-toast__content">
        <span class="vs-wishlist-toast__msg">
          ${isAdded ? '❤️ Added to Wishlist!' : 'Removed from Wishlist'}
        </span>
        <span class="vs-wishlist-toast__title">${productTitle || ''}</span>
      </div>
      <a href="/pages/wishlist" class="vs-wishlist-toast__link">View →</a>
    `;

    toast.classList.add('is-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3200);
  };

  const updateWishlistBadges = (count) => {
    const badges = document.querySelectorAll('.vs-action-item--wishlist .vs-badge-count');
    badges.forEach((b) => {
      b.textContent = count;
      b.classList.remove('is-bumping');
      // Trigger reflow to restart bump animation
      void b.offsetWidth;
      b.classList.add('is-bumping');
    });
  };

  // Sync active states on cards
  const syncWishlistButtons = () => {
    const items = getWishlist();
    updateWishlistBadges(items.length);
    const itemIds = new Set(items.map((i) => String(i.id)));

    document.querySelectorAll('[data-wishlist-btn]').forEach((btn) => {
      const pid = String(btn.dataset.productId);
      if (itemIds.has(pid)) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-label', 'Remove from Wishlist');
      } else {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-label', 'Add to Wishlist');
      }
    });
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-wishlist-btn]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const pid = String(btn.dataset.productId);
    const title = btn.dataset.productTitle || 'Item';
    const img = btn.dataset.productImg || '';
    let items = getWishlist();
    const existingIndex = items.findIndex((i) => String(i.id) === pid);

    if (existingIndex > -1) {
      items.splice(existingIndex, 1);
      btn.classList.remove('is-active');
      showWishlistToast(title, img, false);
    } else {
      items.push({
        id: pid,
        handle: btn.dataset.productHandle,
        title: title,
        vendor: btn.dataset.productVendor || '',
        price: btn.dataset.productPrice,
        variantId: btn.dataset.variantId || '',
        image: img
      });
      btn.classList.add('is-active');
      showWishlistToast(title, img, true);
    }

    saveWishlist(items);
  });

  syncWishlistButtons();

  // Wishlist Page Rendering (Matching Cart Table Format with direct Add-To-Cart)
  const wishlistTableWrap = document.getElementById('vs-wishlist-table-wrap');
  const wishlistTableBody = document.getElementById('vs-wishlist-table-body');
  const wishlistBar = document.getElementById('vs-wishlist-bar');
  const wishlistEmpty = document.getElementById('vs-wishlist-empty');
  const countNum = document.getElementById('vs-wishlist-count-num');
  const clearAllBtn = document.getElementById('vs-wishlist-clear-all');

  const checkCartForItems = async () => {
    try {
      const res = await fetch('/cart.js', { headers: { 'Accept': 'application/json' } });
      if (!res.ok) return new Set();
      const cart = await res.json();
      const variantIds = new Set();
      const handles = new Set();
      (cart.items || []).forEach(item => {
        if (item.variant_id) variantIds.add(String(item.variant_id));
        if (item.handle) handles.add(item.handle);
      });
      return { variantIds, handles };
    } catch {
      return { variantIds: new Set(), handles: new Set() };
    }
  };

  const renderWishlistPage = async () => {
    if (!wishlistTableBody && !wishlistTableWrap) return;
    const items = getWishlist();

    if (countNum) countNum.textContent = items.length;

    if (!items.length) {
      if (wishlistBar) wishlistBar.style.display = 'none';
      if (wishlistTableWrap) wishlistTableWrap.style.display = 'none';
      if (wishlistEmpty) wishlistEmpty.style.display = 'block';
      if (wishlistTableBody) wishlistTableBody.innerHTML = '';
      return;
    }

    if (wishlistBar) wishlistBar.style.display = 'flex';
    if (wishlistEmpty) wishlistEmpty.style.display = 'none';
    if (wishlistTableWrap) wishlistTableWrap.style.display = 'block';

    const cartInfo = await checkCartForItems();

    wishlistTableBody.innerHTML = items
      .map((item) => {
        const isInCart = (item.variantId && cartInfo.variantIds.has(String(item.variantId))) ||
                         (item.handle && cartInfo.handles.has(item.handle));

        return `
          <tr class="vs-cart-row vs-wishlist-row" data-product-id="${item.id}">
            <td class="vs-cart-cell-product">
              <div class="vs-cart-prod-flex">
                <a href="/products/${item.handle}" class="vs-cart-prod-img-wrap">
                  ${item.image ? `<img src="${item.image}" alt="${item.title}" width="82" height="82" loading="lazy">` : `<div style="background:#eee;width:100%;height:100%;"></div>`}
                </a>
                <div class="vs-cart-prod-info">
                  <a href="/products/${item.handle}" class="vs-cart-prod-title">
                    ${item.title}
                  </a>
                  ${item.vendor ? `<div class="vs-cart-prod-vendor">${item.vendor}</div>` : ''}
                </div>
              </div>
            </td>

            <td class="vs-cart-cell-price">
              <span class="vs-cart-price-num">${item.price || ''}</span>
            </td>

            <td class="vs-wishlist-cell-action">
              ${
                isInCart
                  ? `
                    <button type="button" class="vs-wishlist-add-cart-btn is-added" disabled>
                      ✓ Already Added in Cart
                    </button>
                    <div>
                      <a href="/cart" class="vs-wishlist-view-cart-link">View Cart →</a>
                    </div>
                  `
                  : `
                    <button
                      type="button"
                      class="vs-wishlist-add-cart-btn"
                      data-wishlist-add-cart
                      data-product-id="${item.id}"
                      data-variant-id="${item.variantId || ''}"
                      data-product-handle="${item.handle}"
                    >
                      Add To Cart
                    </button>
                  `
              }
            </td>

            <td class="vs-cart-cell-remove">
              <button
                type="button"
                class="vs-cart-remove-btn"
                data-wishlist-remove-btn
                data-product-id="${item.id}"
                aria-label="Remove ${item.title} from wishlist"
                title="Remove item"
              >
                ✕
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  };

  // Delegate clicks on wishlist table (Add to cart & Remove)
  if (wishlistTableWrap) {
    wishlistTableWrap.addEventListener('click', async (e) => {
      // 1. Remove Item
      const removeBtn = e.target.closest('[data-wishlist-remove-btn]');
      if (removeBtn) {
        const pid = String(removeBtn.dataset.productId);
        let items = getWishlist();
        items = items.filter((i) => String(i.id) !== pid);
        saveWishlist(items);
        syncWishlistButtons();
        renderWishlistPage();
        return;
      }

      // 2. Add To Cart
      const addBtn = e.target.closest('[data-wishlist-add-cart]');
      if (addBtn) {
        const handle = addBtn.dataset.productHandle;
        let variantId = addBtn.dataset.variantId;

        addBtn.classList.add('is-loading');
        addBtn.textContent = 'Adding...';

        try {
          // If variantId is missing, fetch product JSON to get first available variant
          if (!variantId && handle) {
            const pRes = await fetch(`/products/${handle}.js`);
            if (pRes.ok) {
              const pData = await pRes.json();
              if (pData.variants && pData.variants.length) {
                const avail = pData.variants.find((v) => v.available) || pData.variants[0];
                variantId = avail.id;
              }
            }
          }

          if (variantId) {
            const formData = new FormData();
            formData.append('id', variantId);
            formData.append('quantity', '1');

            const addRes = await fetch('/cart/add.js', {
              method: 'POST',
              headers: {
                'Accept': 'application/json'
              },
              body: formData
            });

            if (addRes.ok) {
              // Refresh header cart badge
              try {
                const cRes = await fetch('/cart.js');
                const cData = await cRes.json();
                const cartBadges = document.querySelectorAll('.vs-action-item--cart .vs-badge-count');
                cartBadges.forEach((b) => (b.textContent = cData.item_count));
              } catch (_) {}

              // Update button UI to "Already Added in Cart"
              addBtn.classList.remove('is-loading');
              addBtn.classList.add('is-added');
              addBtn.disabled = true;
              addBtn.textContent = '✓ Already Added in Cart';

              const linkWrap = document.createElement('div');
              const cartLink = document.createElement('a');
              cartLink.href = '/cart';
              cartLink.className = 'vs-wishlist-view-cart-link';
              cartLink.textContent = 'View Cart →';
              linkWrap.appendChild(cartLink);
              addBtn.parentNode.appendChild(linkWrap);
            } else {
              let errorMsg = 'Could not add to cart.';
              try {
                const errData = await addRes.json();
                if (errData.description) errorMsg = errData.description;
              } catch (_) {}
              addBtn.classList.remove('is-loading');
              addBtn.textContent = 'Add To Cart';
              showAlertModal(errorMsg, 'Notice');
            }
          } else {
            addBtn.classList.remove('is-loading');
            addBtn.textContent = 'Add To Cart';
            showAlertModal('This product has no available options or is sold out.', 'Unavailable');
          }
        } catch (err) {
          console.error(err);
          addBtn.classList.remove('is-loading');
          addBtn.textContent = 'Add To Cart';
          showAlertModal('Something went wrong. Please try again.', 'Error');
        }
      }
    });
  }

  renderWishlistPage();

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', async () => {
      const confirmed = await showConfirmModal({
        title: 'Clear Wishlist',
        message: 'Are you sure you want to clear all items from your wishlist?',
        confirmText: 'Clear All',
        cancelText: 'Keep Items',
        isDestructive: true
      });

      if (confirmed) {
        saveWishlist([]);
        syncWishlistButtons();
        renderWishlistPage();
      }
    });
  }

  // Hook saveWishlist to re-render page if on wishlist page
  const origSaveWishlist = saveWishlist;
  saveWishlist = (items) => {
    origSaveWishlist(items);
    renderWishlistPage();
  };
}

/* ==========================================================================
   Quick View Modal Functionality
   ========================================================================== */
function initQuickView() {
  const getModal = () => document.getElementById('vs-quickview-modal');
  const getModalBody = () => document.getElementById('vs-quickview-body');

  const openQuickView = async (productUrl, productHandle) => {
    const modal = getModal();
    const modalBody = getModalBody();
    if (!modal || !modalBody) {
      console.warn('Quick view modal elements not found in DOM');
      return;
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    modalBody.innerHTML = `
      <div class="vs-quickview-loading">
        <svg class="vs-quickview-spinner" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
        </svg>
      </div>
    `;

    try {
      // 1. Fetch product JSON data
      const jsonUrl = productUrl.includes('?') ? productUrl.split('?')[0] + '.js' : `${productUrl}.js`;
      const jsonRes = await fetch(jsonUrl);
      if (!jsonRes.ok) throw new Error('Product JSON not found');
      const prodData = await jsonRes.json();

      const formatMoney = (cents) => {
        if (!cents && cents !== 0) return '';
        const amt = (cents / 100).toFixed(2);
        return `Rs. ${Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      };

      const title = prodData.title || 'Product';
      const images = (Array.isArray(prodData.images) && prodData.images.length > 0)
        ? prodData.images.map((img) => (img.startsWith('//') ? `https:${img}` : img))
        : (prodData.featured_image ? [prodData.featured_image.startsWith('//') ? `https:${prodData.featured_image}` : prodData.featured_image] : []);
      const mainImg = images[0] || '';
      const currentVariant = prodData.variants?.[0] || {};
      const price = formatMoney(currentVariant.price || prodData.price);
      const comparePrice = currentVariant.compare_at_price ? formatMoney(currentVariant.compare_at_price) : '';
      const isAvailable = currentVariant.available !== false;
      const variantId = currentVariant.id || '';
      const desc = prodData.description || '';

      const thumbsHtml = images.length > 1
        ? `
          <div class="vs-qv-thumbs" role="tablist" aria-label="Product thumbnails">
            ${images.map((imgUrl, idx) => `
              <button
                type="button"
                class="vs-qv-thumb ${idx === 0 ? 'is-active' : ''}"
                data-qv-thumb-src="${imgUrl}"
                data-qv-thumb-index="${idx}"
                aria-label="Image ${idx + 1}"
                role="tab"
                aria-selected="${idx === 0 ? 'true' : 'false'}"
              >
                <img src="${imgUrl}" alt="${title} thumbnail ${idx + 1}" width="60" height="60" loading="lazy">
              </button>
            `).join('')}
          </div>
        `
        : '';

      const sliderArrowsHtml = images.length > 1
        ? `
          <button type="button" class="vs-qv-nav vs-qv-nav--prev" data-qv-nav="prev" aria-label="Previous image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button type="button" class="vs-qv-nav vs-qv-nav--next" data-qv-nav="next" aria-label="Next image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        `
        : '';

      modalBody.innerHTML = `
        <div class="vs-qv-grid">
          <div class="vs-qv-media">
            <div class="vs-qv-image-wrap">
              <img id="vs-qv-main-img" src="${mainImg}" alt="${title}" width="500" height="500" loading="eager">
              ${sliderArrowsHtml}
            </div>
            ${thumbsHtml}
          </div>
          <div class="vs-qv-info">
            <h2 class="vs-qv-title">${title}</h2>
            <div class="vs-qv-price">
              <span class="vs-qv-current-price">${price}</span>
              ${comparePrice ? `<s class="vs-qv-compare-price">${comparePrice}</s>` : ''}
            </div>
            ${desc ? `<div class="vs-qv-desc">${desc}</div>` : ''}
            <form action="/cart/add" method="post" class="vs-qv-form" data-qv-form>
              <input type="hidden" name="id" value="${variantId}">
              <input type="hidden" name="quantity" value="1">
              <button type="submit" class="vs-qv-action-btn" ${!isAvailable ? 'disabled' : ''}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>${isAvailable ? 'Add To Cart' : 'Sold Out'}</span>
              </button>
            </form>
            <a href="${productUrl}" class="vs-qv-view-pdp-link">View Full Details →</a>
          </div>
        </div>
      `;

      // Multi-image interaction handler
      if (images.length > 1) {
        let currentIdx = 0;
        const mainImgEl = modalBody.querySelector('#vs-qv-main-img');
        const thumbs = modalBody.querySelectorAll('.vs-qv-thumb');

        const setActiveImage = (idx) => {
          if (idx < 0) idx = images.length - 1;
          if (idx >= images.length) idx = 0;
          currentIdx = idx;

          if (mainImgEl) {
            mainImgEl.style.opacity = '0.4';
            mainImgEl.src = images[currentIdx];
            mainImgEl.onload = () => {
              mainImgEl.style.opacity = '1';
            };
          }

          thumbs.forEach((t, i) => {
            const isActive = i === currentIdx;
            t.classList.toggle('is-active', isActive);
            t.setAttribute('aria-selected', isActive ? 'true' : 'false');
          });
        };

        modalBody.addEventListener('click', (ev) => {
          const thumbBtn = ev.target.closest('.vs-qv-thumb');
          if (thumbBtn) {
            ev.preventDefault();
            const idx = parseInt(thumbBtn.dataset.qvThumbIndex, 10);
            if (!isNaN(idx)) setActiveImage(idx);
            return;
          }

          const navBtn = ev.target.closest('[data-qv-nav]');
          if (navBtn) {
            ev.preventDefault();
            const dir = navBtn.dataset.qvNav;
            if (dir === 'prev') {
              setActiveImage(currentIdx - 1);
            } else if (dir === 'next') {
              setActiveImage(currentIdx + 1);
            }
          }
        });
      }
    } catch (e) {
      console.error('Quick view error:', e);
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem;">
          <p style="font-size: 1rem; color: #333; margin-bottom: 1rem;">View full product information on the product page.</p>
          <a href="${productUrl}" class="vs-qv-action-btn" style="display: inline-flex; width: auto; padding: 0.75rem 2rem; text-decoration: none;">View Product →</a>
        </div>
      `;
    }
  };

  const closeQuickView = () => {
    const modal = getModal();
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Global click delegator
  document.addEventListener('click', (e) => {
    const qvBtn = e.target.closest('[data-quickview-btn]');
    if (qvBtn) {
      e.preventDefault();
      e.stopPropagation();
      openQuickView(qvBtn.dataset.productUrl, qvBtn.dataset.productHandle);
      return;
    }

    if (e.target.closest('[data-close-quickview]')) {
      e.preventDefault();
      closeQuickView();
    }
  });

  document.addEventListener('keydown', (e) => {
    const modal = getModal();
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeQuickView();
    }
  });
}

/* ==========================================================================
   Testimonials Slider (Infinite Loop & Auto-scroll)
   ========================================================================== */
function initTestimonialsSlider(root = document) {
  root.querySelectorAll('[data-testimonials-slider]').forEach((slider) => {
    if (slider.dataset.sliderReady === 'true') return;

    const track = slider.querySelector('[data-testi-track]');
    const prevBtn = slider.querySelector('[data-testi-prev]');
    const nextBtn = slider.querySelector('[data-testi-next]');
    if (!track) return;

    const originalCards = Array.from(track.children);
    if (originalCards.length === 0) return;

    // Infinite loop by cloning cards if more than 2 items
    if (originalCards.length > 2) {
      originalCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    }

    const autoplayEnabled = slider.dataset.autoplay !== 'false';
    const interval = Number(slider.dataset.interval) || 4000;
    let timer = null;

    const getStep = () => {
      const firstCard = track.querySelector('.vs-testimonial-card');
      if (!firstCard) return 340;
      const cardRect = firstCard.getBoundingClientRect();
      const gap = parseFloat(window.getComputedStyle(track).gap) || 24;
      return cardRect.width + gap;
    };

    const scrollNext = () => {
      const step = getStep();
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 10) {
        track.scrollLeft = 0;
      } else {
        track.scrollBy({ left: step, behavior: 'smooth' });
      }
    };

    const scrollPrev = () => {
      const step = getStep();
      if (track.scrollLeft <= 5) {
        track.scrollLeft = track.scrollWidth / 2;
      }
      track.scrollBy({ left: -step, behavior: 'smooth' });
    };

    if (nextBtn) nextBtn.addEventListener('click', scrollNext);
    if (prevBtn) prevBtn.addEventListener('click', scrollPrev);

    const startAutoplay = () => {
      if (!autoplayEnabled || timer) return;
      timer = setInterval(scrollNext, interval);
    };

    const stopAutoplay = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('touchstart', stopAutoplay, { passive: true });
    slider.addEventListener('touchend', startAutoplay, { passive: true });

    startAutoplay();
    slider.dataset.sliderReady = 'true';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initCartInteractions();
    initCategoryCarousels();
    initBestsellersSlider();
    initWishlist();
    initQuickView();
    initTestimonialsSlider();
  });
} else {
  initCartInteractions();
  initCategoryCarousels();
  initBestsellersSlider();
  initWishlist();
  initQuickView();
  initTestimonialsSlider();
}
document.addEventListener('shopify:section:load', (event) => {
  initCartInteractions();
  initCategoryCarousels(event.target);
  initBestsellersSlider(event.target);
  initWishlist();
  initTestimonialsSlider(event.target);
});











