// Year
document.getElementById('yr').textContent = new Date().getFullYear();

// Nav toggle (hamburger)
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
navToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', ()=> {
  mobileMenu.classList.remove('open'); navToggle.setAttribute('aria-expanded','false');
}));

// Scrollspy (highlight nav while scrolling)
const sections=[...document.querySelectorAll("section[id]")];
const links=[...document.querySelectorAll(".menu a[href^='#']")];
const spy=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      links.forEach(l=>l.classList.toggle('active', l.getAttribute('href')==='#'+e.target.id));
    }
  })
},{rootMargin:"-45% 0px -50% 0px", threshold:[0,1]});
sections.forEach(s=>spy.observe(s));

// ---------- Estimator (sum tank + stand) ----------
const tankPrices = {1000:100, 2000:170, 2500:190, 5000:320};
const standForUpTo2500 = {3:220, 4:240, 6:340};
const standFor5000 = {3:300, 4:350, 6:500};

const tankSizeEl = document.getElementById('tankSize');
const standEl = document.getElementById('standHeight');
const resultEl = document.getElementById('estimate');
const breakdownEl = document.getElementById('breakdown');

function getStandPrice(tankLiters, heightM){
  const map = (tankLiters <= 2500) ? standForUpTo2500 : standFor5000;
  return map[heightM] || 0;
}

function calcEstimate(){
  const t = parseInt(tankSizeEl.value,10);
  const h = parseInt(standEl.value,10);
  const tankCost = tankPrices[t] || 0;
  const standCost = getStandPrice(t, h);
  const total = tankCost + standCost;
  breakdownEl.textContent = `Breakdown: Tank ${t}L — $${tankCost}  +  Stand ${h}m — $${standCost}`;
  resultEl.textContent = `Estimated Total: $${total}`;
  return {t, h, tankCost, standCost, total};
}
tankSizeEl?.addEventListener('change', calcEstimate);
standEl?.addEventListener('change', calcEstimate);
calcEstimate();

// Before/After slider
const slider=document.getElementById('slider');
const afterWrap=document.getElementById('afterWrap');
if(slider&&afterWrap){ afterWrap.style.width=slider.value+'%'; slider.addEventListener('input',()=>afterWrap.style.width=slider.value+'%'); }

// WhatsApp helpers
const waNumber = "263774887686";
function waUrlFromValues(values) {
  const {name, phone, loc, tank, height, service, msg} = values;
  const text = `Hello Mr Tank Stand,%0A%0AI'd like a quote:%0A- Name: ${encodeURIComponent(name||'')}%0A- Phone: ${encodeURIComponent(phone||'')}%0A- Location: ${encodeURIComponent(loc||'')}%0A- Tank: ${encodeURIComponent(tank||'')}%0A- Stand: ${encodeURIComponent(height||'')}%0A- Service: ${encodeURIComponent(service||'')}%0A- Notes: ${encodeURIComponent(msg||'')}%0A%0AFound you on your website.`;
  return `https://wa.me/${waNumber}?text=${text}`;
}
function isValidPhone(v){ const digits = (v||'').replace(/\s+/g,''); return /^\+?\d{8,15}$/.test(digits); }

// Prefilled WA from estimator (with breakdown + total)
const waHero = document.getElementById('waHero');
function basicWA(){
  const {t, h, tankCost, standCost, total} = calcEstimate();
  const text = `Hello Mr Tank Stand,%0A%0AI'd like a quote for:%0A- Tank: ${t}L (US$${tankCost})%0A- Stand: ${h}m (US$${standCost})%0A- Estimated Total: US$${total}%0A%0APlease contact me.`;
  return `https://wa.me/${waNumber}?text=${text}`;
}
function refreshWA(){ if(waHero) waHero.href = basicWA(); }
refreshWA();
tankSizeEl?.addEventListener('change', refreshWA);
standEl?.addEventListener('change', refreshWA);

// Form validation + submit
const qf = document.getElementById('quoteForm');
const nameEl = document.getElementById('name');
const phoneEl = document.getElementById('phone');
function mark(el, ok, msgId, okText, errText){
  const hint = document.getElementById(msgId);
  el.classList.remove('ok','err'); hint?.classList.remove('ok','err');
  if(ok){ el.classList.add('ok'); hint&&(hint.textContent=okText, hint.classList.add('ok')); }
  else{ el.classList.add('err'); hint&&(hint.textContent=errText, hint.classList.add('err')); }
}
nameEl.addEventListener('input', ()=> mark(nameEl, nameEl.value.trim().length>=2, 'hint-name', 'Looks good ✅','Enter your full name'));
phoneEl.addEventListener('input', ()=> mark(phoneEl, isValidPhone(phoneEl.value), 'hint-phone', 'Valid ✔','Use a valid number (e.g., +263774887686)'));
// initial hints
mark(nameEl, false, 'hint-name','Looks good ✅','Enter your full name');
mark(phoneEl, false, 'hint-phone','Valid ✔','Use a valid number (e.g., +263774887686)');

qf.addEventListener('submit', (e)=>{
  e.preventDefault();
  if(qf.querySelector('[name="website"]').value){ return; } // honeypot
  const valid = nameEl.value.trim().length>=2 && isValidPhone(phoneEl.value);
  if(!valid){ alert('Please fill in your name and a valid phone number.'); return; }
  const values = {
    name: nameEl.value, phone: phoneEl.value, loc: document.getElementById('loc').value,
    tank: document.getElementById('tank').value, height: document.getElementById('height').value,
    service: document.getElementById('service').value, msg: document.getElementById('msg').value
  };
  window.open(waUrlFromValues(values), '_blank');
});

// Back-to-top
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => { if (window.scrollY > 600) toTop.classList.add('show'); else toTop.classList.remove('show'); });
toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

// Fullscreen Map modal
const openFs = document.getElementById('openMapFs');
const mapModal = document.createElement('div');
mapModal.className = 'modal';
mapModal.innerHTML = `
  <div class="modal__inner" role="dialog" aria-modal="true" aria-label="Fullscreen map">
    <div class="modal__bar">
      <strong>Mr Tank Stand — Map</strong>
      <button class="close-x" aria-label="Close map">Close</button>
    </div>
    <div class="modal__body">
      <iframe title="Mr Tank Stand Map (Fullscreen)" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Old%20SPCA%20Building%2C%20Graniteside%2C%20Harare&output=embed"></iframe>
    </div>
  </div>`;
document.body.appendChild(mapModal);
const closeMapBtn = mapModal.querySelector('.close-x');
function openMap(){ mapModal.classList.add('open'); document.body.style.overflow='hidden'; }
function closeMap(){ mapModal.classList.remove('open'); document.body.style.overflow=''; }
openFs?.addEventListener('click', openMap);
closeMapBtn?.addEventListener('click', closeMap);
mapModal.addEventListener('click',(e)=>{ if(e.target===mapModal) closeMap(); });
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeMap(); });

// Gallery lazy loading
const gallery = document.getElementById('galleryGrid');
const imgs = [...gallery.querySelectorAll('img[data-src]')];
const lazyObs = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      const img = en.target;
      img.src = img.dataset.src;
      img.onload = ()=> img.parentElement.classList.remove('skel');
      lazyObs.unobserve(img);
    }
  });
},{rootMargin:'150px'});
imgs.forEach(i=>lazyObs.observe(i));

// Mobile quote drawer
const drawer = document.createElement('div');
drawer.className = 'drawer-quote';
drawer.innerHTML = `
  <div class="drawer-quote__handle"></div>
  <div class="drawer-quote__body">
    <h3 class="section-title" style="margin-top:.2rem;color:var(--blue-900)">Quick Quote</h3>
    <form id="quoteFormMobile" novalidate>
      <div class="field"><label for="name_m">Full Name</label><input id="name_m" required placeholder="Your name"/><small class="hint" id="hint-name_m">Enter your full name</small></div>
      <div class="field"><label for="phone_m">Phone / WhatsApp</label><input id="phone_m" required inputmode="tel" placeholder="+263 77 488 7686"/><small class="hint" id="hint-phone_m">Use a valid number</small></div>
      <div class="row">
        <div class="field"><label for="loc_m">Location</label><input id="loc_m" placeholder="Suburb / Town"/></div>
        <div class="field"><label for="tank_m">Tank Size</label><select id="tank_m"><option>1000L</option><option>2000L</option><option>2500L</option><option>5000L</option></select></div>
      </div>
      <div class="row">
        <div class="field"><label for="height_m">Stand Height</label><select id="height_m"><option>3m</option><option>4m</option><option>6m</option></select></div>
        <div class="field"><label for="service_m">Service</label><select id="service_m"><option>New stand + tank</option><option>Stand only</option><option>Repair / Reinforce</option><option>Installation only</option></select></div>
      </div>
      <div class="field"><label for="msg_m">Notes (optional)</label><textarea id="msg_m" rows="3" placeholder="Anything else?"></textarea></div>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin:.4rem 0 1rem">
        <button type="submit" class="btn">WhatsApp Quote</button>
        <button type="button" id="closeDrawer" class="btn ghost">Close</button>
      </div>
    </form>
  </div>`;
document.body.appendChild(drawer);
function toggleDrawer(open){ drawer.classList.toggle('open', !!open); document.body.style.overflow = open ? 'hidden' : ''; }
document.getElementById('openQuoteDrawer').addEventListener('click', ()=>{ toggleDrawer(true); });
document.addEventListener('click',(e)=>{ if(e.target?.id==='closeDrawer' || e.target===drawer) toggleDrawer(false); });

document.getElementById('quoteFormMobile').addEventListener('submit',(e)=>{
  e.preventDefault();
  const nameM = document.getElementById('name_m').value.trim();
  const phoneM = document.getElementById('phone_m').value.trim();
  if(!(nameM && /^\+?\d{8,15}$/.test(phoneM.replace(/\s+/g,'')))){ alert('Please enter name and a valid phone number.'); return; }
  const values = {
    name: nameM, phone: phoneM, loc: document.getElementById('loc_m').value,
    tank: document.getElementById('tank_m').value, height: document.getElementById('height_m').value,
    service: document.getElementById('service_m').value, msg: document.getElementById('msg_m').value
  };
  window.open(waUrlFromValues(values), '_blank'); toggleDrawer(false);
});

// Extras buttons (WhatsApp shortcuts)
function waFromBundle(bundleName){
  const text = `Hello Mr Tank Stand,%0A%0AI'm interested in: ${encodeURIComponent(bundleName)}.%0APlease contact me with details and availability.`;
  window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
}
document.querySelectorAll('#extras [data-bundle]').forEach(btn=>{
  btn.addEventListener('click', ()=> waFromBundle(btn.getAttribute('data-bundle')));
});
document.querySelectorAll('#extras .to-quote').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    if(window.matchMedia('(max-width: 779px)').matches){ toggleDrawer(true); }
    else{ document.getElementById('contact')?.scrollIntoView({behavior:'smooth'}); }
  });
});
// ...existing code...

// Simple lightbox for gallery images
const galleryGrid = document.getElementById('galleryGrid');
if (galleryGrid) {
  galleryGrid.addEventListener('click', function(e) {
    const img = e.target.closest('img');
    if (!img) return;
    const src = img.getAttribute('data-src') || img.src;
    const alt = img.alt || '';
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal open';
    modal.innerHTML = `
      <div class="modal__inner" style="background:#000;display:flex;align-items:center;justify-content:center;">
        <img src="${src}" alt="${alt}" class="lightbox__img" style="max-width:90vw;max-height:90vh;object-fit:contain;">
        <button class="close-x" aria-label="Close" style="position:absolute;top:20px;right:20px;">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-x').onclick = () => modal.remove();
    modal.onclick = (ev) => { if (ev.target === modal) modal.remove(); };
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', esc); }
    });
  });
}

// ...existing code...