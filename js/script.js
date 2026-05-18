// ===== DOM Element Queries =====
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
let lastScrollY = window.scrollY;

// ===== Preloader =====
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('preloader')?.classList.add('hidden'), 600);
});

// ===== Navbar scroll effect & Smart Hiding =====
function handleScroll() {
  const y = window.scrollY;
  
  // Scrolled state
  navbar?.classList.toggle('scrolled', y > 60);

  // Smart Hide/Show
  const isMenuOpen = navLinks?.classList.contains('open');
  if (navbar && y > 500 && !isMenuOpen) { // Activate after leaving hero
    if (y > lastScrollY && !navbar.classList.contains('nav-hidden')) {
      navbar.classList.add('nav-hidden');
    } else if (y < lastScrollY && navbar.classList.contains('nav-hidden')) {
      navbar.classList.remove('nav-hidden');
    }
  } else if (navbar) {
    navbar.classList.remove('nav-hidden');
  }

  lastScrollY = y;
}

window.addEventListener('scroll', handleScroll);

// ===== Mobile menu =====
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks?.classList.toggle('open');
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


// ===== Logo Click Scroll to Top =====
document.querySelector('.nav-logo')?.addEventListener('click', (e) => {
  if (window.scrollY > 100) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// ===== Language Toggle (EN/BN) =====
const langBtn = document.querySelector('.lang-toggle');
let currentLang = 'bn';

function updateLanguage() {
  if (langBtn) langBtn.textContent = currentLang === 'en' ? 'বাংলা' : 'English';
  document.querySelectorAll('[data-en][data-bn]').forEach(el => {
    el.innerHTML = el.dataset[currentLang];
  });
  // Dynamic Input Placeholder Translation
  document.querySelectorAll('input[data-placeholder-en][data-placeholder-bn]').forEach(el => {
    el.placeholder = el.dataset['placeholder' + (currentLang === 'en' ? 'En' : 'Bn')];
  });
  renderPlayers();
  renderActiveEvent();
  renderGallery();
}

langBtn?.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'bn' : 'en';
  updateLanguage();
});

// ===== Player Squad Fetching & Dynamic Table =====
let playersData = [];
let filteredPlayersList = [];

async function loadPlayers() {
  try {
    const res = await fetch('squad.json');
    if (!res.ok) throw new Error('Failed to fetch player database (squad.json)');
    const data = await res.json();
    // Sort numerically by Jersey number ascending
    playersData = data.sort((a, b) => Number(a.jersey) - Number(b.jersey)).map(p => ({
      ...p,
      selected: false
    }));
    filteredPlayersList = [...playersData];
    renderPlayers();
  } catch (err) {
    console.error('Error loading squad database:', err);
  }
}

// ===== Dynamic Media Gallery Fetching =====
let galleryData = null;
let activeMediaList = [];

async function loadGallery() {
  const previewContainer = document.getElementById('gallery-preview-grid');
  if (!previewContainer) return;
  
  try {
    const res = await fetch('gallery.json');
    if (!res.ok) throw new Error('Failed to fetch gallery database (gallery.json)');
    galleryData = await res.json();
    renderGallery();
  } catch (err) {
    console.error('Error loading gallery database:', err);
  }
}

function renderGallery() {
  const previewContainer = document.getElementById('gallery-preview-grid');
  if (!previewContainer || !galleryData) return;
  
  // Interleave photos and videos for a dynamic mixed layout
  const mixedItems = [];
  const images = galleryData.images || [];
  const videos = galleryData.videos || [];
  const maxLen = Math.max(images.length, videos.length);
  
  for (let i = 0; i < maxLen; i++) {
    if (i < images.length) mixedItems.push({ type: 'image', src: images[i] });
    if (i < videos.length) mixedItems.push({ type: 'video', src: videos[i] });
  }
  
  // Render up to 5 items in the preview grid, then append the "+" trigger card
  const previewItems = mixedItems.slice(0, 5);
  
  // Update the global active media list
  activeMediaList = previewItems.map(item => ({
    src: item.type === 'image' ? `assets/zubosongho/images/${item.src}` : `assets/zubosongho/videos/${item.src}`,
    type: item.type
  }));
  
  let html = '';
  
  previewItems.forEach((item, idx) => {
    if (item.type === 'image') {
      html += `
        <div class="gallery-item" style="cursor: pointer;" onclick="openLightbox('assets/zubosongho/images/${item.src}', 'image')">
          <img src="assets/zubosongho/images/${item.src}" alt="Khaskandi Gallery Photo ${idx + 1}" loading="lazy">
        </div>
      `;
    } else {
      html += `
        <div class="gallery-item" style="cursor: pointer;" onclick="openLightbox('assets/zubosongho/videos/${item.src}', 'video')">
          <video src="assets/zubosongho/videos/${item.src}" preload="metadata" playsinline muted></video>
          <div class="video-play-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" style="width: 32px; height: 32px;"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      `;
    }
  });
  
  // Dynamic bilingual "+" See All Card
  const plusText = currentLang === 'en' ? 'See All' : 'সব দেখুন';
  html += `
    <div class="gallery-more-card" onclick="openGalleryExplorer()">
      <div class="more-icon">+</div>
      <div class="more-text">${plusText}</div>
    </div>
  `;
  
  previewContainer.innerHTML = html;
}

// ===== Full Gallery Explorer Controller =====
window.openGalleryExplorer = function() {
  const modal = document.getElementById('gallery-explorer-modal');
  if (!modal) return;
  
  // Bugfix: Block background body scrolling
  document.body.style.overflow = 'hidden';
  
  modal.style.display = 'flex';
  // Trigger reflow for transition
  modal.offsetHeight;
  modal.style.opacity = '1';
  
  const content = modal.querySelector('.explorer-content');
  if (content) content.style.transform = 'scale(1)';
  
  // Select first filter button and load 'all'
  const firstBtn = modal.querySelector('.filter-btn');
  filterExplorer('all', firstBtn);
};

window.closeGalleryExplorer = function() {
  const modal = document.getElementById('gallery-explorer-modal');
  if (!modal) return;
  
  // Bugfix: Restore background body scrolling
  document.body.style.overflow = '';
  
  modal.style.opacity = '0';
  
  const content = modal.querySelector('.explorer-content');
  if (content) content.style.transform = 'scale(0.95)';
  
  // Pause any video inside the explorer grid when closing
  modal.querySelectorAll('video').forEach(video => video.pause());
  
  setTimeout(() => {
    modal.style.display = 'none';
  }, 350);
};

window.filterExplorer = function(category, btn) {
  const modal = document.getElementById('gallery-explorer-modal');
  if (!modal) return;
  
  modal.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  const grid = document.getElementById('explorer-grid');
  if (!grid || !galleryData) return;
  
  // Pause any currently playing videos in the grid before resetting contents
  grid.querySelectorAll('video').forEach(video => video.pause());
  
  let itemsHTML = '';
  
  if (category === 'all') {
    // Interleave in explorer modal as well
    const mixed = [];
    const images = galleryData.images || [];
    const videos = galleryData.videos || [];
    const maxLen = Math.max(images.length, videos.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < images.length) mixed.push({ type: 'image', src: images[i] });
      if (i < videos.length) mixed.push({ type: 'video', src: videos[i] });
    }
    
    // Update the global active media list
    activeMediaList = mixed.map(item => ({
      src: item.type === 'image' ? `assets/zubosongho/images/${item.src}` : `assets/zubosongho/videos/${item.src}`,
      type: item.type
    }));
    
    mixed.forEach((item, idx) => {
      if (item.type === 'image') {
        itemsHTML += `
          <div class="gallery-item" style="cursor: pointer;" onclick="openLightbox('assets/zubosongho/images/${item.src}', 'image')">
            <img src="assets/zubosongho/images/${item.src}" alt="Khaskandi Gallery Photo ${idx + 1}" loading="lazy">
          </div>
        `;
      } else {
        itemsHTML += `
          <div class="gallery-item" style="cursor: pointer;" onclick="openLightbox('assets/zubosongho/videos/${item.src}', 'video')">
            <video src="assets/zubosongho/videos/${item.src}" preload="metadata" playsinline muted></video>
            <div class="video-play-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" style="width: 32px; height: 32px;"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        `;
      }
    });
  } else if (category === 'photos') {
    const images = galleryData.images || [];
    
    // Update the global active media list
    activeMediaList = images.map(img => ({
      src: `assets/zubosongho/images/${img}`,
      type: 'image'
    }));
    
    images.forEach((img, idx) => {
      itemsHTML += `
        <div class="gallery-item" style="cursor: pointer;" onclick="openLightbox('assets/zubosongho/images/${img}', 'image')">
          <img src="assets/zubosongho/images/${img}" alt="Khaskandi Gallery Photo ${idx + 1}" loading="lazy">
        </div>
      `;
    });
  } else if (category === 'videos') {
    const videos = galleryData.videos || [];
    
    // Update the global active media list
    activeMediaList = videos.map(vid => ({
      src: `assets/zubosongho/videos/${vid}`,
      type: 'video'
    }));
    
    videos.forEach(vid => {
      itemsHTML += `
        <div class="gallery-item" style="cursor: pointer;" onclick="openLightbox('assets/zubosongho/videos/${vid}', 'video')">
          <video src="assets/zubosongho/videos/${vid}" preload="metadata" playsinline muted></video>
          <div class="video-play-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" style="width: 32px; height: 32px;"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      `;
    });
  }
  
  grid.innerHTML = itemsHTML;
};

// ===== Active Tournament Event Fetching =====
let activeEventData = null;

async function loadActiveEvent() {
  const container = document.getElementById('event-container');
  if (!container) return;
  
  try {
    const res = await fetch('event.json');
    if (!res.ok) throw new Error('Failed to fetch event database (event.json)');
    activeEventData = await res.json();
    renderActiveEvent();
  } catch (err) {
    console.error('Error loading event database:', err);
    container.innerHTML = `
      <div class="card" style="background: rgba(255, 255, 255, 0.02); border: 1px dashed rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 3rem 2rem; color: var(--text-muted); text-align: center;">
        <p style="font-size: 1.1rem; font-weight: 500;">Failed to load tournament information. / টুর্নামেন্টের তথ্য লোড করতে ব্যর্থ হয়েছে।</p>
      </div>
    `;
  }
}

function renderActiveEvent() {
  const container = document.getElementById('event-container');
  if (!container || !activeEventData) return;
  
  if (activeEventData.eventActive) {
    const title = currentLang === 'en' ? activeEventData.titleEn : activeEventData.titleBn;
    const date = currentLang === 'en' ? activeEventData.dateEn : activeEventData.dateBn;
    
    const labelTeams = currentLang === 'en' ? 'Total Teams' : 'মোট দল';
    const labelStyle = currentLang === 'en' ? 'Tournament Style' : 'টুর্নামেন্ট ফরম্যাট';
    const labelPlayers = currentLang === 'en' ? 'Match Format' : 'ম্যাচ ফরম্যাট';
    const labelFees = currentLang === 'en' ? 'Entry Fee' : 'এন্ট্রি ফি';
    const labelFines = currentLang === 'en' ? 'Card Penalties' : 'কার্ড জরিমানা';
    const labelContact = currentLang === 'en' ? 'Registration Hotline' : 'রেজিস্ট্রেশন হটলাইন';
    const labelRules = currentLang === 'en' ? 'Rules & Regulations' : 'টুর্নামেন্টের নিয়মাবলি';
    const labelPrizeFirst = currentLang === 'en' ? 'Champion Prize' : 'চ্যাম্পিয়ন পুরস্কার';
    const labelPrizeSecond = currentLang === 'en' ? 'Runner-up Prize' : 'রানার্স-আপ পুরস্কার';
    
    const teamsVal = currentLang === 'en' ? `${activeEventData.teamsCount}` : `${activeEventData.teamsCount}টি`;
    const styleVal = currentLang === 'en' ? activeEventData.styleEn : activeEventData.styleBn;
    const playersVal = currentLang === 'en' ? `${activeEventData.playerCount}-a-side (+${activeEventData.extraPlayers} Subs)` : `${activeEventData.playerCount}-জন (অতিরিক্ত +${activeEventData.extraPlayers})`;
    const feeVal = activeEventData.entryFee;
    const prizeFirstVal = activeEventData.prizeFirstEn; // English is standard
    const prizeSecondVal = activeEventData.prizeSecondEn; // English is standard
    let contactsHtml = '';
    if (activeEventData.contacts && activeEventData.contacts.length > 0) {
      activeEventData.contacts.forEach(contact => {
        const contactName = contact.name;
        const contactPhone = contact.phone; // Standard format for phone display
        const cleanPhone = contact.phone.replace(/[\s-]+/g, '');
        
        contactsHtml += `
          <a href="tel:${cleanPhone}" class="t-contact-pill">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 11px; height: 11px; flex-shrink: 0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span class="t-contact-pill-label">${contactName}:</span>
            <span class="t-contact-pill-number">${contactPhone}</span>
          </a>
        `;
      });
    }
    
    const rulesList = currentLang === 'en' ? activeEventData.rulesEn : activeEventData.rulesBn;
    let rulesHtml = '';
    rulesList.forEach(rule => {
      rulesHtml += `
        <li style="display: flex; align-items: flex-start; gap: 0.75rem; text-align: left; font-size: 0.95rem; color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 0.75rem;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; flex-shrink: 0; margin-top: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${rule}</span>
        </li>
      `;
    });

    container.innerHTML = `
      <div class="t-grid-container">
        
        <!-- Full-Width Header Banner with Prize Card side-by-side -->
        <div class="t-banner-header">
          <!-- Left: Title & Date -->
          <div class="t-banner-info" style="margin: 0; width: 100%;">
            <h3 class="t-banner-title" style="margin-bottom: 0.6rem;">${title}</h3>
            <p class="t-banner-date" style="margin-bottom: 0;">${date}</p>
          </div>
          
          <!-- Right: Prize Pool Showcase Card -->
          <div class="t-prize-card">
            <!-- Champion Badge -->
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--accent); font-weight: 700; letter-spacing: 1.5px; display: flex; align-items: center; gap: 0.4rem;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; color: var(--accent);"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a4 4 0 0 0-4 4v6h8V6a4 4 0 0 0-4-4z"></path></svg>
                ${labelPrizeFirst}
              </span>
              <span style="font-size: 1.25rem; font-weight: 700; color: #fff; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px;">
                ${prizeFirstVal}
              </span>
            </div>
            
            <!-- Runner-up Badge -->
            <div style="display: flex; flex-direction: column; gap: 0.4rem; border-left: 1px solid rgba(255, 255, 255, 0.06); padding-left: 1.2rem;">
              <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; letter-spacing: 1.5px; display: flex; align-items: center; gap: 0.4rem;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; color: var(--text-secondary);"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                ${labelPrizeSecond}
              </span>
              <span style="font-size: 1.25rem; font-weight: 700; color: rgba(255, 255, 255, 0.95); font-family: 'Outfit', sans-serif; letter-spacing: -0.5px;">
                ${prizeSecondVal}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Side-by-Side Specs & Rules Sub-Grid -->
        <div class="t-sub-grid">
          
          <!-- Left Side: Specs List -->
          <div class="t-specs-list" style="margin: 0; width: 100%;">
            <div class="t-spec-item">
              <span class="t-spec-label">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; flex-shrink: 0;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                ${labelTeams}
              </span>
              <span class="t-spec-val">${teamsVal}</span>
            </div>
            <div class="t-spec-item">
              <span class="t-spec-label">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; flex-shrink: 0;"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                ${labelStyle}
              </span>
              <span class="t-spec-val">${styleVal}</span>
            </div>
            <div class="t-spec-item">
              <span class="t-spec-label">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><path d="M6 12a6 6 0 0 1 12 0"></path><path d="M12 2v20"></path></svg>
                ${labelPlayers}
              </span>
              <span class="t-spec-val">${playersVal}</span>
            </div>
            <div class="t-spec-item">
              <span class="t-spec-label">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; flex-shrink: 0;"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                ${labelFees}
              </span>
              <span class="t-spec-val">${feeVal}</span>
            </div>
          </div>
          
          <!-- Right Side: Rules & Card Penalties Wrapper -->
          <div class="t-rules-wrapper" style="margin: 0;">
            <h4 style="margin-top: 0;">${labelRules}</h4>
            <ul style="list-style: none; padding: 0; margin: 0; margin-bottom: 1.5rem;">
              ${rulesHtml}
            </ul>
            
            <!-- Card Fines Callout -->
            <div style="display: flex; flex-direction: column; gap: 0.6rem; border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 1.2rem; margin-bottom: 2.5rem;">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; letter-spacing: 1px; display: block;">
                Card Penalties
              </span>
              <div style="display: flex; gap: 1.5rem; font-size: 0.9rem; color: rgba(255, 255, 255, 0.85); align-items: center; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div style="width: 10px; height: 14px; background: #eab308; border-radius: 2px;"></div>
                  <span>Yellow Card: ${activeEventData.yellowCardFine}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div style="width: 10px; height: 14px; background: #ef4444; border-radius: 2px;"></div>
                  <span>Red Card: ${activeEventData.redCardFine}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        <!-- Registration Hotlines -->
        <div style="display: flex; flex-direction: column; gap: 0.6rem; border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 1.5rem; width: 100%;">
          <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; letter-spacing: 1.5px; display: block;">
            ${labelContact}
          </span>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${contactsHtml}
          </div>
        </div>
        
      </div>
    `;
  } else {
    const noEventMsg = currentLang === 'en' ? 'Currently no active tournaments. Stay tuned!' : 'বর্তমানে কোনো সক্রিয় টুর্নামেন্ট নেই। সাথেই থাকুন!';
    container.innerHTML = `
      <div class="card" style="background: rgba(255, 255, 255, 0.02); border: 1px dashed rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 3rem 2rem; color: var(--text-muted); text-align: center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 48px; height: 48px; color: rgba(255, 255, 255, 0.2); margin-bottom: 1.5rem; display: block; margin-left: auto; margin-right: auto;"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
        <p style="font-size: 1.1rem; font-weight: 500;">${noEventMsg}</p>
      </div>
    `;
  }
}

function renderPlayers() {
  const tbody = document.getElementById('playerTableBody');
  if (!tbody || playersData.length === 0) return;
  
  tbody.innerHTML = '';
  
  if (filteredPlayersList.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td colspan="5" style="text-align: center; padding: 2.5rem; color: var(--text-muted); font-size: 0.95rem;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; color: rgba(255, 255, 255, 0.25); margin-bottom: 0.5rem; display: block; margin-left: auto; margin-right: auto;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span data-en="No players found matching your search." data-bn="আপনার অনুসন্ধানের সাথে মিলে এমন কোনো খেলোয়াড় পাওয়া যায়নি।">${currentLang === 'en' ? 'No players found matching your search.' : 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো খেলোয়াড় পাওয়া যায়নি।'}</span>
      </td>
    `;
    tbody.appendChild(tr);
    return;
  }
  
  filteredPlayersList.forEach((player, index) => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer'; // Indicate entire row is clickable
    
    // 1. Select Checkbox Cell
    const tdSelect = document.createElement('td');
    tdSelect.style.textAlign = 'center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'player-select-checkbox';
    checkbox.checked = !!player.selected;
    if (player.selected) {
      tr.classList.add('row-selected');
    }
    
    const updatePlayerSelection = (isSelected) => {
      player.selected = isSelected;
      const mainPlayer = playersData.find(p => p.jersey === player.jersey);
      if (mainPlayer) {
        mainPlayer.selected = isSelected;
      }
      tr.classList.toggle('row-selected', isSelected);
      updateSelectAllState();
    };
    
    // Checkbox directly clicked
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid double toggling via row's click listener
      updatePlayerSelection(checkbox.checked);
    });
    
    tdSelect.appendChild(checkbox);
    tr.appendChild(tdSelect);

    // Click anywhere on row to select
    tr.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      updatePlayerSelection(checkbox.checked);
    });
    
    // 2. Count / Serial (Strictly English)
    const tdCount = document.createElement('td');
    tdCount.style.fontWeight = '500';
    tdCount.style.textAlign = 'center';
    tdCount.textContent = index + 1;
    tr.appendChild(tdCount);
    
    // 3. Jersey Number (Strictly English)
    const tdJersey = document.createElement('td');
    tdJersey.style.textAlign = 'center';
    tdJersey.innerHTML = `<span class="badge-jersey">${player.jersey}</span>`;
    tr.appendChild(tdJersey);
    
    // 4. Player Name (Strictly English)
    const tdName = document.createElement('td');
    tdName.className = 'player-name-cell';
    tdName.textContent = player.name;
    tr.appendChild(tdName);
    
    // 5. Jersey Size (Strictly English)
    const tdSize = document.createElement('td');
    tdSize.style.textAlign = 'center';
    tdSize.innerHTML = `<span class="badge-size">${player.size}</span>`;
    tr.appendChild(tdSize);
    
    tbody.appendChild(tr);
  });

  // Master Select All toggle binding
  const selectAllCb = document.getElementById('selectAllCheckbox');
  if (selectAllCb) {
    // Clear old listeners by cloning
    const newSelectAll = selectAllCb.cloneNode(true);
    selectAllCb.parentNode.replaceChild(newSelectAll, selectAllCb);
    
    newSelectAll.addEventListener('change', () => {
      const isChecked = newSelectAll.checked;
      filteredPlayersList.forEach(player => {
        player.selected = isChecked;
        const mainPlayer = playersData.find(p => p.jersey === player.jersey);
        if (mainPlayer) mainPlayer.selected = isChecked;
      });
      
      const checkboxes = document.querySelectorAll('.player-select-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = isChecked;
        cb.closest('tr')?.classList.toggle('row-selected', isChecked);
      });
    });
    
    // Initialize correct select all state based on visible checkboxes
    updateSelectAllState();
  }
}

function updateSelectAllState() {
  const selectAllCb = document.getElementById('selectAllCheckbox');
  if (!selectAllCb) return;
  const checkboxes = document.querySelectorAll('.player-select-checkbox');
  const checked = document.querySelectorAll('.player-select-checkbox:checked');
  
  selectAllCb.checked = checkboxes.length > 0 && checkboxes.length === checked.length;
  selectAllCb.indeterminate = checked.length > 0 && checked.length < checkboxes.length;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  updateLanguage();
  loadPlayers();
  loadActiveEvent();
  loadGallery();
  handleScroll(); // Initialize navbar scroll state on load

  // Squad Search Filter Event Trigger
  const searchInput = document.getElementById('playerSearchInput');
  searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    filteredPlayersList = playersData.filter(player => {
      return player.name.toLowerCase().includes(query) || player.jersey.toLowerCase().includes(query);
    });
    renderPlayers();
  });
  
  // Bulletproof Background Video Autoreplay Loop
  document.querySelectorAll('video').forEach(video => {
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play().catch(err => console.warn("Video replay auto-recovery prevented by browser policy:", err));
    });
  });
  
  // CSV Downloader trigger
  document.getElementById('downloadCsvBtn')?.addEventListener('click', () => {
    if (filteredPlayersList.length === 0) return;
    
    const hasSelection = filteredPlayersList.some(p => p.selected);
    
    // Generate valid CSV content
    let csv = "Serial,Jersey No.,Player Name,Size\n";
    let targetIndex = 1;
    
    filteredPlayersList.forEach((p) => {
      // If there is a selection, skip unselected rows
      if (hasSelection && !p.selected) return;
      
      // Escape commas or double-quotes inside names
      const name = `"${p.name.replace(/"/g, '""')}"`;
      csv += `${targetIndex},${p.jersey},${name},${p.size}\n`;
      targetIndex++;
    });
    
    // Create Blob and trigger native download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "khaskandi_zubo_songho_squad.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // PDF Downloader trigger (Print-Ready PDF)
  document.getElementById('downloadPdfBtn')?.addEventListener('click', () => {
    if (filteredPlayersList.length === 0) return;
    
    const hasSelection = filteredPlayersList.some(p => p.selected);
    
    // 1. Calculate Size Counts dynamically based on selected or visible players
    const counts = {};
    filteredPlayersList.forEach((p) => {
      if (hasSelection && !p.selected) return;
      const sz = (p.size || '').toUpperCase().trim();
      if (sz) {
        counts[sz] = (counts[sz] || 0) + 1;
      }
    });
    
    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL'];
    const sortedSizes = Object.keys(counts).sort((a, b) => {
      const idxA = sizeOrder.indexOf(a);
      const idxB = sizeOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
    
    let sizeText = 'Size Count: ';
    const sizeParts = [];
    sortedSizes.forEach(sz => {
      sizeParts.push(`${sz}=${counts[sz]}`);
    });
    sizeText += sizeParts.join(', ');
    
    const printSizeCounts = document.getElementById('printSizeCounts');
    if (printSizeCounts) printSizeCounts.textContent = sizeText;
    
    // 2. Set Print Date (Always English)
    const printDate = document.getElementById('printDate');
    if (printDate) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const dateStr = new Date().toLocaleDateString('en-US', options);
      printDate.textContent = 'Date: ' + dateStr;
    }
    
    // 3. Renumber serials and hide unselected rows in print layout
    const rows = document.querySelectorAll('#playerTableBody tr');
    const originalSerials = [];
    const serialCells = [];
    
    let targetPrintIndex = 1;
    filteredPlayersList.forEach((p, idx) => {
      const row = rows[idx];
      if (!row) return;
      const serialCell = row.cells[1];
      if (serialCell) {
        originalSerials.push(serialCell.textContent);
        serialCells.push(serialCell);
        
        if (hasSelection && !p.selected) {
          row.classList.add('print-hidden');
        } else {
          row.classList.remove('print-hidden');
          serialCell.textContent = targetPrintIndex;
          targetPrintIndex++;
        }
      }
    });
    
    // 4. Trigger browser native vector print dialog instantly!
    window.print();
    
    // 5. Restore original serial numbers and display styles immediately
    serialCells.forEach((cell, idx) => {
      cell.textContent = originalSerials[idx];
    });
    rows.forEach(row => row.classList.remove('print-hidden'));
  });
});

// ===== Simple form handler =====
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Message Sent! ✓';
  btn.style.background = 'var(--accent)';
  setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; e.target.reset(); }, 2500);
});

// ===== Copy Tournament Link Handler =====
window.copyTournamentLink = function(btn) {
  const url = window.location.origin + window.location.pathname + '#tournament';
  navigator.clipboard.writeText(url).then(() => {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    btn.style.borderColor = "rgba(34, 197, 94, 0.5)";
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.borderColor = "rgba(255, 255, 255, 0.1)";
    }, 2000);
  }).catch(err => console.error('Failed to copy', err));
};

// ===== Frosted Glass Lightbox Handler =====
let currentLightboxIndex = 0;
let lightboxMediaList = [];

// ===== Frosted Glass Lightbox Handler =====
window.openLightbox = function(src, type = 'image') {
  let lightbox = document.getElementById('gallery-lightbox');
  
  // Set active media navigation list
  lightboxMediaList = activeMediaList || [];
  currentLightboxIndex = lightboxMediaList.findIndex(item => item.src === src);
  if (currentLightboxIndex === -1) {
    lightboxMediaList = [{ src, type }];
    currentLightboxIndex = 0;
  }

  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'gallery-lightbox';
    lightbox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(10, 10, 12, 0.92);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.3s ease;
      cursor: zoom-out;
    `;
    
    const img = document.createElement('img');
    img.id = 'lightbox-img';
    img.style.cssText = `
      max-width: 90%;
      max-height: 80%;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      transform: scale(0.95);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: none;
    `;
    
    const video = document.createElement('video');
    video.id = 'lightbox-video';
    video.controls = true;
    video.style.cssText = `
      max-width: 90%;
      max-height: 80%;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      transform: scale(0.95);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: none;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close-btn';
    closeBtn.innerHTML = '&times;';
    
    const downloadBtn = document.createElement('a');
    downloadBtn.className = 'lightbox-download-btn';
    downloadBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      <span class="dl-text">Download</span>
    `;

    // Responsive Arrow Navigation Buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-nav-btn prev';
    prevBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;"><polyline points="15 18 9 12 15 6"></polyline></svg>
    `;
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-nav-btn next';
    nextBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;"><polyline points="9 18 15 12 9 6"></polyline></svg>
    `;
    
    const navigateLightbox = (dir) => {
      if (lightboxMediaList.length <= 1) return;
      currentLightboxIndex += dir;
      if (currentLightboxIndex < 0) currentLightboxIndex = lightboxMediaList.length - 1;
      if (currentLightboxIndex >= lightboxMediaList.length) currentLightboxIndex = 0;
      showLightboxMedia();
    };
    
    prevBtn.onclick = (e) => {
      e.stopPropagation();
      navigateLightbox(-1);
    };
    nextBtn.onclick = (e) => {
      e.stopPropagation();
      navigateLightbox(1);
    };
    
    // Swipe Touch Gestures for Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.ontouchstart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    
    lightbox.ontouchend = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diffX = touchEndX - touchStartX;
      const threshold = 50; // swipe minimum offset
      if (Math.abs(diffX) > threshold) {
        if (diffX < 0) {
          navigateLightbox(1); // Swipe left -> Next
        } else {
          navigateLightbox(-1); // Swipe right -> Prev
        }
      }
    };
    
    // Keyboard navigation binds
    const handleKeydown = (e) => {
      if (lightbox.style.display === 'flex') {
        if (e.key === 'ArrowLeft') {
          navigateLightbox(-1);
        } else if (e.key === 'ArrowRight') {
          navigateLightbox(1);
        } else if (e.key === 'Escape') {
          closeLightbox();
        }
      }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // Stop lightbox closing when clicking inside the media elements or download button
    img.onclick = (e) => e.stopPropagation();
    video.onclick = (e) => e.stopPropagation();
    downloadBtn.onclick = (e) => e.stopPropagation();
    
    lightbox.appendChild(img);
    lightbox.appendChild(video);
    lightbox.appendChild(closeBtn);
    lightbox.appendChild(downloadBtn);
    lightbox.appendChild(prevBtn);
    lightbox.appendChild(nextBtn);
    document.body.appendChild(lightbox);
    
    const closeLightbox = () => {
      lightbox.style.opacity = '0';
      img.style.transform = 'scale(0.95)';
      video.style.transform = 'scale(0.95)';
      video.pause();
      // Restore background body scrolling
      document.body.style.overflow = '';
      setTimeout(() => {
        lightbox.style.display = 'none';
      }, 300);
    };
    
    lightbox.onclick = closeLightbox;
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeLightbox();
    };
  }

  // Active rendering pipeline
  const showLightboxMedia = () => {
    const item = lightboxMediaList[currentLightboxIndex];
    if (!item) return;
    
    const img = lightbox.querySelector('#lightbox-img');
    const video = lightbox.querySelector('#lightbox-video');
    const downloadBtn = lightbox.querySelector('.lightbox-download-btn');
    const dlText = downloadBtn.querySelector('.dl-text');
    const prevBtn = lightbox.querySelector('.lightbox-nav-btn.prev');
    const nextBtn = lightbox.querySelector('.lightbox-nav-btn.next');
    
    // Set up download attributes
    downloadBtn.href = item.src;
    const filename = item.src.substring(item.src.lastIndexOf('/') + 1);
    downloadBtn.setAttribute('download', filename);
    
    if (item.type === 'video') {
      img.style.display = 'none';
      video.style.display = 'block';
      video.src = item.src;
      video.load();
      video.play();
      dlText.textContent = currentLang === 'en' ? 'Download Video' : 'ভিডিও ডাউনলোড করুন';
    } else {
      video.style.display = 'none';
      video.pause();
      img.style.display = 'block';
      img.src = item.src;
      dlText.textContent = currentLang === 'en' ? 'Download Image' : 'ছবি ডাউনলোড করুন';
    }
    
    // Update Arrow Visibilities
    if (lightboxMediaList.length <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    } else {
      if (prevBtn) prevBtn.style.display = 'flex';
      if (nextBtn) nextBtn.style.display = 'flex';
    }
    
    // Dynamic transition scaling triggers
    img.style.transform = 'scale(0.95)';
    video.style.transform = 'scale(0.95)';
    setTimeout(() => {
      img.style.transform = 'scale(1)';
      video.style.transform = 'scale(1)';
    }, 50);
  };

  // Block background body scrolling when lightbox is active
  document.body.style.overflow = 'hidden';
  
  // Render active item
  showLightboxMedia();
  
  lightbox.style.display = 'flex';
  // Trigger reflow
  lightbox.offsetHeight;
  lightbox.style.opacity = '1';
};

// ===== Citations Collapsible Accordion =====
window.toggleCitations = function() {
  const trigger = document.querySelector('.citations-trigger');
  const panel = document.getElementById('citations-panel');
  if (!trigger || !panel) return;
  
  const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
  trigger.setAttribute('aria-expanded', !isExpanded);
  
  if (!isExpanded) {
    panel.style.maxHeight = panel.scrollHeight + 'px';
    panel.style.opacity = '1';
    panel.style.marginTop = '1.5rem';
  } else {
    panel.style.maxHeight = '0';
    panel.style.opacity = '0';
    panel.style.marginTop = '0';
  }
};

