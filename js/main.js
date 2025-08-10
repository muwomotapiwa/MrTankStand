// ========= Mr Tank Stand — main.js (stable build + unified WA endpoint) =========

// --- Config ---
var WAPP_NUMBER = '263774887686'; // WhatsApp number (no + or spaces)
var PRICES = {
  tanks: { 1000: 100, 2000: 170, 2500: 190, 5000: 330 },
  stands: {
    "3_2000": 220, "4_2000": 240, "6_2000": 340,
    "3_5000": 300, "4_5000": 350, "6_5000": 500
  },
  delivery: { harare: 0, greater: 25, regional: 60 }
};

// ---- Analytics / UTM / Lead webhook (optional) ----
var LEAD_WEBHOOK_URL = ''; // If you have a Google Apps Script endpoint, paste here. Else leave ''.

function getUTM(){
  try{
    var p = new URLSearchParams(location.search);
    var parts = ['utm_source','utm_medium','utm_campaign','utm_content'].map(function(k){
      return p.get(k) ? (k+': '+p.get(k)) : '';
    }).filter(Boolean);
    return parts.length ? ('\n\nSource: ' + parts.join(' | ')) : '';
  }catch(e){ return ''; }
}

function trackLead(label){
  try{
    if (!LEAD_WEBHOOK_URL) return;
    var payload = {
      label: label,
      ts: new Date().toISOString(),
      path: location.pathname + location.search
    };
    fetch(LEAD_WEBHOOK_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    }).catch(function(){});
  }catch(e){}
}

// --- Small helpers ---
function $(s){ return document.querySelector(s); }
function $all(s){ return document.querySelectorAll(s); }
function toUSD(n){ n = Number(n)||0; return '$' + n.toFixed(2); }
function standPretty(val){
  if(!val || val.indexOf('_') === -1) return '';
  var parts = val.split('_');
  return parts[0] + 'm (for ' + parts[1] + 'L)';
}

// Unified WhatsApp opener (API endpoint everywhere)
function openWhatsApp(msg, label){
  var safe = (msg || '').toString();
  if (safe.replace(/\s/g,'').length < 10){
    alert('Could not build WhatsApp message. Please try again.');
    return;
  }
  var base = 'https://api.whatsapp.com/send?phone=' + WAPP_NUMBER + '&text=';
  var url  = base + encodeURIComponent(safe + getUTM());
  trackLead(label || 'WhatsApp Click');
  window.open(url, '_blank');
}

// Run after DOM is ready
document.addEventListener('DOMContentLoaded', function(){

  // ===== Header + Nav =====
  var header = $('#siteHeader');
  var navLinks = $all('.nav-link');
  window.addEventListener('scroll', function(){
    if (!header) return;
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });

  function scrollToHash(hash){
    var el = document.querySelector(hash);
    if(!el) return;
    var headerHeight = header ? header.getBoundingClientRect().height : 0;
    var y = el.getBoundingClientRect().top + window.pageYOffset - (headerHeight + 8);
    window.scrollTo({ top:y, behavior:'smooth' });
  }

  // mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var navMenu = document.getElementById('navMenu');
  if (toggle && navMenu){
    toggle.addEventListener('click', function(){
      var open = navMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  // close on click + smooth scroll
  for (var i=0;i<navLinks.length;i++){
    navLinks[i].addEventListener('click', function(){
      if (navMenu) navMenu.classList.remove('open');
    });
    navLinks[i].addEventListener('click', function(e){
      var href = this.getAttribute('href') || '';
      if (href.indexOf('#') === 0){
        e.preventDefault();
        scrollToHash(href);
      }
    });
  }

  // ===== Estimator =====
  var tankSelect = $('#tankSelect');
  var standSelect = $('#standSelect');
  var areaSelect  = $('#areaSelect');

  var tankPriceEl     = $('#tankPrice');
  var standPriceEl    = $('#standPrice');
  var deliveryPriceEl = $('#deliveryPrice');
  var totalPriceEl    = $('#totalPrice');

  function updateEstimate(){
    if (!tankSelect || !standSelect || !areaSelect) return {total:0};
    var tankVal = tankSelect.value;
    var standVal = standSelect.value;
    var areaVal  = areaSelect.value;

    var tankPrice     = PRICES.tanks[tankVal] || 0;
    var standPrice    = PRICES.stands[standVal] || 0;
    var deliveryPrice = PRICES.delivery[areaVal] || 0;

    var total = tankPrice + standPrice + deliveryPrice;

    if (tankPriceEl)     tankPriceEl.textContent = toUSD(tankPrice);
    if (standPriceEl)    standPriceEl.textContent = toUSD(standPrice);
    if (deliveryPriceEl) deliveryPriceEl.textContent = toUSD(deliveryPrice);
    if (totalPriceEl)    totalPriceEl.textContent = toUSD(total);

    return {
      tankVal: tankVal, standVal: standVal, areaVal: areaVal,
      tankPrice: tankPrice, standPrice: standPrice, deliveryPrice: deliveryPrice, total: total
    };
  }

  if (tankSelect) tankSelect.addEventListener('change', updateEstimate);
  if (standSelect) standSelect.addEventListener('change', updateEstimate);
  if (areaSelect)  areaSelect.addEventListener('change',  updateEstimate);
  updateEstimate();

  // Submit → WhatsApp (Estimator)
  var estimateForm = $('#estimateForm');
  if (estimateForm){
    estimateForm.addEventListener('submit', function(e){
      e.preventDefault();
      var est = updateEstimate();
      if (!est.tankVal || !est.standVal || !est.areaVal) {
        alert('Please select tank, stand and delivery area.');
        return;
      }
      var msg =
        'Hi, I saw your site (Mr Tank Stand) and I’d like a quote:\n' +
        '- Tank: ' + est.tankVal + 'L (' + toUSD(est.tankPrice) + ')\n' +
        '- Stand: ' + standPretty(est.standVal) + ' (' + toUSD(est.standPrice) + ')\n' +
        '- Delivery: ' + est.areaVal + ' (' + toUSD(est.deliveryPrice) + ')\n' +
        '= Estimated Total: ' + toUSD(est.total) + '\n\n' +
        'Name: (your name)\n' +
        'Location: (your area)\n' +
        'When can you deliver?';
      openWhatsApp(msg, 'Estimate WhatsApp');
    });
  }

  // Reset button
  var resetBtn = $('#resetBtn');
  if (resetBtn && estimateForm){
    resetBtn.addEventListener('click', function(){
      estimateForm.reset();
      updateEstimate();
    });
  }

  // ===== Packages → Prefill Contact =====
  var pkgBtns = $all('.pkg-btn');
  for (var p=0;p<pkgBtns.length;p++){
    pkgBtns[p].addEventListener('click', function(){
      var pkg = this.getAttribute('data-package') || 'Package';
      var msgInput = $('#msgInput');
      if (msgInput) msgInput.value = 'Package: ' + pkg;
      scrollToHash('#contact');
      trackLead('Package Prefill');
    });
  }

  // ===== Floating WhatsApp =====
  var whatsFloat = $('#whatsFloat');
  if (whatsFloat){
    whatsFloat.addEventListener('click', function(e){
      e.preventDefault();
      var msg = 'Hi, I saw your site (Mr Tank Stand). I’m interested in tanks & stands. Can you assist?';
      openWhatsApp(msg, 'Floating WhatsApp');
    });
  }

  // ===== Contact form → WhatsApp =====
  var contactForm = $('#contactForm');
  if (contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = ($('#nameInput') && $('#nameInput').value || '').trim();
      var phone = ($('#phoneInput') && $('#phoneInput').value || '').trim();
      var loc = ($('#locInput') && $('#locInput').value || '').trim();
      var msg = ($('#msgInput') && $('#msgInput').value || '').trim();

      if (!name || !phone){
        alert('Please enter your name and phone/WhatsApp number.');
        return;
      }

      var text =
        'Hi, I saw your site (Mr Tank Stand). Here are my details:\n' +
        'Name: ' + name + '\n' +
        'Phone: ' + phone + '\n' +
        'Location: ' + (loc || 'N/A') + '\n' +
        'Needs: ' + (msg || 'N/A');
      openWhatsApp(text, 'Contact WhatsApp');
    });
  }

  // ===== Back to top =====
  var toTop = $('#toTop');
  if (toTop){
    toTop.addEventListener('click', function(){
      window.scrollTo({ top:0, behavior:'smooth' });
    });
  }

  // ===== Year =====
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Lightbox for Gallery =====
  var gimgs = $all('.gimg');
  for (var g=0; g<gimgs.length; g++){
    gimgs[g].addEventListener('click', function(){
      var wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:1000';
      var big = document.createElement('img');
      big.src = this.src; big.alt = this.alt;
      big.style.cssText = 'max-width:92vw;max-height:92vh;border-radius:12px';
      wrap.appendChild(big);
      wrap.addEventListener('click', function(){ wrap.remove(); });
      document.body.appendChild(wrap);
    });
  }

  // ===== Sticky CTA (mobile) =====
  var stickyWhats = $('#stickyWhats');
  if (stickyWhats){
    stickyWhats.addEventListener('click', function(e){
      e.preventDefault();
      var msg = 'Hi, I saw your site (Mr Tank Stand). Can you assist?';
      openWhatsApp(msg, 'Sticky WhatsApp');
    });
  }

  // ===== Tank Sizing Wizard =====
  var peopleInput = document.getElementById('peopleInput');
  var litresInput = document.getElementById('litresInput');
  var daysInput   = document.getElementById('daysInput');
  var needEl      = document.getElementById('needLitres');
  var recEl       = document.getElementById('recTank');
  var sizingBtn   = document.getElementById('sizingToWA');

  function calcSizing(){
    if (!peopleInput || !litresInput || !daysInput) return {need:0, rec:'—'};
    var ppl = Math.max(1, Number(peopleInput.value)||0);
    var lppd = Math.max(20, Number(litresInput.value)||0);
    var days = Math.max(1, Number(daysInput.value)||0);
    var need = ppl * lppd * days;
    var rec = (need<=1000)?'1000L':
              (need<=2000)?'2000L':
              (need<=2500)?'2500L':'5000L';
    if (needEl) needEl.textContent = need.toFixed(0) + 'L';
    if (recEl)  recEl.textContent = rec + ' (based on your inputs)';
    return {need:need, rec:rec};
  }
  if (peopleInput) peopleInput.addEventListener('input', calcSizing);
  if (litresInput) litresInput.addEventListener('input', calcSizing);
  if (daysInput)   daysInput.addEventListener('input',  calcSizing);
  calcSizing();

  // Sizing → WhatsApp
  if (sizingBtn){
    sizingBtn.addEventListener('click', function(e){
      e.preventDefault();
      var r = calcSizing();
      var need = Math.max(0, Number(r.need)||0);
      var rec  = (r.rec || '').toString().trim() || '—';

      var msg =
        'Hi, I used your Tank Sizing Wizard.\n' +
        'Need: ' + need.toFixed(0) + 'L\n' +
        'Recommended tank: ' + rec + '\n' +
        'Please quote me on this.';
      openWhatsApp(msg, 'Sizing WhatsApp');
    });
  }

  // ===== Stand Height Visualizer (SVG) =====
  var slider = document.getElementById('heightSlider');
  var pressureHint = document.getElementById('pressureHint');
  function drawViz(){
    if (!slider) return;
    var m = Number(slider.value)||3; // 3,4,6
    var pxPerM = 40;                 // 6m ≈ 240px
    var standH = m * pxPerM;

    var standRect   = document.getElementById('stand');
    var tankGroup   = document.getElementById('tank');
    var tankShadow  = document.getElementById('tankShadow');
    var label       = document.getElementById('heightLabel');
    var labelBg     = document.getElementById('labelBg');

    if (standRect){
      var baseY = 300 - standH; // ground line at y=300
      standRect.setAttribute('y', baseY);
      standRect.setAttribute('height', standH);
    }
    if (tankGroup){
      var tankY = (300 - standH) - 46; // tank height ~46
      tankGroup.setAttribute('transform', 'translate(556,'+ tankY +')');
    }
    if (tankShadow){
      var shadowY = (300 - standH) - 5;
      tankShadow.setAttribute('cy', shadowY);
      tankShadow.setAttribute('opacity', Math.min(0.12, 0.06 + (standH/400)));
    }
    if (label && labelBg){
      var textY = (300 - standH) - 60;
      var bgY   = textY - 15;
      label.textContent = m + 'm stand';
      label.setAttribute('y', textY);
      labelBg.setAttribute('y', bgY);
    }

    var kpa = (m * 9.81).toFixed(1);
    var psi = (m * 1.42).toFixed(1);
    if (pressureHint) pressureHint.textContent = 'Approx. static head: ~'+kpa+' kPa ('+psi+' PSI) at tank outlet.';
  }
  if (slider){
    slider.addEventListener('input', drawViz);
    drawViz();
  }

  // ===== Price list printing =====
  var printPriceBtn = document.getElementById('printPrice');
  if (printPriceBtn){
    printPriceBtn.addEventListener('click', function(){
      var printEl = document.getElementById('pricePrint');
      if (!printEl) return;
      var w = window.open('', 'print', 'width=800,height=900');
      w.document.write('<html><head><title>Mr Tank Stand — Price List</title></head><body>');
      w.document.write(printEl.innerHTML);
      w.document.write('</body></html>');
      w.document.close();
      w.focus();
      w.print();
      w.close();
    });
  }

  // ===== Lead magnet modal =====
  var leadModal = document.getElementById('leadModal');
  var openLead = document.getElementById('openLead');
  var leadClose = document.getElementById('leadClose');
  var leadWhats = document.getElementById('leadWhats');

  function leadOpen(){ if (leadModal){ leadModal.setAttribute('aria-hidden','false'); } }
  function leadHide(){ if (leadModal){ leadModal.setAttribute('aria-hidden','true'); } }

  if (openLead) openLead.addEventListener('click', function(e){ e.preventDefault(); leadOpen(); });
  if (leadClose) leadClose.addEventListener('click', function(){ leadHide(); });
  if (leadModal) leadModal.addEventListener('click', function(e){ if (e.target===leadModal) leadHide(); });

  if (leadWhats){
    leadWhats.addEventListener('click', function(e){
      e.preventDefault();
      var msg = 'Hi, please send me the Free Water Storage Guide PDF.';
      openWhatsApp(msg, 'Lead Magnet WhatsApp');
      leadHide();
    });
  }

  // ===== (Optional) 360 viewer — enable after assets are added =====
  // Files should be: /assets/360/stand/0001.jpg ... 0036.jpg
  /*
  var spinImg = document.getElementById('spinImg');
  if (spinImg){
    var frames = 36, idx = 1, dragging=false, lastX=0;
    function srcFor(i){ return '/assets/360/stand/' + String(i).padStart(4,'0') + '.jpg'; }
    spinImg.src = srcFor(idx);
    function setByDelta(dx){
      if (Math.abs(dx) < 2) return;
      var step = dx > 0 ? 1 : -1;
      idx += step; if (idx < 1) idx = frames; if (idx > frames) idx = 1;
      spinImg.src = srcFor(idx);
    }
    spinImg.addEventListener('mousedown', function(e){ dragging=true; lastX=e.clientX; });
    window.addEventListener('mouseup', function(){ dragging=false; });
    window.addEventListener('mousemove', function(e){ if (!dragging) return; setByDelta(e.clientX - lastX); lastX=e.clientX; });
    spinImg.addEventListener('touchstart', function(e){ dragging=true; lastX=e.touches[0].clientX; }, {passive:true});
    window.addEventListener('touchend', function(){ dragging=false; }, {passive:true});
    window.addEventListener('touchmove', function(e){ if (!dragging) return; var x=e.touches[0].clientX; setByDelta(x - lastX); lastX=x; }, {passive:true});
  }
  */

  // ===== Stock badge rotation (optional) =====
  var stockBadge = document.getElementById('stockBadge');
  if (stockBadge){
    var notes = [
      'Only 3 × 5000L tanks left this week — reserve now.',
      'New stock arriving Friday — pre-book to secure.',
      'Same-day installs available in Harare today.'
    ];
    var idx = Math.floor((Date.now()/3600000)) % notes.length;
    stockBadge.textContent = notes[idx];
  }
});
// ========= end =========
