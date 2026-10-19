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

  if (event.target.closest('.vs-navigation a')) {
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

function initCategoryCarousels(root = document) {
  root.querySelectorAll('[data-category-carousel]').forEach((carousel) => {
    if (carousel.dataset.carouselReady === 'true') return;

    const track = carousel.querySelector('[data-carousel-track]');
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    if (!track) return;

    const originalCards = Array.from(track.querySelectorAll('.vs-category-card'));
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
      const card = track.querySelector('.vs-category-card');
      return card ? card.offsetWidth + 20 : 200;
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


