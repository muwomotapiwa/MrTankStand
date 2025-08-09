document.addEventListener('DOMContentLoaded', () => {
  // Year
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // Nav toggle (hamburger)
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', ()=> {
      mobileMenu.classList.remove('open'); navToggle.setAttribute('aria-expanded','false');
    }));
  }

  // Scrollspy
  const sections = [...document.querySelectorAll('section[id]')];
  const links = [...document.querySelectorAll(".menu a[href^='#']")];
  if (sections.length && links.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: [0, 1] });
    sections.forEach(s => spy.observe(s));
  }

  // Estimator
  const tankPrices = {1000:100, 2000:170, 2500:190, 5000:320};
  const stand2000 = {3:220, 4:240, 6:340};
  const stand5000 = {3:300, 4:350, 6:500};
  const tankSizeEl = document.getElementById('tankSize');
  const standEl = document.getElementById('standHeight');
  const resultEl = document.getElementById('estimate');

  function calcEstimate(){
    const t = parseInt(tankSizeEl?.value ?? '0', 10);
    const h = parseInt(standEl?.value ?? '0', 10);
    const tankCost = tankPrices[t] || 0;
    const standCost = (t <= 2500 ? stand2000[h] : stand5000[h]) || 0;
    const total = tankCost + standCost;
    if (resultEl) resultEl.textContent = "Estimated Total: $" + (total || 0);
  }
  tankSizeEl?.addEventListener('change', () => { calcEstimate(); refreshWA(); });
  standEl?.addEventListener('change', () => { calcEstimate(); refreshWA(); });
  calcEstimate();

  // Before/After slider
  const slider = document.getElementById('slider');
  const afterWrap = document.getElementById('afterWrap');
  if (slider && afterWrap) {
    afterWrap.style.width = slider.value + '%';
    slider.addEventListener('input', () => afterWrap.style.width = slider.value + '%');
  }

  // WhatsApp helpers
  const waNumber = "263774887686";
  function waUrlFromForm() {
    const name = document.getElementById('name')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const loc = document.getElementById('loc')?.value || '';
    const tank = document.getElementById('tank')?.value || '';
    const height = document.getElementById('height')?.value || '';
    const service = document.getElementById('service')?.value || '';
    const msg = document.getElementById('msg')?.value || '';
    const text = `Hello Mr Tank Stand,%0A%0AI'd like a quote:%0A- Name: ${encodeURIComponent(name)}%0A- Phone: ${encodeURIComponent(phone)}%0A- Location: ${encodeURIComponent(loc)}%0A- Tank: ${encodeURIComponent(tank)}%0A- Stand: ${encodeURIComponent(height)}%0A- Service: ${encodeURIComponent(service)}%0A- Notes: ${encodeURIComponent(msg)}%0A%0AFound you on your website.`;
    return `https://wa.me/${waNumber}?text=${text}`;
  }

  function isValidPhone(v){
    const digits = (v || '').replace(/\s+/g,'');
    return /^\+?\d{8,15}$/.test(digits);
  }

  const quoteForm = document.getElementById('quoteForm');
  quoteForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    // Honeypot
    const bot = document.querySelector('[name="website"]')?.value;
    if (bot) return;
    // Basic validation
    const phone = document.getElementById('phone')?.value || '';
    if(!isValidPhone(phone)){
      alert('Please enter a valid phone number (e.g., +263774887686).');
      return;
    }
    window.open(waUrlFromForm(), '_blank');
  });

  function basicWA(){
    const tLabel = tankSizeEl?.selectedOptions?.[0]?.text || '';
    const hLabel = (standEl?.value || '') + "m";
    const estimate = (resultEl?.textContent || '').replace("Estimated Total: ","");
    const text = `Hello Mr Tank Stand,%0A%0AI'd like a quote for:%0A- ${encodeURIComponent(tLabel)}%0A- Stand: ${encodeURIComponent(hLabel)}%0A- ${encodeURIComponent(estimate)}%0A%0APlease contact me.`;
    return `https://wa.me/${waNumber}?text=${text}`;
  }
  const waSticky = document.getElementById('waSticky');
  const waHero = document.getElementById('waHero');
  function refreshWA(){ if(waSticky) waSticky.href = basicWA(); if(waHero) waHero.href = basicWA(); }
  refreshWA();
});
