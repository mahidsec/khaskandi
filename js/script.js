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
  renderPlayers();
  renderActiveEvent();
}

langBtn?.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'bn' : 'en';
  updateLanguage();
});

// ===== Player Squad Fetching & Dynamic Table =====
let playersData = [];

async function loadPlayers() {
  try {
    const res = await fetch('squad.json');
    if (!res.ok) throw new Error('Failed to fetch player database (squad.json)');
    const data = await res.json();
    // Sort numerically by Jersey number ascending
    playersData = data.sort((a, b) => Number(a.jersey) - Number(b.jersey));
    renderPlayers();
  } catch (err) {
    console.error('Error loading squad database:', err);
  }
}

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
    const feeVal = currentLang === 'en' ? activeEventData.entryFeeEn : activeEventData.entryFeeBn;
    const finesVal = currentLang === 'en' ? activeEventData.fineFeeEn : activeEventData.fineFeeBn;
    const prizeFirstVal = activeEventData.prizeFirstEn; // English is standard
    const prizeSecondVal = activeEventData.prizeSecondEn; // English is standard
    let contactsHtml = '';
    if (activeEventData.contacts && activeEventData.contacts.length > 0) {
      activeEventData.contacts.forEach(contact => {
        const contactName = currentLang === 'en' ? contact.nameEn : contact.nameBn;
        const contactPhone = contact.phoneEn; // Standard English format for phone display
        const cleanPhone = contact.phoneEn.replace(/[\s-]+/g, '');
        
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
                ${labelFines}
              </span>
              <div style="display: flex; gap: 1.5rem; font-size: 0.9rem; color: rgba(255, 255, 255, 0.85); align-items: center; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div style="width: 10px; height: 14px; background: #eab308; border-radius: 2px;"></div>
                  <span>${currentLang === 'en' ? 'Yellow Card: ৳100' : 'হলুদ কার্ড: ৳১০০'}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div style="width: 10px; height: 14px; background: #ef4444; border-radius: 2px;"></div>
                  <span>${currentLang === 'en' ? 'Red Card: ৳200' : 'লাল কার্ড: ৳২০০'}</span>
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
  
  playersData.forEach((player, index) => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer'; // Indicate entire row is clickable
    
    // 1. Select Checkbox Cell
    const tdSelect = document.createElement('td');
    tdSelect.style.textAlign = 'center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'player-select-checkbox';
    
    // Checkbox directly clicked
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid double toggling via row's click listener
      tr.classList.toggle('row-selected', checkbox.checked);
      updateSelectAllState();
    });
    
    tdSelect.appendChild(checkbox);
    tr.appendChild(tdSelect);

    // Click anywhere on row to select
    tr.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      tr.classList.toggle('row-selected', checkbox.checked);
      updateSelectAllState();
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
    tdName.style.color = 'var(--text-primary)';
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
    selectAllCb.checked = false;
    selectAllCb.indeterminate = false;
    
    // Clear old listeners by cloning
    const newSelectAll = selectAllCb.cloneNode(true);
    selectAllCb.parentNode.replaceChild(newSelectAll, selectAllCb);
    
    newSelectAll.addEventListener('change', () => {
      const checkboxes = document.querySelectorAll('.player-select-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = newSelectAll.checked;
        cb.closest('tr')?.classList.toggle('row-selected', cb.checked);
      });
    });
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
  handleScroll(); // Initialize navbar scroll state on load
  
  // Bulletproof Background Video Autoreplay Loop
  document.querySelectorAll('video').forEach(video => {
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play().catch(err => console.warn("Video replay auto-recovery prevented by browser policy:", err));
    });
  });
  
  // CSV Downloader trigger
  document.getElementById('downloadCsvBtn')?.addEventListener('click', () => {
    if (playersData.length === 0) return;
    
    const checkboxes = document.querySelectorAll('.player-select-checkbox');
    const checked = document.querySelectorAll('.player-select-checkbox:checked');
    const hasSelection = checked.length > 0;
    
    // Generate valid CSV content
    let csv = "Serial,Jersey No.,Player Name,Size\n";
    let targetIndex = 1;
    
    playersData.forEach((p, idx) => {
      // If there is a selection, skip unselected rows
      if (hasSelection && !checkboxes[idx]?.checked) return;
      
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
    const element = document.querySelector('.table-wrapper');
    if (!element || playersData.length === 0) return;
    
    const btn = document.getElementById('downloadPdfBtn');
    const originalText = btn.innerHTML;
    
    // Premium dynamic spinner state
    btn.innerHTML = `
      <svg class="animate-spin" style="animation: spin 1s linear infinite; width: 15px; height: 15px; margin-right: 8px; stroke: currentColor;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10" style="opacity:0.25;"></circle><path d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4z" fill="currentColor"></path></svg>
      <span>Generating PDF...</span>
    `;
    btn.disabled = true;

    const runExport = () => {
      window.html2canvas(element, {
        backgroundColor: '#ffffff', // Pure white background for cost-effective printing!
        scale: 2.5, // Ultra-high resolution print-ready scale!
        useCORS: true,
        logging: false,
        windowWidth: 1024, // Render as if on a 1024px wide desktop viewport!
        onclone: (clonedDoc) => {
          // Force standard desktop document boundaries inside the virtual clone document
          clonedDoc.documentElement.style.width = '1024px';
          clonedDoc.body.style.width = '1024px';
          clonedDoc.body.style.overflow = 'visible';

          const wrapper = clonedDoc.querySelector('.table-wrapper');
          if (wrapper) {
            // Apply pristine monochrome black-and-white styling
            wrapper.style.width = '960px'; // Lock a broad, perfect desktop table width in memory!
            wrapper.style.margin = '0 auto';
            wrapper.style.background = '#ffffff';
            wrapper.style.boxShadow = 'none';
            wrapper.style.border = 'none'; // REMOVE heavy outer border near edge!
            wrapper.style.borderRadius = '0';
            wrapper.style.padding = '0'; // Flat clean edge table!

            const clonedRows = wrapper.querySelectorAll('tbody tr');
            const originalCheckboxes = document.querySelectorAll('.player-select-checkbox');
            const hasSelection = document.querySelectorAll('.player-select-checkbox:checked').length > 0;

            // 1. If there is a selection, remove unselected rows in the clone
            if (hasSelection) {
              originalCheckboxes.forEach((cb, idx) => {
                if (!cb.checked) {
                  const rowToRemove = clonedRows[idx];
                  if (rowToRemove) {
                    rowToRemove.parentNode.removeChild(rowToRemove);
                  }
                }
              });
            }

            // 2. STRIP Select Checkbox Column entirely from the printable document!
            wrapper.querySelectorAll('tr').forEach(tr => {
              const firstCell = tr.firstElementChild;
              if (firstCell) {
                firstCell.parentNode.removeChild(firstCell);
              }
            });

            // 3. Sequentially re-number serials (#) for remaining printed rows (from 1 to N)!
            wrapper.querySelectorAll('tbody tr').forEach((tr, newIdx) => {
              const serialCell = tr.firstElementChild;
              if (serialCell) {
                serialCell.textContent = newIdx + 1;
              }
            });

            // Count sizes dynamically based on target printed players!
            const counts = {};
            playersData.forEach((p, idx) => {
              // Skip unselected players if selection exists
              if (hasSelection && !originalCheckboxes[idx]?.checked) return;
              
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

            // Inject premium side-by-side header block at the top of the PDF!
            const headerBlock = clonedDoc.createElement('div');
            headerBlock.style.width = '100%';
            headerBlock.style.marginBottom = '1.5rem'; // Margin to table content below

            const headerTable = clonedDoc.createElement('table');
            headerTable.style.width = '100%';
            headerTable.style.borderCollapse = 'collapse';
            headerTable.style.border = 'none';

            const hRow = clonedDoc.createElement('tr');

            // 1. Left Cell (Size Count Block - Slightly Bigger)
            const leftTd = clonedDoc.createElement('td');
            leftTd.style.width = '30%';
            leftTd.style.textAlign = 'left';
            leftTd.style.verticalAlign = 'top';
            leftTd.style.border = 'none';
            leftTd.style.padding = '0';

            const sizeCountDiv = clonedDoc.createElement('div');
            sizeCountDiv.style.textAlign = 'left';
            sizeCountDiv.style.fontSize = '12px'; // Slightly bigger! (increased from 10px)
            sizeCountDiv.style.lineHeight = '1.4';
            sizeCountDiv.style.color = '#000000';
            sizeCountDiv.style.fontFamily = 'sans-serif';

            const sizeLabel = clonedDoc.createElement('div');
            sizeLabel.textContent = 'Size Count:';
            sizeLabel.style.fontWeight = '700';
            sizeLabel.style.textTransform = 'uppercase';
            sizeLabel.style.letterSpacing = '0.5px';
            sizeLabel.style.marginBottom = '4px';
            sizeCountDiv.appendChild(sizeLabel);

            sortedSizes.forEach(sz => {
              const sizeRow = clonedDoc.createElement('div');
              sizeRow.textContent = `${sz} = ${counts[sz]}`;
              sizeCountDiv.appendChild(sizeRow);
            });
            leftTd.appendChild(sizeCountDiv);

            // 2. Center Cell (Club Title - Centered)
            const centerTd = clonedDoc.createElement('td');
            centerTd.style.width = '40%';
            centerTd.style.textAlign = 'center';
            centerTd.style.verticalAlign = 'top';
            centerTd.style.border = 'none';
            centerTd.style.padding = '0';

            const title = clonedDoc.createElement('h1');
            title.textContent = 'Khaskandi Zubo Songho';
            title.style.fontSize = '22px'; // Perfectly proportioned for center column
            title.style.fontWeight = '800';
            title.style.color = '#000000';
            title.style.textTransform = 'uppercase';
            title.style.letterSpacing = '1px';
            title.style.margin = '0';
            title.style.fontFamily = 'Georgia, serif';
            title.style.textAlign = 'center';
            centerTd.appendChild(title);

            // 3. Right Cell (Today's Date Block)
            const rightTd = clonedDoc.createElement('td');
            rightTd.style.width = '30%';
            rightTd.style.textAlign = 'right';
            rightTd.style.verticalAlign = 'top';
            rightTd.style.border = 'none';
            rightTd.style.padding = '0';

            const dateDiv = clonedDoc.createElement('div');
            dateDiv.style.textAlign = 'right';
            dateDiv.style.fontSize = '12px'; // Matching Left side size!
            dateDiv.style.lineHeight = '1.4';
            dateDiv.style.color = '#000000';
            dateDiv.style.fontFamily = 'sans-serif';

            const dateLabel = clonedDoc.createElement('div');
            dateLabel.textContent = 'Date:';
            dateLabel.style.fontWeight = '700';
            dateLabel.style.textTransform = 'uppercase';
            dateLabel.style.letterSpacing = '0.5px';
            dateLabel.style.marginBottom = '4px';
            dateDiv.appendChild(dateLabel);

            const dateValue = clonedDoc.createElement('div');
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            dateValue.textContent = new Date().toLocaleDateString('en-US', options);
            dateDiv.appendChild(dateValue);
            
            rightTd.appendChild(dateDiv);

            // Assemble row columns
            hRow.appendChild(leftTd);
            hRow.appendChild(centerTd);
            hRow.appendChild(rightTd);
            headerTable.appendChild(hRow);
            headerBlock.appendChild(headerTable);

            const table = wrapper.querySelector('.player-table');
            if (table) {
              table.style.color = '#000000';
              table.style.borderCollapse = 'collapse';
              wrapper.insertBefore(headerBlock, table);
            }

            // Headers: clean light-gray background with solid black text & border
            wrapper.querySelectorAll('th').forEach(th => {
              th.style.background = '#f2f4f3';
              th.style.color = '#000000';
              th.style.fontWeight = '700';
              th.style.borderBottom = '2px solid #000000';
              th.style.padding = '0.75rem 0.5rem';
            });

            // Table rows & cells: clean alternating zebra striping and plain black text
            wrapper.querySelectorAll('tbody tr').forEach((tr, trIdx) => {
              const bg = trIdx % 2 === 1 ? '#f8f9fa' : '#ffffff'; // Subtle light-gray for even rows
              tr.querySelectorAll('td').forEach(td => {
                td.style.color = '#000000';
                td.style.background = bg;
                td.style.borderBottom = '1px solid #e0e0e0';
                // Completely strip the left green indicator border in the printed PDF!
                td.style.setProperty('border-left', 'none', 'important');
                td.style.padding = '0.75rem 0.5rem';
              });
            });

            // Jersey Numbers: Strip boxes completely and render as plain, bold black text!
            wrapper.querySelectorAll('.badge-jersey').forEach(badge => {
              badge.style.background = 'transparent';
              badge.style.color = '#000000';
              badge.style.border = 'none';
              badge.style.fontWeight = '700';
              badge.style.boxShadow = 'none';
              badge.style.padding = '0';
              badge.style.margin = '0';
              badge.style.borderRadius = '0';
            });

            // Size Badges: Strip boxes completely and render as plain, bold black text!
            wrapper.querySelectorAll('.badge-size').forEach(badge => {
              badge.style.background = 'transparent';
              badge.style.color = '#000000';
              badge.style.border = 'none';
              badge.style.fontWeight = '700';
              badge.style.boxShadow = 'none';
              badge.style.padding = '0';
              badge.style.margin = '0';
              badge.style.borderRadius = '0';
              badge.style.width = 'auto';
              badge.style.height = 'auto';
              badge.style.display = 'inline';
              badge.style.backdropFilter = 'none';
            });
          }
        }
      }).then(canvas => {
        // PDF compilation logic using jsPDF library
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // A4 Width: 210mm. 15mm margins on left/right -> 180mm content width.
        const pageWidth = 210;
        const margin = 15;
        const contentWidth = pageWidth - 2 * margin; // 180mm
        
        const canvasRatio = canvas.width / canvas.height;
        const contentHeight = contentWidth / canvasRatio;
        
        pdf.addImage(imgData, 'PNG', margin, 10, contentWidth, contentHeight); // Top margin set to 10mm to pull the title higher!
        pdf.save('khaskandi_zubo_songho_squad.pdf');
        
        // Restore button state
        btn.innerHTML = originalText;
        btn.disabled = false;
      }).catch(err => {
        console.error(err);
        btn.innerHTML = originalText;
        btn.disabled = false;
        alert('Could not export PDF. Please download CSV instead!');
      });
    };

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const runWithLibraries = async () => {
      try {
        if (!window.html2canvas) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
        if (!window.jspdf) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }
        runExport();
      } catch (err) {
        console.error(err);
        btn.innerHTML = originalText;
        btn.disabled = false;
        alert('Offline or network failure: Could not load PDF print engine.');
      }
    };

    runWithLibraries();
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

