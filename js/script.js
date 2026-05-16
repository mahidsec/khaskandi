// ===== Preloader =====
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('preloader')?.classList.add('hidden'), 600);
});

// ===== Navbar scroll effect =====
const navbar = document.querySelector('.navbar');
const backToTop = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar?.classList.toggle('scrolled', y > 60);
  backToTop?.classList.toggle('visible', y > 400);
});

// ===== Mobile menu =====
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('active');
    navLinks?.classList.remove('open');
  });
});

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll('.section[id]');
function updateActiveNav() {
  const y = window.scrollY + 120;
  sections.forEach(sec => {
    const top = sec.offsetTop, h = sec.offsetHeight, id = sec.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) link.classList.toggle('active', y >= top && y < top + h);
  });
}
window.addEventListener('scroll', updateActiveNav);

// ===== Scroll reveal =====
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });
reveals.forEach(el => revealObs.observe(el));

// ===== Counter animation =====
function animateCounters() {
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}
const statsSection = document.querySelector('.stats-row');
if (statsSection) {
  const statsObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { animateCounters(); statsObs.disconnect(); }
  }, { threshold: 0.3 });
  statsObs.observe(statsSection);
}


// ===== Back to top =====
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== Language Toggle (EN/BN) =====
const langBtn = document.querySelector('.lang-toggle');
let currentLang = 'bn';

function updateLanguage() {
  if (langBtn) langBtn.textContent = currentLang === 'en' ? 'বাংলা' : 'English';
  document.querySelectorAll('[data-en][data-bn]').forEach(el => {
    el.innerHTML = el.dataset[currentLang];
  });
}

langBtn?.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'bn' : 'en';
  updateLanguage();
});

// Initialize language on load
document.addEventListener('DOMContentLoaded', updateLanguage);

// ===== Simple form handler =====
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Message Sent! ✓';
  btn.style.background = 'var(--accent)';
  setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; e.target.reset(); }, 2500);
});

