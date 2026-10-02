/* ==========================================================================
   DEONTECH · AC5 PRESENTACIÓN — APP CONTROLLER
   Slide navigation, keyboard, touch, minimap, progress, animations
   ========================================================================== */

(function () {
  'use strict';

  // ─── State ───
  let currentSlide = 1;
  const totalSlides = document.querySelectorAll('.slide').length;

  // ─── DOM Cache ───
  const slides = document.querySelectorAll('.slide');
  const progressFill = document.getElementById('progressFill');
  const currentSlideEl = document.getElementById('currentSlide');
  const totalSlidesEl = document.getElementById('totalSlides');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const minimapDots = document.querySelectorAll('.minimap-dot');
  const keyboardHint = document.getElementById('keyboardHint');

  // ─── Initialize ───
  totalSlidesEl.textContent = totalSlides;
  updateUI();

  // Auto-hide keyboard hint after 6s
  setTimeout(() => {
    if (keyboardHint) {
      keyboardHint.style.transition = 'opacity 1s ease';
      keyboardHint.style.opacity = '0';
      setTimeout(() => { keyboardHint.style.display = 'none'; }, 1000);
    }
  }, 6000);

  // ─── Navigation Functions ───
  function goToSlide(n) {
    if (n < 1 || n > totalSlides || n === currentSlide) return;

    // Deactivate current
    slides[currentSlide - 1].classList.remove('active');

    // Reset animations for outgoing slide
    const outgoingAnimateIns = slides[currentSlide - 1].querySelectorAll('.animate-in');
    outgoingAnimateIns.forEach(el => {
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
    });

    currentSlide = n;

    // Activate new
    const newSlide = slides[currentSlide - 1];
    newSlide.classList.add('active');

    // Re-trigger animations
    const animateIns = newSlide.querySelectorAll('.animate-in');
    animateIns.forEach(el => {
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        animateIns.forEach(el => {
          el.style.transition = '';
          el.style.opacity = '';
          el.style.transform = '';
        });
      });
    });

    // Scroll to top of slide content
    newSlide.scrollTop = 0;

    updateUI();
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function updateUI() {
    // Counter
    currentSlideEl.textContent = currentSlide;

    // Progress bar
    const pct = (currentSlide / totalSlides) * 100;
    progressFill.style.width = pct + '%';

    // Arrows
    prevBtn.disabled = currentSlide === 1;
    nextBtn.disabled = currentSlide === totalSlides;

    // Minimap
    minimapDots.forEach(dot => {
      const idx = parseInt(dot.dataset.goto);
      dot.classList.toggle('active', idx === currentSlide);
    });
  }

  // ─── Keyboard Navigation ───
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(1);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides);
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
    }
  });

  // ─── Touch / Swipe Support ───
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    const minSwipe = 60;

    // Only process horizontal swipes (ignore vertical)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
      if (dx < 0) {
        nextSlide(); // Swipe left → next
      } else {
        prevSlide(); // Swipe right → prev
      }
    }
  }

  // ─── Mouse Wheel Navigation ───
  let wheelThrottle = false;
  document.addEventListener('wheel', (e) => {
    if (wheelThrottle) return;
    wheelThrottle = true;

    // Check if the active slide has scrollable content
    const activeSlide = slides[currentSlide - 1];
    const isScrollable = activeSlide.scrollHeight > activeSlide.clientHeight;

    if (isScrollable) {
      const atTop = activeSlide.scrollTop <= 5;
      const atBottom = activeSlide.scrollTop + activeSlide.clientHeight >= activeSlide.scrollHeight - 5;

      if (e.deltaY > 0 && !atBottom) {
        wheelThrottle = false;
        return; // Let native scroll happen
      }
      if (e.deltaY < 0 && !atTop) {
        wheelThrottle = false;
        return;
      }
    }

    if (e.deltaY > 0) {
      nextSlide();
    } else if (e.deltaY < 0) {
      prevSlide();
    }

    setTimeout(() => { wheelThrottle = false; }, 800);
  }, { passive: true });

  // ─── Minimap Click ───
  minimapDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = parseInt(dot.dataset.goto);
      goToSlide(target);
    });
  });

  // ─── Fullscreen Toggle ───
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  // ─── Expose to global for onclick handlers ───
  window.nextSlide = nextSlide;
  window.prevSlide = prevSlide;
  window.goToSlide = goToSlide;

})();
