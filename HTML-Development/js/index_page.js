// ── FAQ accordion ──
document.querySelectorAll('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── Pricing toggle — monthly / yearly ──
const toggleBtns   = document.querySelectorAll('.toggle-btn');
const priceAmounts = document.querySelectorAll('.price-amount');
const annualNotes  = document.querySelectorAll('.price-annual-note');

function switchPricing(period) {
  toggleBtns.forEach(b => b.classList.remove('active'));
  document.querySelector(`.toggle-btn[data-period="${period}"]`).classList.add('active');

  priceAmounts.forEach(el => {
    el.classList.add('price-flip');
    setTimeout(() => {
      el.textContent = el.dataset[period];
      el.classList.remove('price-flip');
    }, 180);
  });

  annualNotes.forEach(note => {
    note.style.display = period === 'yearly' ? 'block' : 'none';
  });

  document.querySelectorAll('.price-period').forEach(p => {
    p.textContent = period === 'yearly' ? '/mo*' : '/mo';
  });
}

toggleBtns.forEach(btn => {
  btn.addEventListener('click', () => switchPricing(btn.dataset.period));
});

// ── Testimonial dots ──
document.querySelectorAll('.testi-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.testi-dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  });
});

// ── Scroll animations ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ══════════════════════════════════════════════════════════════
//  HAMBURGER MENU — animated open/close with scroll lock
// ══════════════════════════════════════════════════════════════
(function () {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const backdrop  = mobileNav ? mobileNav.querySelector('.mobile-nav-backdrop') : null;
  const mobileLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];

  if (!hamburger || !mobileNav) return;

  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.style.display = 'block';
    document.body.classList.add('nav-open');

    // Stagger animation: re-trigger by toggling opacity reset
    // (CSS handles the stagger via transition-delay on .open state)
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    document.body.classList.remove('nav-open');

    // Hide after transition completes
    setTimeout(() => {
      if (!mobileNav.classList.contains('open')) {
        mobileNav.style.display = 'none';
      }
    }, 420);
  }

  function toggleMenu() {
    if (mobileNav.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close on backdrop click
  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  // Close on link click (smooth scroll to section)
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      closeMenu();
    }
  });

  // Close menu if window resized beyond mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && mobileNav.classList.contains('open')) {
      closeMenu();
    }
  });

  // Navbar scroll shadow
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
        navbar.style.borderBottomColor = 'rgba(255,255,255,0.10)';
      } else {
        navbar.style.boxShadow = '';
        navbar.style.borderBottomColor = 'rgba(255,255,255,0.07)';
      }
    }, { passive: true });
  }
})();
