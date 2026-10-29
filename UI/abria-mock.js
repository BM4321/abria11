// ABRIA console — MOCK DATA + shared UI helpers.
// Everything under `DATA` is fictional and shaped like the future API responses
// (see prisma schema: Request, Quotation, Partner, OpsUser). Swap `DATA` for fetch() calls later.
(function () {
  if (window.ABRIA_M) return;
  var TODAY = '2026-09-25';
  var R = {
    dash: 'Dashboard.dc.html', requests: 'Requests.dc.html', quotes: 'Quotes.dc.html', shipments: 'Shipments.dc.html',
    deliveries: 'Deliveries.dc.html', customers: 'Customers.dc.html', carriers: 'Carriers.dc.html', trucks: 'Trucks.dc.html',
    reports: 'Reports.dc.html', notifications: 'Notifications.dc.html',
    admin: 'Admin.dc.html', homepage: 'Admin%20Homepage.dc.html', website: 'Admin%20Website.dc.html', media: 'Admin%20Media.dc.html',
    forms: 'Admin%20Forms.dc.html', users: 'Admin%20Users.dc.html', settings: 'Admin%20Settings.dc.html', audit: 'Audit%20Logs.dc.html',
    signin: 'Sign%20In.dc.html', site: 'Home.dc.html'
  };
  function link(k, q) {
    var s = R[k] || k;
    if (!q) return s;
    return s + '?' + Object.keys(q).map(function (a) { return a + '=' + encodeURIComponent(q[a]); }).join('&');
  }
  function param(n) { try { return new URLSearchParams(location.search).get(n); } catch (e) { return null; } }

  // ── Status system: one tone per status, used by every badge in the console.
  var TONES = {
    info: { bg: 'color-mix(in srgb,var(--color-accent) 14%,transparent)', fg: 'var(--color-accent-800)', dot: 'var(--color-accent)' },
    warn: { bg: 'color-mix(in srgb,var(--color-process-yellow) 24%,transparent)', fg: 'color-mix(in srgb,var(--color-process-yellow) 32%,var(--color-text))', dot: 'var(--color-process-yellow)' },
    ok: { bg: 'color-mix(in srgb,oklch(0.62 0.13 155) 16%,transparent)', fg: 'color-mix(in srgb,oklch(0.55 0.13 155) 55%,var(--color-text))', dot: 'oklch(0.62 0.13 155)' },
    bad: { bg: 'color-mix(in srgb,var(--color-accent-2) 13%,transparent)', fg: 'var(--color-accent-2-800)', dot: 'var(--color-accent-2)' },
    muted: { bg: 'color-mix(in srgb,var(--color-text) 8%,transparent)', fg: 'color-mix(in srgb,var(--color-text) 75%,transparent)', dot: 'color-mix(in srgb,var(--color-text) 45%,transparent)' }
  };
  var ST = {
    'New': 'info', 'Reviewing': 'warn', 'Quoted': 'info', 'Confirmed': 'ok', 'Rejected': 'bad',
    'Draft': 'muted', 'Sent': 'info', 'Accepted': 'ok', 'Expired': 'bad', 'Cancelled': 'bad',
    'Assigned': 'info', 'Picked Up': 'info', 'In Transit': 'warn', 'Out for Delivery': 'warn', 'Delivered': 'ok', 'Delayed': 'bad', 'Scheduled': 'muted',
    'Active': 'ok', 'Inactive': 'muted', 'Pending Verification': 'warn', 'Pending': 'warn', 'Verified': 'ok', 'Suspended': 'bad',
    'Available': 'ok', 'Maintenance': 'warn', 'Published': 'ok', 'Unpublished': 'muted', 'Archived': 'muted',
    'Open': 'info', 'In Review': 'warn', 'Closed': 'muted', 'Invited': 'info', 'Disabled': 'bad', 'Connected': 'ok', 'Not connected': 'muted', 'Error': 'bad'
  };
  function badge(label) { var t = TONES[ST[label] || 'muted']; return { label: label, bg: t.bg, fg: t.fg, dot: t.dot }; }

  // ── Formatters
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function d(iso) { if (!iso) return '—'; var p = iso.slice(0, 10).split('-'); return +p[2] + ' ' + MON[+p[1] - 1] + ' ' + p[0]; }
  function dShort(iso) { if (!iso) return '—'; var p = iso.slice(0, 10).split('-'); return +p[2] + ' ' + MON[+p[1] - 1]; }
  function time(iso) { return iso && iso.length > 10 ? iso.slice(11, 16) : ''; }
  function rel(iso) {
    if (!iso) return '—';
    var day = iso.slice(0, 10);
    if (day === TODAY) return 'Today' + (time(iso) ? ', ' + time(iso) : '');
    var diff = Math.round((Date.parse(TODAY) - Date.parse(day)) / 864e5);
    if (diff === 1) return 'Yesterday';
    if (diff > 1 && diff < 7) return diff + ' days ago';
    return dShort(iso);
  }
  function tzs(n) { return 'TZS ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function kg(n) { return n >= 1000 ? (n / 1000).toFixed(n % 1000 ? 1 : 0) + ' t' : n + ' kg'; }
  function daysFrom(iso) { return Math.round((Date.parse(iso.slice(0, 10)) - Date.parse(TODAY)) / 864e5); }

  // ── DATA (mock)
  var customers = [
    { id: 'CUS-201', name: 'Neema Mushi', company: 'Kilimo Fresh Ltd', phone: '+255 754 210 118', email: 'neema@kilimofresh.example', region: 'Arusha', since: '2026-02-11', last: '2026-09-25T08:31', status: 'Active', tin: '112-448-903' },
    { id: 'CUS-202', name: 'Baraka Mwakyusa', company: 'Mbeya Hardware Supplies', phone: '+255 767 441 902', email: 'baraka@mbeyahardware.example', region: 'Mbeya', since: '2026-03-02', last: '2026-09-24T16:10', status: 'Active', tin: '118-203-551' },
    { id: 'CUS-203', name: 'Aisha Salim', company: 'Pwani Textiles', phone: '+255 715 330 674', email: 'aisha@pwanitextiles.example', region: 'Dar es Salaam', since: '2026-01-19', last: '2026-09-23T09:20', status: 'Active', tin: '109-774-120' },
    { id: 'CUS-204', name: 'Joseph Kimaro', company: 'Kaskazini Builders', phone: '+255 688 902 315', email: 'joseph@kaskazini.example', region: 'Moshi', since: '2026-04-08', last: '2026-09-24T18:02', status: 'Active', tin: '121-056-337' },
    { id: 'CUS-205', name: 'Hamisi Juma', company: 'Dodoma Cement Distributors', phone: '+255 784 117 560', email: 'hamisi@dodomacement.example', region: 'Dodoma', since: '2026-05-14', last: '2026-09-25T07:52', status: 'Active', tin: '125-880-914' },
    { id: 'CUS-206', name: 'Rehema Massawe', company: 'Lake Zone Retail', phone: '+255 622 845 031', email: 'rehema@lakezone.example', region: 'Mwanza', since: '2026-02-27', last: '2026-09-25T06:58', status: 'Active', tin: '115-332-608' },
    { id: 'CUS-207', name: 'Emmanuel Temba', company: 'Temba Pharma Distributors', phone: '+255 713 559 208', email: 'emmanuel@tembapharma.example', region: 'Dar es Salaam', since: '2026-06-03', last: '2026-08-29T10:05', status: 'Inactive', tin: '130-219-475' },
    { id: 'CUS-208', name: 'Grace Mollel', company: 'Meru Coffee Traders', phone: '+255 756 670 443', email: 'grace@merucoffee.example', region: 'Arusha', since: '2026-07-21', last: '2026-09-22T14:30', status: 'Active', tin: '133-667-012' }
  ];
  var carriers = [
    { id: 'CAR-301', name: 'Said Mfinanga', company: 'Mfinanga Transporters', phone: '+255 754 880 102', email: 'said@mfinanga.example', location: 'Dar es Salaam', routes: 'Dar es Salaam – Arusha, Tanga, Dodoma', joined: '2026-01-10', status: 'Verified', completed: 34 },
    { id: 'CAR-302', name: 'Peter Lyimo', company: 'Lyimo Haulage', phone: '+255 768 214 559', email: 'peter@lyimohaulage.example', location: 'Arusha', routes: 'Arusha – Dar es Salaam, Dodoma', joined: '2026-01-22', status: 'Verified', completed: 27 },
    { id: 'CAR-303', name: 'Fatuma Ally', company: 'Pwani Freight Services', phone: '+255 715 602 877', email: 'fatuma@pwanifreight.example', location: 'Dar es Salaam', routes: 'Dar es Salaam – Arusha, Morogoro, Dodoma', joined: '2026-02-05', status: 'Verified', completed: 41 },
    { id: 'CAR-304', name: 'Daudi Mrema', company: 'Northern Link Trucks', phone: '+255 689 330 214', email: 'daudi@northernlink.example', location: 'Moshi', routes: 'Moshi – Tanga, Dar es Salaam', joined: '2026-03-14', status: 'Verified', completed: 19 },
    { id: 'CAR-305', name: 'Musa Kassim', company: 'Kassim & Sons Transport', phone: '+255 745 118 903', email: 'musa@kassimsons.example', location: 'Mwanza', routes: 'Mwanza – Shinyanga, Dar es Salaam', joined: '2026-09-24', status: 'Pending Verification', completed: 0 },
    { id: 'CAR-306', name: 'Anna Shirima', company: 'Shirima Logistics', phone: '+255 757 442 610', email: 'anna@shirimalogistics.example', location: 'Mbeya', routes: 'Mbeya – Iringa, Dar es Salaam', joined: '2026-04-02', status: 'Verified', completed: 22 },
    { id: 'CAR-307', name: 'Yusuf Omary', company: 'Kilwa Road Carriers', phone: '+255 716 905 332', email: 'yusuf@kilwaroad.example', location: 'Lindi', routes: 'Lindi – Mtwara, Dar es Salaam', joined: '2026-09-25', status: 'Pending Verification', completed: 0 },
    { id: 'CAR-308', name: 'John Mapunda', company: 'Southern Highlands Haulage', phone: '+255 623 771 045', email: 'john@shhaulage.example', location: 'Iringa', routes: 'Iringa – Mbeya, Dodoma', joined: '2026-02-18', status: 'Suspended', completed: 12 },
    { id: 'CAR-309', name: 'Salma Rashidi', company: 'Rashidi Movers', phone: '+255 784 560 218', email: 'salma@rashidimovers.example', location: 'Morogoro', routes: 'Morogoro – Dar es Salaam', joined: '2026-05-30', status: 'Inactive', completed: 6 }
  ];
  var trucks = [
    { reg: 'T 482 DKL', type: 'Curtainsider', cap: '28 t', owner: 'CAR-301', region: 'Dar es Salaam', status: 'Assigned', ver: 'Verified', make: 'Scania R460' },
    { reg: 'T 219 DMB', type: 'Flatbed', cap: '30 t', owner: 'CAR-301', region: 'Dar es Salaam', status: 'Available', ver: 'Verified', make: 'Howo A7' },
    { reg: 'T 733 DGH', type: 'Refrigerated', cap: '12 t', owner: 'CAR-302', region: 'Arusha', status: 'Available', ver: 'Verified', make: 'Isuzu FVZ' },
    { reg: 'T 105 DJX', type: 'Box Truck', cap: '8 t', owner: 'CAR-303', region: 'Dar es Salaam', status: 'Assigned', ver: 'Verified', make: 'Isuzu FVR' },
    { reg: 'T 846 DKA', type: 'Tipper', cap: '20 t', owner: 'CAR-303', region: 'Morogoro', status: 'Maintenance', ver: 'Verified', make: 'Shacman F3000' },
    { reg: 'T 391 DHF', type: 'Container Truck', cap: '32 t', owner: 'CAR-304', region: 'Moshi', status: 'Assigned', ver: 'Verified', make: 'Mercedes Actros' },
    { reg: 'T 658 DLC', type: 'Flatbed', cap: '30 t', owner: 'CAR-305', region: 'Mwanza', status: 'Pending', ver: 'Pending', make: 'FAW J6' },
    { reg: 'T 512 DKT', type: 'Lowbed', cap: '40 t', owner: 'CAR-306', region: 'Mbeya', status: 'Available', ver: 'Verified', make: 'Volvo FH16' },
    { reg: 'T 927 DMR', type: 'Curtainsider', cap: '28 t', owner: 'CAR-306', region: 'Iringa', status: 'Assigned', ver: 'Verified', make: 'Scania G410' },
    { reg: 'T 074 DNB', type: 'Box Truck', cap: '10 t', owner: 'CAR-307', region: 'Lindi', status: 'Pending', ver: 'Pending', make: 'Mitsubishi Fuso' },
    { reg: 'T 363 DGW', type: 'Tipper', cap: '18 t', owner: 'CAR-308', region: 'Iringa', status: 'Inactive', ver: 'Verified', make: 'Howo' },
    { reg: 'T 590 DJQ', type: 'Refrigerated', cap: '10 t', owner: 'CAR-302', region: 'Arusha', status: 'Assigned', ver: 'Verified', make: 'Isuzu FVR' }
  ];
  var requests = [
    { id: 'REQ-1042', cust: 'CUS-201', pickup: 'Dar es Salaam Port', dest: 'Arusha', cargo: 'Refrigerated', desc: 'Chilled dairy on pallets', weight: 9800, qty: 18, truck: 'Refrigerated', date: '2026-09-28', deadline: '2026-09-30', status: 'New', created: '2026-09-25T08:31', notes: 'Keep between 2–8 °C. Forklift available at delivery.' },
    { id: 'REQ-1041', cust: 'CUS-205', pickup: 'Dar es Salaam', dest: 'Dodoma', cargo: 'General Cargo', desc: 'Bagged cement, 50 kg bags', weight: 28000, qty: 560, truck: 'Curtainsider', date: '2026-09-27', deadline: '2026-09-29', status: 'Reviewing', created: '2026-09-25T07:52' },
    { id: 'REQ-1040', cust: 'CUS-202', pickup: 'Dar es Salaam', dest: 'Mbeya', cargo: 'General Cargo', desc: 'Roofing sheets and fittings', weight: 14500, qty: 120, truck: 'Flatbed', date: '2026-09-26', deadline: '2026-09-29', status: 'Quoted', created: '2026-09-24T16:10' },
    { id: 'REQ-1039', cust: 'CUS-206', pickup: 'Dar es Salaam', dest: 'Mwanza', cargo: 'General Cargo', desc: 'Packaged household goods', weight: 12000, qty: 340, truck: 'Box Truck', date: '2026-09-26', deadline: '2026-09-30', status: 'Quoted', created: '2026-09-24T11:45' },
    { id: 'REQ-1038', cust: 'CUS-203', pickup: 'Dar es Salaam', dest: 'Arusha', cargo: 'Fragile', desc: 'Textile machinery parts', weight: 4200, qty: 14, truck: 'Box Truck', date: '2026-09-23', deadline: '2026-09-27', status: 'Confirmed', created: '2026-09-22T09:20' },
    { id: 'REQ-1037', cust: 'CUS-204', pickup: 'Moshi', dest: 'Dar es Salaam', cargo: 'Heavy Machinery', desc: 'Concrete mixer on skid', weight: 22000, qty: 1, truck: 'Lowbed', date: '2026-09-29', deadline: '2026-10-02', status: 'New', created: '2026-09-24T18:02' },
    { id: 'REQ-1036', cust: 'CUS-208', pickup: 'Arusha', dest: 'Dar es Salaam Port', cargo: 'General Cargo', desc: 'Green coffee in jute bags', weight: 19000, qty: 316, truck: 'Container Truck', date: '2026-09-23', deadline: '2026-09-25', status: 'Confirmed', created: '2026-09-22T14:30' },
    { id: 'REQ-1035', cust: 'CUS-207', pickup: 'Dar es Salaam', dest: 'Dodoma', cargo: 'Fragile', desc: 'Medical supplies', weight: 2100, qty: 60, truck: 'Box Truck', date: '2026-09-23', deadline: '2026-09-24', status: 'Rejected', created: '2026-09-21T10:05', notes: 'Cold-chain certified vehicle not available on the requested date.' },
    { id: 'REQ-1034', cust: 'CUS-201', pickup: 'Arusha', dest: 'Dar es Salaam', cargo: 'Refrigerated', desc: 'Fresh vegetables in crates', weight: 8500, qty: 210, truck: 'Refrigerated', date: '2026-09-21', deadline: '2026-09-22', status: 'Confirmed', created: '2026-09-20T07:40' },
    { id: 'REQ-1033', cust: 'CUS-202', pickup: 'Dar es Salaam', dest: 'Mbeya', cargo: 'General Cargo', desc: 'Steel reinforcement bars', weight: 26000, qty: 400, truck: 'Curtainsider', date: '2026-09-21', deadline: '2026-09-24', status: 'Confirmed', created: '2026-09-19T13:15' },
    { id: 'REQ-1032', cust: 'CUS-206', pickup: 'Mwanza', dest: 'Shinyanga', cargo: 'General Cargo', desc: 'Beverage crates', weight: 10000, qty: 800, truck: 'Box Truck', date: '2026-09-30', deadline: '2026-10-01', status: 'New', created: '2026-09-25T06:58' },
    { id: 'REQ-1031', cust: 'CUS-205', pickup: 'Tanga', dest: 'Dodoma', cargo: 'General Cargo', desc: 'Bagged cement', weight: 28000, qty: 560, truck: 'Curtainsider', date: '2026-09-20', deadline: '2026-09-23', status: 'Confirmed', created: '2026-09-18T09:00' },
    { id: 'REQ-1030', cust: 'CUS-203', pickup: 'Dar es Salaam', dest: 'Morogoro', cargo: 'General Cargo', desc: 'Fabric rolls', weight: 6000, qty: 150, truck: 'Box Truck', date: '2026-09-26', deadline: '2026-09-27', status: 'Reviewing', created: '2026-09-23T15:22' },
    { id: 'REQ-1029', cust: 'CUS-204', pickup: 'Arusha', dest: 'Moshi', cargo: 'General Cargo', desc: 'Building blocks', weight: 18000, qty: 1200, truck: 'Flatbed', date: '2026-09-27', deadline: '2026-09-28', status: 'New', created: '2026-09-23T11:02' },
    { id: 'REQ-1028', cust: 'CUS-208', pickup: 'Arusha', dest: 'Dar es Salaam Port', cargo: 'General Cargo', desc: 'Green coffee in jute bags', weight: 19000, qty: 316, truck: 'Container Truck', date: '2026-10-01', deadline: '2026-10-03', status: 'New', created: '2026-09-22T17:48' },
    { id: 'REQ-1027', cust: 'CUS-203', pickup: 'Dar es Salaam', dest: 'Dodoma', cargo: 'General Cargo', desc: 'Packaged textiles', weight: 7000, qty: 90, truck: 'Box Truck', date: '2026-09-18', deadline: '2026-09-20', status: 'Confirmed', created: '2026-09-15T10:30' }
  ];
  function qLines(total, route, truck) {
    var f = Math.round(total * 0.84 / 1000) * 1000, l = Math.round(total * 0.09 / 1000) * 1000;
    return [{ d: 'Road freight, ' + route + ' (' + truck + ')', a: f }, { d: 'Loading, securing and offloading', a: l }, { d: 'Fuel adjustment', a: total - f - l }];
  }
  var quotes = [
    { id: 'QTE-3025', req: 'REQ-1039', amount: 5600000, created: '2026-09-24', valid: '2026-09-25', status: 'Sent' },
    { id: 'QTE-3024', req: 'REQ-1040', amount: 4850000, created: '2026-09-24', valid: '2026-09-25', status: 'Sent' },
    { id: 'QTE-3023', req: 'REQ-1041', amount: 7900000, created: '2026-09-25', valid: '2026-09-28', status: 'Draft' },
    { id: 'QTE-3022', req: 'REQ-1030', amount: 1250000, created: '2026-09-24', valid: '2026-09-27', status: 'Draft' },
    { id: 'QTE-3021', req: 'REQ-1038', amount: 2750000, created: '2026-09-22', valid: '2026-09-25', status: 'Accepted' },
    { id: 'QTE-3020', req: 'REQ-1036', amount: 3400000, created: '2026-09-22', valid: '2026-09-25', status: 'Accepted' },
    { id: 'QTE-3019', req: 'REQ-1035', amount: 1650000, created: '2026-09-21', valid: '2026-09-22', status: 'Rejected' },
    { id: 'QTE-3018', req: 'REQ-1034', amount: 2900000, created: '2026-09-20', valid: '2026-09-23', status: 'Accepted' },
    { id: 'QTE-3017', req: 'REQ-1033', amount: 6700000, created: '2026-09-19', valid: '2026-09-22', status: 'Accepted' },
    { id: 'QTE-3016', req: 'REQ-1031', amount: 6100000, created: '2026-09-18', valid: '2026-09-21', status: 'Accepted' },
    { id: 'QTE-3015', req: 'REQ-1027', amount: 1900000, created: '2026-09-15', valid: '2026-09-18', status: 'Expired' }
  ];
  var STAGES = ['Request Created', 'Quote Accepted', 'Carrier Assigned', 'Pickup Completed', 'In Transit', 'Out for Delivery', 'Delivered'];
  var STAGE_OF = { 'Assigned': 2, 'Picked Up': 3, 'In Transit': 4, 'Out for Delivery': 5, 'Delivered': 6 };
  var shipments = [
    { id: 'SHP-2048', req: 'REQ-1038', cust: 'CUS-203', cargo: 'Textile machinery parts', weight: 4200, qty: 14, pickup: 'Dar es Salaam', dest: 'Arusha', carrier: 'CAR-303', truck: 'T 105 DJX', driver: 'Ramadhani Ngowi', driverPhone: '+255 713 204 881', status: 'In Transit', eta: '2026-09-26', created: '2026-09-23', progress: 0.58 },
    { id: 'SHP-2047', req: 'REQ-1036', cust: 'CUS-208', cargo: 'Green coffee, 316 bags', weight: 19000, qty: 316, pickup: 'Arusha', dest: 'Dar es Salaam Port', carrier: 'CAR-304', truck: 'T 391 DHF', driver: 'Elia Swai', driverPhone: '+255 757 118 342', status: 'Out for Delivery', eta: '2026-09-25', created: '2026-09-23', progress: 0.92 },
    { id: 'SHP-2046', req: 'REQ-1034', cust: 'CUS-201', cargo: 'Fresh vegetables in crates', weight: 8500, qty: 210, pickup: 'Arusha', dest: 'Dar es Salaam', carrier: 'CAR-302', truck: 'T 733 DGH', driver: 'Gabriel Massawe', driverPhone: '+255 768 553 120', status: 'Delivered', eta: '2026-09-22', delivered: '2026-09-22', created: '2026-09-21', progress: 1 },
    { id: 'SHP-2045', req: 'REQ-1033', cust: 'CUS-202', cargo: 'Steel reinforcement bars', weight: 26000, qty: 400, pickup: 'Dar es Salaam', dest: 'Mbeya', carrier: 'CAR-306', truck: 'T 927 DMR', driver: 'Frank Mwalongo', driverPhone: '+255 622 004 917', status: 'In Transit', eta: '2026-09-24', created: '2026-09-21', progress: 0.71, delayed: true, delayNote: 'Weighbridge queue at Makambako' },
    { id: 'SHP-2044', req: 'REQ-1031', cust: 'CUS-205', cargo: 'Bagged cement, 560 bags', weight: 28000, qty: 560, pickup: 'Tanga', dest: 'Dodoma', carrier: 'CAR-301', truck: 'T 482 DKL', driver: 'Idd Mohamed', driverPhone: '+255 754 671 200', status: 'In Transit', eta: '2026-09-23', created: '2026-09-20', progress: 0.83, delayed: true, delayNote: 'Mechanical stop near Handeni, resolved' },
    { id: 'SHP-2043', req: 'REQ-1027', cust: 'CUS-203', cargo: 'Packaged textiles', weight: 7000, qty: 90, pickup: 'Dar es Salaam', dest: 'Dodoma', carrier: 'CAR-303', truck: 'T 105 DJX', driver: 'Ramadhani Ngowi', driverPhone: '+255 713 204 881', status: 'Delivered', eta: '2026-09-20', delivered: '2026-09-20', created: '2026-09-18', progress: 1 },
    { id: 'SHP-2042', req: null, cust: 'CUS-206', cargo: 'Packaged household goods', weight: 11000, qty: 300, pickup: 'Dar es Salaam', dest: 'Mwanza', carrier: 'CAR-301', truck: 'T 219 DMB', driver: 'Idd Mohamed', driverPhone: '+255 754 671 200', status: 'Picked Up', eta: '2026-09-27', created: '2026-09-24', progress: 0.12 },
    { id: 'SHP-2041', req: null, cust: 'CUS-201', cargo: 'Chilled dairy', weight: 7600, qty: 15, pickup: 'Dar es Salaam Port', dest: 'Arusha', carrier: 'CAR-302', truck: 'T 590 DJQ', driver: 'Gabriel Massawe', driverPhone: '+255 768 553 120', status: 'Assigned', eta: '2026-09-27', created: '2026-09-25', progress: 0 },
    { id: 'SHP-2040', req: null, cust: 'CUS-204', cargo: 'Cement mixer parts', weight: 5200, qty: 6, pickup: 'Moshi', dest: 'Tanga', carrier: 'CAR-304', truck: 'T 391 DHF', driver: 'Elia Swai', driverPhone: '+255 757 118 342', status: 'Delivered', eta: '2026-09-17', delivered: '2026-09-17', created: '2026-09-16', progress: 1 },
    { id: 'SHP-2039', req: null, cust: 'CUS-205', cargo: 'Bagged cement', weight: 28000, qty: 560, pickup: 'Dar es Salaam', dest: 'Dodoma', carrier: 'CAR-306', truck: 'T 512 DKT', driver: 'Frank Mwalongo', driverPhone: '+255 622 004 917', status: 'In Transit', eta: '2026-09-24', created: '2026-09-22', progress: 0.9, delayed: true, delayNote: 'Road works at Gairo' }
  ];
  var deliveries = shipments.map(function (s, i) {
    var st = s.status === 'Delivered' ? 'Delivered' : s.delayed ? 'Delayed' : s.status === 'Out for Delivery' ? 'Out for Delivery' : 'Scheduled';
    return { id: 'DEL-' + (5110 - i), ship: s.id, cust: s.cust, dest: s.dest, carrier: s.carrier, expected: s.eta, delivered: s.delivered || null, status: st, pod: s.status === 'Delivered' };
  });
  var notifications = [
    { id: 'N1', cat: 'Requests', icon: 'ph-clipboard-text', title: 'New transport request REQ-1042', body: 'Kilimo Fresh Ltd · Dar es Salaam Port → Arusha · Refrigerated', at: '2026-09-25T08:31', read: false, href: 'requests:REQ-1042' },
    { id: 'N2', cat: 'Carriers', icon: 'ph-truck', title: 'Carrier registration awaiting verification', body: 'Kilwa Road Carriers registered 1 box truck', at: '2026-09-25T09:18', read: false, href: 'carriers:CAR-307' },
    { id: 'N3', cat: 'Shipments', icon: 'ph-package', title: 'SHP-2048 marked as picked up… now in transit', body: 'Dar es Salaam → Arusha · ETA 26 Sep', at: '2026-09-25T09:42', read: false, href: 'shipments:SHP-2048' },
    { id: 'N4', cat: 'Quotes', icon: 'ph-receipt', title: 'Quote QTE-3024 expires today', body: 'Mbeya Hardware Supplies · TZS 4,850,000', at: '2026-09-25T07:00', read: false, href: 'quotes:QTE-3024' },
    { id: 'N5', cat: 'Shipments', icon: 'ph-warning', title: 'SHP-2045 is past its ETA', body: 'Weighbridge queue at Makambako', at: '2026-09-25T06:40', read: false, href: 'shipments:SHP-2045' },
    { id: 'N6', cat: 'Requests', icon: 'ph-clipboard-text', title: 'New transport request REQ-1032', body: 'Lake Zone Retail · Mwanza → Shinyanga', at: '2026-09-25T06:58', read: true, href: 'requests:REQ-1032' },
    { id: 'N7', cat: 'Quotes', icon: 'ph-check-circle', title: 'Quote QTE-3021 accepted', body: 'Pwani Textiles · TZS 2,750,000', at: '2026-09-24T15:12', read: true, href: 'quotes:QTE-3021' },
    { id: 'N8', cat: 'Carriers', icon: 'ph-truck', title: 'Carrier registration awaiting verification', body: 'Kassim & Sons Transport registered 1 flatbed', at: '2026-09-24T12:05', read: true, href: 'carriers:CAR-305' },
    { id: 'N9', cat: 'System', icon: 'ph-envelope-simple', title: 'Email notifications degraded', body: 'Email provider key not configured; WhatsApp links still work', at: '2026-09-24T09:00', read: true, href: 'settings:integrations' },
    { id: 'N10', cat: 'Shipments', icon: 'ph-seal-check', title: 'SHP-2046 delivered with proof of delivery', body: 'Arusha → Dar es Salaam', at: '2026-09-22T17:26', read: true, href: 'shipments:SHP-2046' }
  ];
  var activity = [
    { at: '2026-09-25T09:42', icon: 'ph-package', text: 'Shipment SHP-2048 marked as in transit', href: 'shipments:SHP-2048' },
    { at: '2026-09-25T09:18', icon: 'ph-truck', text: 'New carrier registration from Kilwa Road Carriers', href: 'carriers:CAR-307' },
    { at: '2026-09-25T08:54', icon: 'ph-check-circle', text: 'Quote QTE-3021 accepted by Pwani Textiles', href: 'quotes:QTE-3021' },
    { at: '2026-09-25T08:31', icon: 'ph-clipboard-text', text: 'New transport request REQ-1042 received', href: 'requests:REQ-1042' },
    { at: '2026-09-25T07:52', icon: 'ph-magnifying-glass', text: 'REQ-1041 moved to Reviewing by Shedrack Maeda', href: 'requests:REQ-1041' },
    { at: '2026-09-25T07:10', icon: 'ph-seal-check', text: 'SHP-2047 out for delivery at Dar es Salaam Port', href: 'shipments:SHP-2047' }
  ];
  var users = [
    { id: 'USR-01', name: 'Shedrack Maeda', email: 'shedrack@abria.example', role: 'Manager', status: 'Active', last: '2026-09-25T09:40', created: '2026-01-05' },
    { id: 'USR-02', name: 'Amina Kweka', email: 'amina@abria.example', role: 'Admin', status: 'Active', last: '2026-09-25T09:12', created: '2026-01-05' },
    { id: 'USR-03', name: 'Godfrey Mushi', email: 'godfrey@abria.example', role: 'Manager', status: 'Active', last: '2026-09-24T18:20', created: '2026-02-14' },
    { id: 'USR-04', name: 'Zainabu Hassan', email: 'zainabu@abria.example', role: 'Admin', status: 'Active', last: '2026-09-23T11:05', created: '2026-03-01' },
    { id: 'USR-05', name: 'Lilian Minja', email: 'lilian@abria.example', role: 'Manager', status: 'Invited', last: null, created: '2026-09-24' },
    { id: 'USR-06', name: 'Kelvin Mbwana', email: 'kelvin@abria.example', role: 'Manager', status: 'Disabled', last: '2026-07-30T16:44', created: '2026-02-20' }
  ];
  var audit = [
    { at: '2026-09-25T09:12', user: 'Amina Kweka', action: 'Updated', resource: 'Homepage', desc: 'Updated homepage hero description' },
    { at: '2026-09-25T08:47', user: 'Shedrack Maeda', action: 'Status change', resource: 'Shipment', desc: 'Changed SHP-2048 status to In Transit' },
    { at: '2026-09-25T08:05', user: 'Amina Kweka', action: 'Updated', resource: 'Form', desc: 'Made “Delivery deadline” optional on Request Quote form' },
    { at: '2026-09-24T17:32', user: 'Zainabu Hassan', action: 'Invited', resource: 'User', desc: 'Invited Lilian Minja as Manager' },
    { at: '2026-09-24T15:12', user: 'Shedrack Maeda', action: 'Updated', resource: 'Quote', desc: 'Marked QTE-3021 as accepted' },
    { at: '2026-09-24T14:02', user: 'Amina Kweka', action: 'Uploaded', resource: 'Media', desc: 'Uploaded hero-trunk-road.jpg' },
    { at: '2026-09-24T11:40', user: 'Zainabu Hassan', action: 'Updated', resource: 'Settings', desc: 'Changed default SEO description' },
    { at: '2026-09-24T10:18', user: 'Godfrey Mushi', action: 'Verified', resource: 'Carrier', desc: 'Verified Shirima Logistics truck T 927 DMR' },
    { at: '2026-09-23T16:55', user: 'Amina Kweka', action: 'Published', resource: 'Page', desc: 'Published For Carriers page' },
    { at: '2026-09-23T12:30', user: 'Zainabu Hassan', action: 'Role change', resource: 'User', desc: 'Changed Godfrey Mushi role to Manager' },
    { at: '2026-09-22T09:14', user: 'Amina Kweka', action: 'Updated', resource: 'Branding', desc: 'Replaced favicon' },
    { at: '2026-09-21T10:05', user: 'Shedrack Maeda', action: 'Rejected', resource: 'Request', desc: 'Rejected REQ-1035: cold-chain vehicle unavailable' },
    { at: '2026-07-30T16:50', user: 'Zainabu Hassan', action: 'Disabled', resource: 'User', desc: 'Disabled Kelvin Mbwana' }
  ];
  var FIELD_TYPES = [
    ['text', 'Text', 'ph-text-aa'], ['textarea', 'Textarea', 'ph-text-align-left'], ['email', 'Email', 'ph-at'], ['tel', 'Phone', 'ph-phone'],
    ['number', 'Number', 'ph-hash'], ['date', 'Date', 'ph-calendar-blank'], ['time', 'Time', 'ph-clock'], ['select', 'Select', 'ph-caret-circle-down'],
    ['multiselect', 'Multi-select', 'ph-list-checks'], ['checkbox', 'Checkbox', 'ph-check-square'], ['radio', 'Radio', 'ph-radio-button'],
    ['file', 'File upload', 'ph-upload-simple'], ['location', 'Location', 'ph-map-pin']
  ];
  function F(id, label, type, req, extra) { return Object.assign({ id: id, label: label, type: type, required: !!req, enabled: true, placeholder: '', help: '', options: [] }, extra || {}); }
  var forms = [
    { id: 'quote', name: 'Request Quote', public: 'Request%20Quote.dc.html', status: 'Published', subs: 48, updated: '2026-09-25T08:05', desc: 'Businesses request a transport quotation.', fields: [
      F('contactPerson', 'Contact person', 'text', true, { placeholder: 'Full name' }), F('companyName', 'Company', 'text', false, { placeholder: 'Optional' }),
      F('phone', 'Phone', 'tel', true, { placeholder: '+255 7XX XXX XXX' }), F('email', 'Email', 'email', false, { placeholder: 'you@company.co.tz' }),
      F('pickupLocation', 'Pickup location', 'location', true, { placeholder: 'Town, area or address' }), F('deliveryLocation', 'Delivery location', 'location', true, { placeholder: 'Town, area or address' }),
      F('cargoType', 'Cargo type', 'select', true, { placeholder: 'Select cargo type', options: ['General Cargo', 'Refrigerated', 'Hazardous', 'Fragile', 'Heavy Machinery', 'Other'] }),
      F('weight', 'Approximate weight (kg)', 'number', false), F('transportDate', 'Date of transport', 'date', true),
      F('requiredDeliveryDate', 'Delivery deadline', 'date', false, { help: 'Leave empty if flexible.' }), F('additionalInstructions', 'Additional notes', 'textarea', false, { placeholder: 'Anything else we should know' })
    ] },
    { id: 'truck', name: 'Truck Registration', public: 'Register%20Truck.dc.html', status: 'Published', subs: 17, updated: '2026-09-20T10:00', desc: 'Carriers register vehicles for verification.', fields: [
      F('contactPerson', 'Full name', 'text', true), F('phone', 'Phone', 'tel', true), F('email', 'Email', 'email', false),
      F('truckType', 'Truck type', 'select', true, { options: ['Flatbed', 'Curtainsider', 'Box Truck', 'Refrigerated', 'Container Truck', 'Tipper', 'Lowbed', 'Pickup', 'Other'] }),
      F('registrationNumber', 'Registration number', 'text', true, { placeholder: 'e.g. T 123 ABC' }), F('truckCapacity', 'Capacity', 'text', false, { placeholder: 'e.g. 20 tonnes' }),
      F('routesCovered', 'Routes / regions you operate', 'text', false), F('documents', 'Vehicle documents', 'file', false, { enabled: false, help: 'Disabled until file storage is connected.' })
    ] },
    { id: 'contact', name: 'Contact Form', public: 'Contact.dc.html', status: 'Published', subs: 23, updated: '2026-09-12T09:30', desc: 'General, transport and partnership enquiries.', fields: [
      F('topic', 'What is it about?', 'radio', true, { options: ['Transport', 'Carrier / truck', 'Partnership', 'Other'] }), F('name', 'Name', 'text', true), F('phone', 'Phone', 'tel', true), F('email', 'Email', 'email', false), F('message', 'Message', 'textarea', true)
    ] },
    { id: 'partner', name: 'Partner Application', public: null, status: 'Draft', subs: 0, updated: '2026-09-10T14:00', desc: 'Businesses and logistics companies apply to partner.', fields: [
      F('company', 'Company name', 'text', true), F('contact', 'Contact person', 'text', true), F('email', 'Email', 'email', true), F('type', 'Partner type', 'select', true, { options: ['Transport provider', 'Fleet owner', 'Business', 'Logistics company', 'Technology partner'] }), F('about', 'Tell us about your business', 'textarea', false)
    ] }
  ];
  var submissions = [
    { id: 'SUB-9812', form: 'quote', name: 'Neema Mushi', company: 'Kilimo Fresh Ltd', at: '2026-09-25T08:31', status: 'Open', assignee: 'Shedrack Maeda', ref: 'REQ-1042' },
    { id: 'SUB-9811', form: 'truck', name: 'Yusuf Omary', company: 'Kilwa Road Carriers', at: '2026-09-25T09:18', status: 'Open', assignee: null, ref: 'CAR-307' },
    { id: 'SUB-9810', form: 'quote', name: 'Hamisi Juma', company: 'Dodoma Cement Distributors', at: '2026-09-25T07:52', status: 'In Review', assignee: 'Shedrack Maeda', ref: 'REQ-1041' },
    { id: 'SUB-9809', form: 'quote', name: 'Rehema Massawe', company: 'Lake Zone Retail', at: '2026-09-25T06:58', status: 'Open', assignee: 'Godfrey Mushi', ref: 'REQ-1032' },
    { id: 'SUB-9808', form: 'contact', name: 'Mariam Said', company: '', at: '2026-09-24T19:40', status: 'Open', assignee: null, message: 'Do you move cargo to Kigoma? We have monthly loads of cooking oil.' },
    { id: 'SUB-9807', form: 'quote', name: 'Joseph Kimaro', company: 'Kaskazini Builders', at: '2026-09-24T18:02', status: 'Open', assignee: 'Godfrey Mushi', ref: 'REQ-1037' },
    { id: 'SUB-9806', form: 'truck', name: 'Musa Kassim', company: 'Kassim & Sons Transport', at: '2026-09-24T12:05', status: 'In Review', assignee: 'Godfrey Mushi', ref: 'CAR-305' },
    { id: 'SUB-9805', form: 'contact', name: 'Daniel Urio', company: 'Urio Agencies', at: '2026-09-23T10:11', status: 'Closed', assignee: 'Shedrack Maeda', message: 'Partnership question about recurring transport to Tanga.' },
    { id: 'SUB-9804', form: 'quote', name: 'Aisha Salim', company: 'Pwani Textiles', at: '2026-09-23T15:22', status: 'Closed', assignee: 'Shedrack Maeda', ref: 'REQ-1030' }
  ];
  var pages = [
    { id: 'home', name: 'Homepage', url: '/', file: 'Home.dc.html', status: 'Published', updated: '2026-09-25T09:12', by: 'Amina Kweka' },
    { id: 'about', name: 'About', url: '/about', file: 'About.dc.html', status: 'Published', updated: '2026-09-25T08:00', by: 'Amina Kweka' },
    { id: 'solutions', name: 'Solutions', url: '/solutions', file: 'Solutions.dc.html', status: 'Published', updated: '2026-09-24T10:00', by: 'Zainabu Hassan' },
    { id: 'how', name: 'How It Works', url: '/how-it-works', file: 'How%20It%20Works.dc.html', status: 'Published', updated: '2026-09-22T12:00', by: 'Amina Kweka' },
    { id: 'shippers', name: 'For Businesses', url: '/for-shippers', file: 'For%20Shippers.dc.html', status: 'Published', updated: '2026-09-21T09:30', by: 'Amina Kweka' },
    { id: 'carriers', name: 'For Carriers', url: '/for-carriers', file: 'For%20Carriers.dc.html', status: 'Published', updated: '2026-09-23T16:55', by: 'Amina Kweka' },
    { id: 'contact', name: 'Contact', url: '/contact', file: 'Contact.dc.html', status: 'Published', updated: '2026-09-25T07:40', by: 'Zainabu Hassan' },
    { id: 'faq', name: 'FAQ', url: '/faq', file: 'Contact.dc.html#faq', status: 'Draft', updated: '2026-09-25T07:10', by: 'Amina Kweka' },
    { id: 'track', name: 'Track Shipment', url: '/track', file: 'Track%20Shipment.dc.html', status: 'Published', updated: '2026-09-18T11:00', by: 'Zainabu Hassan' },
    { id: 'partners', name: 'Partners', url: '/partners', file: null, status: 'Draft', updated: '2026-09-10T14:00', by: 'Amina Kweka' },
    { id: 'privacy', name: 'Privacy Policy', url: '/privacy', file: null, status: 'Draft', updated: '2026-09-02T10:00', by: 'Zainabu Hassan' },
    { id: 'terms', name: 'Terms & Conditions', url: '/terms', file: null, status: 'Draft', updated: '2026-09-02T10:00', by: 'Zainabu Hassan' }
  ];
  var media = [
    { id: 'M1', file: 'hero-trunk-road.jpg', cat: 'Homepage', alt: 'Loaded truck on a trunk road', by: 'Amina Kweka', at: '2026-09-24', size: '1.8 MB', dims: '2400 × 3000' },
    { id: 'M2', file: 'fleet-yard-wide.jpg', cat: 'Homepage', alt: 'Fleet parked at a loading yard', by: 'Amina Kweka', at: '2026-09-20', size: '2.4 MB', dims: '3200 × 1370' },
    { id: 'M3', file: 'ab-match-loading.jpg', cat: 'Solutions', alt: 'Cargo being loaded onto a curtainsider', by: 'Zainabu Hassan', at: '2026-09-18', size: '1.2 MB', dims: '2000 × 1600' },
    { id: 'M4', file: 'ab-cargo-warehouse.jpg', cat: 'Solutions', alt: 'Pallets inside a warehouse', by: 'Zainabu Hassan', at: '2026-09-18', size: '1.5 MB', dims: '2000 × 1600' },
    { id: 'M5', file: 'carrier-driver.jpg', cat: 'General', alt: 'Driver standing beside his truck', by: 'Amina Kweka', at: '2026-09-15', size: '980 KB', dims: '2400 × 1030' },
    { id: 'M6', file: 'team-operations.jpg', cat: 'Team', alt: 'ABRIA operations team at work', by: 'Amina Kweka', at: '2026-09-12', size: '2.1 MB', dims: '3000 × 1285' },
    { id: 'M7', file: 'founder-portrait.jpg', cat: 'About', alt: 'Portrait of the founder', by: 'Zainabu Hassan', at: '2026-09-10', size: '640 KB', dims: '1200 × 1500' },
    { id: 'M8', file: 'og-default.png', cat: 'General', alt: 'ABRIA social sharing image', by: 'Amina Kweka', at: '2026-09-02', size: '220 KB', dims: '1200 × 630' },
    { id: 'M9', file: 'about-office.jpg', cat: 'About', alt: 'Office exterior', by: 'Zainabu Hassan', at: '2026-08-28', size: '1.4 MB', dims: '2400 × 1600' }
  ];
  var faq = [
    { id: 'FQ1', cat: 'Businesses', q: 'How do I request transport?', a: 'Use the Request a Quote form, or send the details on WhatsApp.', status: 'Published' },
    { id: 'FQ2', cat: 'Businesses', q: 'What types of cargo can ABRIA transport?', a: 'General cargo, refrigerated, hazardous, fragile and heavy machinery.', status: 'Published' },
    { id: 'FQ3', cat: 'Businesses', q: 'How are transport quotes handled?', a: 'The ABRIA team reviews each request and sends a written quotation.', status: 'Published' },
    { id: 'FQ4', cat: 'Businesses', q: 'How can I track my shipment?', a: 'Online tracking is coming soon; send your ABR reference on WhatsApp for an update.', status: 'Published' },
    { id: 'FQ5', cat: 'Carriers', q: 'How do I register my truck?', a: 'Fill in the Register Your Truck form. You receive a partner ID straight away.', status: 'Published' },
    { id: 'FQ6', cat: 'Carriers', q: 'What types of trucks are accepted?', a: 'Flatbed, curtainsider, box truck, refrigerated, container truck, tipper, lowbed and pickup.', status: 'Published' },
    { id: 'FQ7', cat: 'Carriers', q: 'How do I receive jobs?', a: 'After verification, jobs that fit your truck and routes are assigned to you.', status: 'Published' },
    { id: 'FQ8', cat: 'General', q: 'Where does ABRIA operate?', a: 'ABRIA is based in Tanzania. [Confirmed regions to be added.]', status: 'Draft' },
    { id: 'FQ9', cat: 'General', q: 'How can I contact ABRIA?', a: 'WhatsApp or call +255 723 999 039, or email info@abrialogistics.co.tz.', status: 'Published' }
  ];

  // lookups
  function by(list, key) { var m = {}; list.forEach(function (x) { m[x[key]] = x; }); return m; }
  var IDX = { cust: by(customers, 'id'), car: by(carriers, 'id'), req: by(requests, 'id'), quote: by(quotes, 'id'), ship: by(shipments, 'id'), truck: by(trucks, 'reg'), user: by(users, 'id') };
  quotes.forEach(function (q) {
    var r = IDX.req[q.req]; q.cust = r ? r.cust : null; q.route = r ? r.pickup + ' → ' + r.dest : '';
    q.lines = qLines(q.amount, r ? r.pickup + ' → ' + r.dest : '', r ? r.truck.toLowerCase() : 'truck');
  });
  function hrefOf(ref) {
    if (!ref) return '#';
    var p = ref.split(':');
    if (p[0] === 'settings') return link('settings', { s: p[1] });
    return link(p[0], { id: p[1] });
  }
  function counts() {
    return {
      newReq: requests.filter(function (r) { return r.status === 'New'; }).length,
      reviewing: requests.filter(function (r) { return r.status === 'Reviewing'; }).length,
      pendingCar: carriers.filter(function (c) { return c.status === 'Pending Verification'; }).length,
      delayed: shipments.filter(function (s) { return s.delayed && s.status !== 'Delivered'; }).length,
      expiring: quotes.filter(function (q) { return q.status === 'Sent' && q.valid === TODAY; }).length,
      active: shipments.filter(function (s) { return s.status !== 'Delivered'; }).length,
      pendingQuotes: quotes.filter(function (q) { return q.status === 'Sent' || q.status === 'Draft'; }).length,
      unread: notifications.filter(function (n) { return !n.read; }).length
    };
  }

  // ── Session (prototype): role + current user
  function role() { var r = param('role'); if (r) setRole(r); try { return localStorage.getItem('abria-role') || 'manager'; } catch (e) { return 'manager'; } }
  function setRole(r) { try { localStorage.setItem('abria-role', r); } catch (e) {} }
  function me() { return role() === 'admin' ? IDX.user['USR-02'] : IDX.user['USR-01']; }

  // ── Injected console CSS: surface tokens, skeleton shimmer, toast, dialog motion.
  var CSS =
    ':root{--app-page:var(--color-surface);--app-card:color-mix(in srgb,var(--color-bg) 50%,#fff);--app-line:color-mix(in srgb,var(--color-text) 10%,transparent);--app-muted:color-mix(in srgb,var(--color-text) 66%,transparent);--app-hover:color-mix(in srgb,var(--color-accent) 7%,transparent)}' +
    'html[data-theme="dark"]{--app-page:var(--color-bg);--app-card:var(--color-surface);--app-line:color-mix(in srgb,var(--color-text) 12%,transparent)}' +
    '@keyframes abria-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}' +
    '.abria-skel{border-radius:8px;background:linear-gradient(90deg,color-mix(in srgb,var(--color-text) 7%,transparent) 0,color-mix(in srgb,var(--color-text) 13%,transparent) 50%,color-mix(in srgb,var(--color-text) 7%,transparent) 100%);background-size:800px 100%;animation:abria-shimmer 1.3s linear infinite}' +
    '@keyframes abria-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}@keyframes abria-fade{from{opacity:0}to{opacity:1}}' +
    '@media (prefers-reduced-motion:reduce){.abria-skel{animation:none}}';
  (function () { var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); })();

  function toast(msg, opts) {
    opts = opts || {};
    var host = document.getElementById('abria-toasts');
    if (!host) { host = document.createElement('div'); host.id = 'abria-toasts'; host.setAttribute('role', 'status'); host.setAttribute('aria-live', 'polite'); host.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:3000;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;width:min(560px,calc(100vw - 32px))'; document.body.appendChild(host); }
    var t = document.createElement('div');
    var bad = opts.tone === 'bad';
    t.style.cssText = 'pointer-events:auto;display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;background:' + (bad ? 'var(--color-accent-2-800)' : 'var(--color-text)') + ';color:var(--color-bg);font:500 14px/1.4 Roboto,system-ui,sans-serif;box-shadow:var(--shadow-lg);animation:abria-in .22s cubic-bezier(.2,.7,.2,1);max-width:100%';
    t.innerHTML = '<i class="ph-duotone ' + (opts.icon || (bad ? 'ph-warning-circle' : 'ph-check-circle')) + '" style="font-size:20px;flex:none"></i><span style="flex:1"></span>';
    t.querySelector('span').textContent = msg;
    if (opts.action) { var b = document.createElement('button'); b.textContent = opts.action; b.style.cssText = 'background:none;border:0;color:var(--color-accent-300);font:600 14px Roboto,system-ui,sans-serif;cursor:pointer;padding:4px'; b.onclick = function () { opts.onAction && opts.onAction(); t.remove(); }; t.appendChild(b); }
    host.appendChild(t);
    setTimeout(function () { t.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(6px)' }], { duration: 200, fill: 'forwards' }).onfinish = function () { t.remove(); }; }, opts.ms || 3200);
  }
  function confirmDlg(o) {
    return new Promise(function (res) {
      var prev = document.activeElement;
      var b = document.createElement('div');
      b.className = 'dialog-backdrop';
      b.style.cssText = 'z-index:2500;animation:abria-fade .16s ease';
      b.innerHTML = '<div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="abria-cf-t" aria-describedby="abria-cf-b" style="background:var(--app-card);border-radius:16px;padding:24px;animation:abria-in .2s cubic-bezier(.2,.7,.2,1);font-family:Roboto,system-ui,sans-serif">' +
        '<div style="display:flex;gap:14px;align-items:flex-start"><span style="width:40px;height:40px;border-radius:50%;flex:none;display:grid;place-items:center;background:' + (o.danger ? 'color-mix(in srgb,var(--color-accent-2) 14%,transparent);color:var(--color-accent-2-700)' : 'color-mix(in srgb,var(--color-accent) 14%,transparent);color:var(--color-accent-700)') + '"><i class="ph-duotone ' + (o.icon || (o.danger ? 'ph-warning' : 'ph-question')) + '" style="font-size:22px"></i></span>' +
        '<div><div class="dialog-title" id="abria-cf-t" style="font-size:18px;font-weight:600"></div><div class="dialog-body" id="abria-cf-b" style="margin-top:6px;font-size:14px;line-height:1.5"></div></div></div>' +
        '<div class="dialog-actions" style="margin-top:20px"><button type="button" class="btn btn-secondary" data-x style="min-height:40px;border-radius:10px">Cancel</button><button type="button" class="btn btn-primary" data-ok style="min-height:40px;border-radius:10px' + (o.danger ? ';background:var(--color-accent-2);color:#fff' : '') + '"></button></div></div>';
      b.querySelector('#abria-cf-t').textContent = o.title;
      b.querySelector('#abria-cf-b').textContent = o.body || '';
      b.querySelector('[data-ok]').textContent = o.confirm || 'Confirm';
      function close(v) { document.removeEventListener('keydown', k); b.remove(); prev && prev.focus && prev.focus(); res(v); }
      function k(e) { if (e.key === 'Escape') close(false); }
      b.addEventListener('click', function (e) { if (e.target === b) close(false); });
      b.querySelector('[data-x]').onclick = function () { close(false); };
      b.querySelector('[data-ok]').onclick = function () { close(true); };
      document.addEventListener('keydown', k);
      document.body.appendChild(b);
      b.querySelector('[data-ok]').focus();
    });
  }

  // ── Table cell builders (rows are data; DataTable renders them)
  var C = {
    id: function (t, href, sub) { return { t: t, href: href, sub: sub, mono: true }; },
    t: function (t, sub) { return { t: t == null ? '—' : String(t), sub: sub }; },
    b: function (label, sub) { return { badge: badge(label), sub: sub }; },
    n: function (t, sub) { return { t: String(t), sub: sub, align: 'right' }; }
  };

  // ── Row builders: records -> DataTable rows. One place maps API shape to table cells.
  function view(href) { return { label: 'Open', icon: 'ph-arrow-right', href: href }; }
  var ROWS = {
    requests: function (list) {
      return list.map(function (r) {
        var c = IDX.cust[r.cust], h = link('requests', { id: r.id });
        return { id: r.id, href: h, date: r.created, search: [r.id, c.name, c.company, r.pickup, r.dest, r.cargo, r.desc].join(' '), f: { status: r.status, cargo: r.cargo }, s: { created: r.created, date: r.date, weight: r.weight },
          cells: { id: C.id(r.id, h), cust: C.t(c.name), customer: C.t(c.company, c.name), company: C.t(c.company), pickup: C.t(r.pickup), dest: C.t(r.dest), route: C.t(r.pickup + ' → ' + r.dest), cargo: C.t(r.cargo, kg(r.weight)), date: C.t(d(r.date)), status: C.b(r.status), created: C.t(rel(r.created)) },
          actions: [view(h)] };
      });
    },
    shipments: function (list) {
      return list.map(function (s) {
        var c = IDX.cust[s.cust], k = IDX.car[s.carrier], t = IDX.truck[s.truck], h = link('shipments', { id: s.id });
        var late = s.delayed && s.status !== 'Delivered';
        return { id: s.id, href: h, date: s.created, search: [s.id, c.company, c.name, s.pickup, s.dest, k.company, s.truck, s.driver, s.cargo].join(' '), f: { status: s.status, carrier: k.company, region: s.dest, delay: late ? 'Delayed' : 'On time' }, s: { eta: s.eta, created: s.created },
          cells: { id: C.id(s.id, h), cust: C.t(c.company, c.name), cargo: C.t(s.cargo, kg(s.weight)), pickup: C.t(s.pickup), dest: C.t(s.dest), route: C.t(s.pickup + ' → ' + s.dest), carrier: C.t(k.company, k.name), truck: C.t(s.truck, t ? t.type : ''), status: C.b(s.status, late ? 'Past ETA' : ''), eta: C.t(dShort(s.eta), late ? 'Overdue by ' + (-daysFrom(s.eta)) + 'd' : ''), created: C.t(dShort(s.created)) },
          actions: [view(h)] };
      });
    },
    quotes: function (list) {
      return list.map(function (q) {
        var c = IDX.cust[q.cust] || {}, h = link('quotes', { id: q.id });
        var acts = [view(h)];
        if (q.status === 'Draft') acts.push({ label: 'Send', icon: 'ph-paper-plane-tilt', onClick: function () { q.status = 'Sent'; toast(q.id + ' sent to ' + c.company); window.dispatchEvent(new Event('abria-data')); } });
        if (q.status === 'Draft' || q.status === 'Sent') acts.push({ label: 'Cancel', icon: 'ph-x-circle', danger: true, onClick: function () { confirmDlg({ title: 'Cancel quote ' + q.id + '?', body: 'The customer will no longer be able to accept it. This cannot be undone.', confirm: 'Cancel quote', danger: true }).then(function (ok) { if (ok) { q.status = 'Cancelled'; toast(q.id + ' cancelled'); window.dispatchEvent(new Event('abria-data')); } }); } });
        var exp = q.status === 'Sent' && q.valid === TODAY;
        return { id: q.id, href: h, date: q.created, search: [q.id, q.req, c.company, c.name, q.route].join(' '), f: { status: q.status }, s: { amount: q.amount, created: q.created, valid: q.valid },
          cells: { id: C.id(q.id, h), req: C.id(q.req, link('requests', { id: q.req })), cust: C.t(c.company, c.name), route: C.t(q.route), amount: C.n(tzs(q.amount)), created: C.t(dShort(q.created)), valid: C.t(dShort(q.valid), exp ? 'Expires today' : ''), status: C.b(q.status) },
          actions: acts };
      });
    },
    deliveries: function (list) {
      return list.map(function (x) {
        var c = IDX.cust[x.cust], k = IDX.car[x.carrier], h = link('shipments', { id: x.ship });
        return { id: x.id, href: h, date: x.expected, search: [x.id, x.ship, c.company, x.dest, k.company].join(' '), f: { status: x.status, carrier: k.company }, s: { expected: x.expected, delivered: x.delivered || '' },
          cells: { id: C.t(x.id), ship: C.id(x.ship, h), cust: C.t(c.company, c.name), dest: C.t(x.dest), carrier: C.t(k.company), expected: C.t(dShort(x.expected)), delivered: C.t(x.delivered ? dShort(x.delivered) : '—', x.pod ? 'POD received' : ''), status: C.b(x.status) },
          actions: [view(h)] };
      });
    },
    customers: function (list) {
      return list.map(function (c) {
        var h = link('customers', { id: c.id });
        var nr = requests.filter(function (r) { return r.cust === c.id; }).length, ns = shipments.filter(function (s) { return s.cust === c.id; }).length;
        return { id: c.id, href: h, date: c.last, search: [c.id, c.name, c.company, c.email, c.phone, c.region].join(' '), f: { status: c.status, region: c.region }, s: { requests: nr, shipments: ns, last: c.last },
          cells: { cust: { t: c.name, href: h, sub: c.id }, company: C.t(c.company, c.region), phone: C.t(c.phone), email: C.t(c.email), requests: C.n(nr), shipments: C.n(ns), last: C.t(rel(c.last)), status: C.b(c.status) },
          actions: [view(h)] };
      });
    },
    carriers: function (list) {
      return list.map(function (k) {
        var h = link('carriers', { id: k.id });
        var nt = trucks.filter(function (t) { return t.owner === k.id; }).length;
        var na = shipments.filter(function (s) { return s.carrier === k.id && s.status !== 'Delivered'; }).length;
        return { id: k.id, href: h, date: k.joined, search: [k.id, k.name, k.company, k.location, k.routes, k.phone].join(' '), f: { status: k.status, location: k.location }, s: { trucks: nt, active: na, completed: k.completed, joined: k.joined },
          cells: { carrier: { t: k.name, href: h, sub: k.id }, company: C.t(k.company), phone: C.t(k.phone), location: C.t(k.location), trucks: C.n(nt), active: C.n(na), completed: C.n(k.completed), status: C.b(k.status) },
          actions: [view(h)] };
      });
    },
    trucks: function (list) {
      return list.map(function (t) {
        var k = IDX.car[t.owner], h = link('carriers', { id: t.owner });
        return { id: t.reg, href: h, search: [t.reg, t.type, t.make, k.company, t.region].join(' '), f: { status: t.status, type: t.type, ver: t.ver, region: t.region }, s: { cap: parseFloat(t.cap) },
          cells: { reg: { t: t.reg, sub: t.make }, type: C.t(t.type), cap: C.n(t.cap), owner: { t: k.company, href: h, sub: k.name }, region: C.t(t.region), status: C.b(t.status), ver: C.b(t.ver === 'Pending' ? 'Pending' : 'Verified') },
          actions: [{ label: 'Owner', icon: 'ph-arrow-right', href: h }] };
      });
    }
  };
  var COLS = {
    requests: [{ key: 'id', label: 'Request ID' }, { key: 'cust', label: 'Customer' }, { key: 'company', label: 'Company' }, { key: 'pickup', label: 'Pickup' }, { key: 'dest', label: 'Destination' }, { key: 'cargo', label: 'Cargo' }, { key: 'date', label: 'Requested date' }, { key: 'status', label: 'Status' }, { key: 'created', label: 'Created' }],
    requestsShort: [{ key: 'id', label: 'Request ID' }, { key: 'customer', label: 'Customer' }, { key: 'route', label: 'Route' }, { key: 'cargo', label: 'Cargo' }, { key: 'date', label: 'Date' }, { key: 'status', label: 'Status' }],
    shipments: [{ key: 'id', label: 'Shipment ID' }, { key: 'cust', label: 'Customer' }, { key: 'cargo', label: 'Cargo' }, { key: 'pickup', label: 'Pickup' }, { key: 'dest', label: 'Destination' }, { key: 'carrier', label: 'Carrier' }, { key: 'truck', label: 'Truck' }, { key: 'status', label: 'Status' }, { key: 'eta', label: 'ETA' }, { key: 'created', label: 'Created' }],
    shipmentsShort: [{ key: 'id', label: 'Shipment ID' }, { key: 'cust', label: 'Customer' }, { key: 'route', label: 'Route' }, { key: 'carrier', label: 'Carrier' }, { key: 'status', label: 'Status' }, { key: 'eta', label: 'ETA' }],
    quotes: [{ key: 'id', label: 'Quote ID' }, { key: 'req', label: 'Request ID' }, { key: 'cust', label: 'Customer' }, { key: 'route', label: 'Route' }, { key: 'amount', label: 'Amount', align: 'right' }, { key: 'created', label: 'Created' }, { key: 'valid', label: 'Valid until' }, { key: 'status', label: 'Status' }],
    deliveries: [{ key: 'id', label: 'Delivery ID' }, { key: 'ship', label: 'Shipment' }, { key: 'cust', label: 'Customer' }, { key: 'dest', label: 'Destination' }, { key: 'carrier', label: 'Carrier' }, { key: 'expected', label: 'Expected' }, { key: 'delivered', label: 'Delivered' }, { key: 'status', label: 'Status' }],
    customers: [{ key: 'cust', label: 'Customer' }, { key: 'company', label: 'Company' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'requests', label: 'Requests', align: 'right' }, { key: 'shipments', label: 'Shipments', align: 'right' }, { key: 'last', label: 'Last activity' }, { key: 'status', label: 'Status' }],
    carriers: [{ key: 'carrier', label: 'Carrier' }, { key: 'company', label: 'Company' }, { key: 'phone', label: 'Phone' }, { key: 'location', label: 'Location' }, { key: 'trucks', label: 'Trucks', align: 'right' }, { key: 'active', label: 'Active jobs', align: 'right' }, { key: 'completed', label: 'Completed', align: 'right' }, { key: 'status', label: 'Verification' }],
    trucks: [{ key: 'reg', label: 'Registration' }, { key: 'type', label: 'Truck type' }, { key: 'cap', label: 'Capacity', align: 'right' }, { key: 'owner', label: 'Owner' }, { key: 'region', label: 'Region' }, { key: 'status', label: 'Status' }, { key: 'ver', label: 'Verification' }]
  };
  function uniq(list, key) { var s = {}; list.forEach(function (x) { s[typeof key === 'function' ? key(x) : x[key]] = 1; }); return Object.keys(s).sort(); }

  window.ABRIA_M = {
    ROWS: ROWS, COLS: COLS, uniq: uniq,
    TODAY: TODAY, R: R, link: link, param: param, hrefOf: hrefOf, badge: badge, TONES: TONES,
    d: d, dShort: dShort, time: time, rel: rel, tzs: tzs, kg: kg, daysFrom: daysFrom,
    DATA: { customers: customers, carriers: carriers, trucks: trucks, requests: requests, quotes: quotes, shipments: shipments, deliveries: deliveries, notifications: notifications, activity: activity, users: users, audit: audit, forms: forms, submissions: submissions, pages: pages, media: media, faq: faq, partners: [] },
    IDX: IDX, STAGES: STAGES, STAGE_OF: STAGE_OF, FIELD_TYPES: FIELD_TYPES, counts: counts,
    role: role, setRole: setRole, me: me, toast: toast, confirm: confirmDlg, C: C
  };
})();
