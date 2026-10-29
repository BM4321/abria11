// Shared ABRIA content + helpers. Facts marked TODO must be confirmed before launch.
(function () {
  var WA = '255723999039';
  var solutions = [
    {
      id: 'pickup', name: 'AB Pickup', icon: 'ph-package',
      line: 'On-demand pickup scheduling that gets your goods collected on time, every time.',
      lineSw: 'Upangaji wa kuchukua mizigo kwa wakati, kila mara.',
      short: 'Scheduled collection', shortSw: 'Kuchukua mizigo',
      audience: 'Shops, distributors and warehouses that need goods collected on a set day.',
      problemTitle: 'Goods wait because nobody has confirmed the collection.',
      problem: 'A consignment is packed and ready, but the pickup depends on phone calls to a driver who may or may not arrive. Every hour it waits at the gate is an hour lost at the other end.',
      steps: [
        ['Tell us the pickup point', 'Location, contact on site, cargo and the date you want it collected.'],
        ['We confirm the truck', 'ABRIA confirms a suitable vehicle and a collection window before the day.'],
        ['The driver collects', 'Your request moves to Picked up, and the cargo continues as AB Cargo or AB Express.']
      ],
      features: [
        ['Preferred pickup date on every request', 'Set the day you need collection when you request transport.'],
        ['One contact for the collection', 'Pickup location and on-site contact are recorded once, with your request.'],
        ['Status at collection', 'Your ABR reference shows when the cargo has been picked up.']
      ],
      example: 'A distributor packs 40 cartons for Thursday. It requests a pickup on Monday, and ABRIA confirms a box truck and a morning window before Thursday.',
      related: ['cargo', 'express']
    },
    {
      id: 'cargo', name: 'AB Cargo', icon: 'ph-truck',
      line: 'Full cargo transport management for shipments of any size, from parcel to full load.',
      lineSw: 'Usimamizi kamili wa usafirishaji wa mizigo ya ukubwa wowote, kuanzia kifurushi hadi lori zima.',
      short: 'Parcel to full load', shortSw: 'Kifurushi hadi lori zima',
      audience: 'Businesses and cargo owners moving goods by road.',
      problemTitle: 'Moving cargo still runs on phone calls and informal prices.',
      problem: 'Cargo owners call several transporters, compare prices that change between calls, and keep the only record of the job in a chat thread. When something goes wrong, there is nothing to refer back to.',
      steps: [
        ['Describe the cargo', 'Type, weight, dimensions, number of packages, value and route.'],
        ['Receive a written quotation', 'ABRIA reviews the request and sends a quotation before you commit.'],
        ['Approve and book', 'On approval, a vehicle and driver are assigned to your shipment.'],
        ['Delivery and proof', 'The job closes with proof of delivery against your ABR reference.']
      ],
      features: [
        ['Cargo types', 'General, refrigerated, hazardous, fragile and heavy machinery.'],
        ['One reference per shipment', 'Every request gets an ABR ID you can quote in every conversation.'],
        ['Quotation before commitment', 'You see the price in writing and approve it.'],
        ['Proof of delivery', 'Delivery is confirmed and recorded when the job completes.']
      ],
      example: 'A building supplier moves a full load of bagged cement between two depots. It submits one request, approves the quotation, and receives proof of delivery on arrival.',
      related: ['match', 'track']
    },
    {
      id: 'match', name: 'AB Match', icon: 'ph-arrows-left-right',
      line: 'Smart matching that pairs your shipment with the right truck and carrier.',
      lineSw: 'Kuunganisha mzigo wako na lori na msafirishaji sahihi.',
      short: 'Shipment-to-carrier matching', shortSw: 'Kuunganisha mzigo na lori',
      audience: 'Shippers who need the right vehicle, and carriers who want fuller trucks.',
      problemTitle: 'The right truck is often nearby. Nobody knows it is there.',
      problem: 'Cargo owners cannot see which trucks are free, where they are, or what they can carry. Carriers drive back empty because they cannot see the loads waiting on their route. Both sides lose money.',
      steps: [
        ['Carriers register their trucks', 'Truck type, capacity, current location and the routes they cover.'],
        ['You describe the load', 'Cargo type, weight, pickup, delivery and date.'],
        ['ABRIA shortlists carriers', 'Only trucks whose type, capacity and routes fit the load are considered.'],
        ['A verified carrier is assigned', 'You see the company, truck type and registration moving your goods.']
      ],
      features: [
        ['Truck type and capacity', 'Refrigerated cargo is only offered to refrigerated trucks; a 20-tonne load only to trucks that can take it.'],
        ['Location and routes covered', 'Carriers already on or near your route come first.'],
        ['Verified carriers', 'Carriers are reviewed and their vehicle verified before they are assigned work.'],
        ['Transparent assignment', 'The assigned carrier and vehicle registration are shared with you.']
      ],
      example: 'A produce exporter needs chilled transport. AB Match considers only registered refrigerated trucks with the capacity and route, and ABRIA assigns one of them.',
      related: ['cargo', 'business']
    },
    {
      id: 'business', name: 'AB Business', icon: 'ph-buildings',
      line: 'Dedicated logistics solutions for businesses with recurring transport needs.',
      lineSw: 'Suluhisho maalum kwa biashara zenye mahitaji ya usafiri ya kudumu.',
      short: 'Recurring transport', shortSw: 'Usafiri wa kudumu',
      audience: 'Companies that move goods every week or every month on the same routes.',
      problemTitle: 'Recurring shipments get renegotiated every time.',
      problem: 'A business that ships every week still starts from zero: a new transporter, a new price and a new set of calls. Nobody holds the history of what moved, when and at what cost.',
      steps: [
        ['Tell us your routes and volumes', 'The lanes you use, how often and what you move.'],
        ['Agree how we will work', 'ABRIA sets out a plan for your recurring transport.'],
        ['Request as you need', 'Each shipment is a request against your profile.'],
        ['Keep the record', 'Every job is logged by ABR reference for your own reporting.']
      ],
      features: [
        ['Your cargo profile on file', 'Routes, cargo types and handling needs recorded once.'],
        ['Request history', 'Every shipment is held under its own ABR reference.'],
        ['Scheduled transport', 'Plan pickups ahead against known dates.'],
        ['Direct line to ABRIA', 'Speak to the team on WhatsApp, phone or email.']
      ],
      example: 'A manufacturer ships finished goods to three regional customers every fortnight. It agrees the lanes with ABRIA once, then requests each run against the same profile.',
      related: ['cargo', 'pickup']
    },
    {
      id: 'express', name: 'AB Express', icon: 'ph-lightning',
      line: "Priority, time-critical delivery for shipments that can't afford to wait.",
      lineSw: 'Usafirishaji wa haraka kwa mizigo isiyoweza kusubiri.',
      short: 'Time-critical delivery', shortSw: 'Usafiri wa haraka',
      audience: 'Shipments with a hard delivery deadline.',
      problemTitle: 'A missed deadline costs more than the transport.',
      problem: 'Spare parts for a stopped machine, stock for a launch, documents for a tender. When the delivery date is fixed, the cheapest truck is not the right one.',
      steps: [
        ['Set the deadline', 'Enter the required delivery date with your request.'],
        ['Priority review', 'ABRIA reviews time-critical requests first.'],
        ['Carrier confirmed against the date', 'The assigned carrier is confirmed against your deadline before pickup.']
      ],
      features: [
        ['Required delivery date', 'Captured on every request and checked before assignment.'],
        ['Priority handling', 'Time-critical requests are reviewed first.'],
        ['Direct contact', 'Reach the team on WhatsApp while the shipment is moving.']
      ],
      example: 'A mine needs a replacement pump part within 48 hours. The request is flagged time-critical and the carrier is confirmed against the deadline before pickup.',
      related: ['pickup', 'track']
    },
    {
      id: 'track', name: 'AB Track', icon: 'ph-map-pin-line', soon: true,
      line: 'Shipment visibility from pickup to final delivery.',
      lineSw: 'Kufuatilia mzigo kutoka kuchukuliwa hadi kufikishwa.',
      short: 'Shipment visibility', shortSw: 'Kufuatilia mzigo',
      audience: 'Anyone waiting on a shipment moved through ABRIA.',
      problemTitle: '“Where is my cargo?” should not take five phone calls.',
      problem: 'Once a truck leaves, most cargo owners lose sight of their goods until the driver calls. Every update depends on someone remembering to ask.',
      steps: [
        ['Every request gets an ABR ID', 'Your reference is issued the moment you submit a request.'],
        ['Status moves with the shipment', 'Booked, vehicle assigned, picked up, in transit, delivered.'],
        ['Look it up', 'Online tracking by ABR ID is being prepared. Until it launches, send your ID on WhatsApp for an update.']
      ],
      features: [
        ['Status stages', 'From request received to proof of delivery.'],
        ['Assigned vehicle', 'Carrier and truck registration on your shipment.'],
        ['Last updated', 'When the status last changed.']
      ],
      example: 'A retailer receives its ABR ID on submitting a request. When online tracking launches, it will enter that ID to see the current stage; today it sends the ID on WhatsApp.',
      related: ['cargo', 'match']
    }
  ];
  solutions.forEach(function (s, i) {
    s.n = String(i + 1).padStart(2, '0');
    s.href = 'Solution.dc.html?p=' + s.id;
    s.iconClass = 'ph-duotone ' + s.icon;
  });
  var pages = {
    home: 'Home.dc.html', solutions: 'Solutions.dc.html', how: 'How%20It%20Works.dc.html',
    tech: 'How%20It%20Works.dc.html#technology', shippers: 'For%20Shippers.dc.html',
    carriers: 'For%20Carriers.dc.html', about: 'About.dc.html', contact: 'Contact.dc.html',
    faq: 'Contact.dc.html#faq', quote: 'Request%20Quote.dc.html', truck: 'Register%20Truck.dc.html',
    track: 'Track%20Shipment.dc.html', notfound: 'Not%20Found.dc.html'
  };
  function getLang() { try { return localStorage.getItem('abria-lang') || 'en'; } catch (e) { return 'en'; } }
  function setLang(l) {
    try { localStorage.setItem('abria-lang', l); } catch (e) {}
    window.dispatchEvent(new CustomEvent('abria-lang', { detail: l }));
  }
  function wa(text) { return 'https://wa.me/' + WA + (text ? '?text=' + encodeURIComponent(text) : ''); }
  function sol(id) { return solutions.filter(function (s) { return s.id === id; })[0]; }
  // Analytics hook — wire to the real provider later. Event names match the brief.
  function track(name, data) { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, data || {})); }
  // Form kit: field defs -> template-ready rows, plus bilingual validation.
  // Mirrors server-side rules in /api/requests and /api/partners; the server stays authoritative.
  var MSG = {
    required: ['This field is required.', 'Sehemu hii inahitajika.'],
    phone: ['Enter a phone number, e.g. +255 7XX XXX XXX.', 'Weka namba ya simu, mfano +255 7XX XXX XXX.'],
    email: ['Enter a valid email address.', 'Weka barua pepe sahihi.'],
    number: ['Enter a number greater than zero.', 'Weka namba kubwa kuliko sifuri.'],
    past: ['Choose today or a later date.', 'Chagua leo au tarehe ijayo.'],
    order: ['Must be on or after the pickup date.', 'Lazima iwe siku ya kuchukua mzigo au baadaye.']
  };
  function validate(defs, form, sw) {
    var e = {}, i = sw ? 1 : 0, today = new Date().toISOString().slice(0, 10);
    defs.forEach(function (d) {
      var v = (form[d.key] || '').toString().trim();
      if (d.required && !v) { e[d.key] = MSG.required[i]; return; }
      if (!v) return;
      if (d.kind === 'tel' && !/^\+?[0-9][0-9\s-]{8,16}$/.test(v)) e[d.key] = MSG.phone[i];
      if (d.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) e[d.key] = MSG.email[i];
      if (d.kind === 'number' && !(parseFloat(v) > 0)) e[d.key] = MSG.number[i];
      if (d.kind === 'date' && d.future && v < today) e[d.key] = MSG.past[i];
      if (d.after && form[d.after] && v < form[d.after]) e[d.key] = MSG.order[i];
    });
    return e;
  }
  function fields(defs, form, errors, sw, onField, devNotes) {
    return defs.map(function (d) {
      var err = errors[d.key];
      return {
        key: d.key, id: 'f-' + d.key, errId: 'f-' + d.key + '-err',
        label: sw && d.sw ? d.sw : d.en, req: !!d.required,
        ph: sw && d.phSw ? d.phSw : (d.ph || ''),
        isInput: ['text', 'tel', 'email', 'number', 'date'].indexOf(d.kind) > -1,
        isSelect: d.kind === 'select', isArea: d.kind === 'textarea',
        type: d.kind, inputMode: d.kind === 'tel' ? 'tel' : d.kind === 'number' ? 'decimal' : undefined,
        autoComplete: d.auto, value: form[d.key] || '',
        options: (d.options || []).map(function (o) { return { v: o[0], label: sw && o[1] ? o[1] : o[0] }; }),
        onChange: function (ev) { onField(d.key, ev.target.value); },
        error: err || '', hasError: !!err, invalid: err ? 'true' : 'false', described: err ? 'f-' + d.key + '-err' : undefined,
        span: d.full ? '1 / -1' : 'auto',
        border: err ? 'var(--color-accent-2)' : 'var(--color-divider)',
        dev: !!(devNotes && d.dev), devText: d.dev || ''
      };
    });
  }
  // ── Motion: first-visit truck loader, scroll reveals, rail truck. All via WAAPI (survives re-renders).
  function motionOK() { return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  // ── Theme: light/dark tokens + circular view-transition reveal.
  var THEME_CSS =
    'html[data-theme="dark"]{color-scheme:dark;--color-bg:#141312;--color-surface:#211f1e;--color-text:#ecebe9;--color-divider:color-mix(in srgb,#ecebe9 18%,transparent);' +
    '--color-accent:#38a6cf;--color-accent-2:#ff458e;' +
    '--color-neutral-100:#2d2b2b;--color-neutral-200:#444141;--color-neutral-300:#605d5d;--color-neutral-400:#7d7979;--color-neutral-500:#9b9797;--color-neutral-600:#bab6b6;--color-neutral-700:#d7d3d3;--color-neutral-800:#eae7e7;--color-neutral-900:#f8f4f4;' +
    '--color-accent-100:#0a303e;--color-accent-200:#004961;--color-accent-300:#006786;--color-accent-400:#1186ac;--color-accent-500:#38a6cf;--color-accent-600:#62c5ee;--color-accent-700:#99e0ff;--color-accent-800:#cbeeff;--color-accent-900:#e9f8ff;' +
    '--color-accent-2-100:#4b1528;--color-accent-2-200:#790e3d;--color-accent-2-300:#aa0b56;--color-accent-2-400:#d82071;--color-accent-2-500:#ff458e;--color-accent-2-600:#ff90b1;--color-accent-2-700:#ffc0d0;--color-accent-2-800:#ffdee6;--color-accent-2-900:#fff1f4;' +
    '--shadow-sm:0 1px 2px rgba(0,0,0,.45);--shadow-md:0 4px 14px rgba(0,0,0,.5);--shadow-lg:0 14px 36px rgba(0,0,0,.6)}' +
    'html[data-theme="dark"] body{background:var(--color-bg);color:var(--color-text)}' +
    'html[data-theme="dark"] .cmyk-head .plate,html[data-theme="dark"] .cmyk-num .plate{display:none}' +
    'html[data-theme="dark"] .cmyk-head .paper,html[data-theme="dark"] .cmyk-num .paper{color:var(--color-text);text-shadow:none}' +
    'html[data-theme="dark"] .cmyk-num{background:transparent}' +
    'html[data-theme="dark"] .cmyk .print{filter:none!important}html[data-theme="dark"] .cmyk::after{opacity:.35}' +
    'html.abria-fade *,html.abria-fade *::before,html.abria-fade *::after{transition:background-color .45s ease,color .45s ease,border-color .45s ease,box-shadow .45s ease!important}' +
    '::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}::view-transition-old(root){z-index:1}::view-transition-new(root){z-index:2}';
  function getTheme() {
    try { var t = localStorage.getItem('abria-theme'); if (t) return t; } catch (e) {}
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('abria-theme', t); } catch (e) {}
    window.dispatchEvent(new CustomEvent('abria-theme', { detail: t }));
  }
  function toggleTheme(ev) {
    var next = getTheme() === 'dark' ? 'light' : 'dark';
    var x = ev && ev.clientX ? ev.clientX : window.innerWidth - 40, y = ev && ev.clientY ? ev.clientY : 36;
    if (!motionOK()) return applyTheme(next);
    if (!document.startViewTransition) {
      var h = document.documentElement; h.classList.add('abria-fade'); applyTheme(next);
      return setTimeout(function () { h.classList.remove('abria-fade'); }, 500);
    }
    var r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    var vt = document.startViewTransition(function () { applyTheme(next); });
    vt.ready.then(function () {
      document.documentElement.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  }
  (function initTheme() {
    if (document.getElementById('abria-theme-css')) return;
    var s = document.createElement('style'); s.id = 'abria-theme-css'; s.textContent = THEME_CSS;
    document.head.appendChild(s);
    document.documentElement.setAttribute('data-theme', getTheme());
  })();
  var TRUCK = '<svg viewBox="0 0 64 40" width="64" height="40" style="fill:none;stroke:var(--color-text)" stroke-width="2.2" stroke-linejoin="round"><g data-body><rect x="2" y="6" width="36" height="22" rx="3" style="fill:var(--color-accent-200)"/><path d="M38 13h12l9 9v6H38z" style="fill:var(--color-accent)" fill-opacity=".85"/><path d="M42 16h6l5 6h-11z" style="fill:var(--color-bg)"/></g><g data-w><circle cx="13" cy="31" r="5" style="fill:var(--color-bg)"/><path d="M13 27v8M9 31h8" stroke-width="1.6"/></g><g data-w><circle cx="49" cy="31" r="5" style="fill:var(--color-bg)"/><path d="M49 27v8M45 31h8" stroke-width="1.6"/></g></svg>';
  function loader() {
    if (!motionOK()) return;
    var force = /[?&]loader\b/.test(location.search);
    try { if (!force && sessionStorage.getItem('abria-loaded')) return; sessionStorage.setItem('abria-loaded', '1'); } catch (e) {}
    var el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;inset:0;z-index:1000;background:var(--color-bg);display:grid;place-items:center';
    el.innerHTML = '<div style="width:min(340px,72vw)"><div style="font:600 30px/1 Roboto,system-ui,sans-serif;letter-spacing:.08em;color:var(--color-text)">ABRIA</div>' +
      '<div style="font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:color-mix(in srgb,var(--color-text) 70%,transparent);margin:8px 0 36px">Connected Logistics</div>' +
      '<div data-lane style="position:relative;height:46px"><div data-truck style="position:absolute;left:0;bottom:4px">' + TRUCK + '</div>' +
      '<div data-road style="position:absolute;left:0;right:0;bottom:0;height:3px;border-radius:3px;background:repeating-linear-gradient(90deg,var(--color-text) 0 16px,transparent 16px 28px)"></div></div></div>';
    document.body.appendChild(el);
    var lane = el.querySelector('[data-lane]'), truck = el.querySelector('[data-truck]');
    var dist = lane.getBoundingClientRect().width - 64;
    truck.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(' + dist + 'px)' }], { duration: 1500, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' });
    el.querySelector('[data-body]').animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-1.2px)' }, { transform: 'translateY(0)' }], { duration: 260, iterations: Infinity });
    el.querySelectorAll('[data-w]').forEach(function (w) { w.style.transformBox = 'fill-box'; w.style.transformOrigin = 'center'; w.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 420, iterations: Infinity }); });
    el.querySelector('[data-road]').animate([{ backgroundPosition: '0 0' }, { backgroundPosition: '-56px 0' }], { duration: 500, iterations: Infinity });
    setTimeout(function () {
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease', fill: 'forwards' }).onfinish = function () { el.remove(); };
    }, 1650);
  }
  function reveal() {
    if (!motionOK() || !('IntersectionObserver' in window)) return;
    var seen = new WeakSet();
    var ease = 'cubic-bezier(.2,.7,.2,1)';
    function run(t) {
      if (t.hasAttribute('data-drive')) {
        t.animate([{ left: '0px' }, { left: 'calc(100% - 40px)' }], { duration: 2600, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
        t.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-1px)' }, { transform: 'translateY(0)' }], { duration: 240, iterations: 10 });
        return true;
      }
      var kids = t.hasAttribute('data-stagger') ? Array.prototype.slice.call(t.children) : [t];
      if (!kids.length) return false;
      kids.forEach(function (k, i) {
        k.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 640, delay: Math.min(i, 8) * 90, easing: ease, fill: 'backwards' });
      });
      return true;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && run(e.target)) io.unobserve(e.target); });
    }, { rootMargin: '0px 0px -8% 0px' });
    function scan() {
      document.querySelectorAll('[data-reveal],[data-stagger],[data-drive]').forEach(function (t) {
        if (seen.has(t)) return; seen.add(t); io.observe(t);
      });
    }
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  }
  // Material-style ink ripple on buttons and [data-ripple] surfaces.
  function ripple() {
    document.addEventListener('pointerdown', function (e) {
      if (!motionOK() || e.button !== 0) return;
      var t = e.target.closest && e.target.closest('.btn, [data-ripple]');
      if (!t || t.disabled) return;
      var r = t.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2;
      if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
      t.style.overflow = 'hidden';
      var s = document.createElement('span');
      var dark = /btn-primary/.test(t.className) || t.hasAttribute('data-ripple-light');
      s.style.cssText = 'position:absolute;pointer-events:none;border-radius:50%;width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px;background:' + (dark || getComputedStyle(t).backgroundColor === 'rgb(0, 136, 176)' ? 'rgba(255,255,255,.35)' : 'rgba(0,136,176,.18)');
      t.appendChild(s);
      var a = s.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }], { duration: 560, easing: 'cubic-bezier(.2,.6,.3,1)' });
      a.onfinish = function () { s.remove(); };
    }, { passive: true });
  }
  function boot() {
    if (motionOK()) document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.style.scrollPaddingTop = '88px';
    loader(); reveal(); ripple();
  }
  if (!window.__abriaMotion) {
    window.__abriaMotion = true;
    if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
  }
  window.ABRIA = {
    validate: validate, fields: fields, getTheme: getTheme, toggleTheme: toggleTheme,
    solutions: solutions, sol: sol, pages: pages, getLang: getLang, setLang: setLang, wa: wa, track: track,
    phone: '+255 723 999 039', phoneHref: 'tel:+255723999039', email: 'info@abrialogistics.co.tz'
  };
})();
