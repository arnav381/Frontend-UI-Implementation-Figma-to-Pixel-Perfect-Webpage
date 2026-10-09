'use strict';

/* =========================================================
   1. Navbar: highlight the link of the section in view
   ========================================================= */
(function initNavHighlight() {
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const targets = links
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter((item) => item.section);

  function setActive(activeLink) {
    links.forEach((link) => {
      const isActive = link === activeLink;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  links.forEach((link) => {
    link.addEventListener('click', () => setActive(link));
  });

  if (!('IntersectionObserver' in window) || !targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const match = targets.find((item) => item.section === entry.target);
        if (match) setActive(match.link);
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  targets.forEach((item) => observer.observe(item.section));
})();

/* =========================================================
   2. Recommendations carousel (active card stays centered)
   ========================================================= */
(function initCarousel() {
  const viewport = document.querySelector('.reviews-viewport');
  const track = document.querySelector('.reviews-track');
  const dots = Array.from(document.querySelectorAll('.slider-dot'));
  if (!viewport || !track || !dots.length) return;

  const slides = Array.from(track.children);
  let currentIndex = dots.findIndex((dot) => dot.classList.contains('active'));
  if (currentIndex < 0) currentIndex = 0;

  function updateSlide(index) {
    currentIndex = Math.max(0, Math.min(index, slides.length - 1));

    const slideWidth = slides[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const slideCenter = currentIndex * (slideWidth + gap) + slideWidth / 2;
    const offset = viewport.clientWidth / 2 - slideCenter;

    track.style.transform = `translateX(${offset}px)`;

    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle('active', isActive);
      if (isActive) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });

    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', Math.abs(i - currentIndex) > 1 ? 'true' : 'false');
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => updateSlide(index));
  });

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      updateSlide(currentIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      updateSlide(currentIndex - 1);
    }
  });

  let touchStartX = null;
  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 40) updateSlide(currentIndex + (diff < 0 ? 1 : -1));
    touchStartX = null;
  });

  window.addEventListener('resize', () => updateSlide(currentIndex));
  window.addEventListener('load', () => updateSlide(currentIndex));

  updateSlide(currentIndex);
})();

/* =========================================================
   3. Contact form validation & UX state
   ========================================================= */
(function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const nameInput = contactForm.querySelector('#fullName');
  const emailInput = contactForm.querySelector('#email');
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const status = contactForm.querySelector('.form-status');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, message) {
    const error = document.getElementById(`${input.id}-error`);
    if (message) {
      error.textContent = message;
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    } else {
      error.textContent = '';
      error.hidden = true;
      input.removeAttribute('aria-invalid');
    }
  }

  function validate() {
    let firstInvalid = null;

    const name = nameInput.value.trim();
    if (!name) {
      setError(nameInput, 'Please enter your full name.');
      firstInvalid = firstInvalid || nameInput;
    } else {
      setError(nameInput, '');
    }

    const email = emailInput.value.trim();
    if (!email) {
      setError(emailInput, 'Please enter your email address.');
      firstInvalid = firstInvalid || emailInput;
    } else if (!emailPattern.test(email)) {
      setError(emailInput, 'Please enter a valid email address.');
      firstInvalid = firstInvalid || emailInput;
    } else {
      setError(emailInput, '');
    }

    return firstInvalid;
  }

  [nameInput, emailInput].forEach((input) => {
    input.addEventListener('input', () => {
      if (input.hasAttribute('aria-invalid')) setError(input, '');
    });
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '';

    const firstInvalid = validate();
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Simulated submission feedback
    submitBtn.disabled = true;
    submitBtn.textContent = 'SENDING...';

    setTimeout(() => {
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'SEND MESSAGE';
      status.textContent = 'Message received! Thank you for getting in touch.';

      setTimeout(() => {
        status.textContent = '';
      }, 5000);
    }, 1000);
  });
})();