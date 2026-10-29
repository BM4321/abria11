// Public site content — ported from UI/abria-data.js. Shared by the marketing
// pages (solutions list, page routes, contact details, bilingual strings).

export type Solution = {
  id: string;
  name: string;
  icon: string;
  line: string;
  lineSw: string;
  short: string;
  shortSw: string;
  audience: string;
  problemTitle: string;
  problem: string;
  steps: [string, string][];
  features: [string, string][];
  example: string;
  related: string[];
  soon?: boolean;
  n: string;
  href: string;
  iconClass: string;
};

const RAW_SOLUTIONS: Omit<Solution, "n" | "href" | "iconClass">[] = [
  {
    id: "pickup",
    name: "AB Pickup",
    icon: "ph-package",
    line: "On-demand pickup scheduling that gets your goods collected on time, every time.",
    lineSw: "Upangaji wa kuchukua mizigo kwa wakati, kila mara.",
    short: "Scheduled collection",
    shortSw: "Kuchukua mizigo",
    audience: "Shops, distributors and warehouses that need goods collected on a set day.",
    problemTitle: "Goods wait because nobody has confirmed the collection.",
    problem:
      "A consignment is packed and ready, but the pickup depends on phone calls to a driver who may or may not arrive. Every hour it waits at the gate is an hour lost at the other end.",
    steps: [
      ["Tell us the pickup point", "Location, contact on site, cargo and the date you want it collected."],
      ["We confirm the truck", "ABRIA confirms a suitable vehicle and a collection window before the day."],
      ["The driver collects", "Your request moves to Picked up, and the cargo continues as AB Cargo or AB Express."],
    ],
    features: [
      ["Preferred pickup date on every request", "Set the day you need collection when you request transport."],
      ["One contact for the collection", "Pickup location and on-site contact are recorded once, with your request."],
      ["Status at collection", "Your ABR reference shows when the cargo has been picked up."],
    ],
    example:
      "A distributor packs 40 cartons for Thursday. It requests a pickup on Monday, and ABRIA confirms a box truck and a morning window before Thursday.",
    related: ["cargo", "express"],
  },
  {
    id: "cargo",
    name: "AB Cargo",
    icon: "ph-truck",
    line: "Full cargo transport management for shipments of any size, from parcel to full load.",
    lineSw: "Usimamizi kamili wa usafirishaji wa mizigo ya ukubwa wowote, kuanzia kifurushi hadi lori zima.",
    short: "Parcel to full load",
    shortSw: "Kifurushi hadi lori zima",
    audience: "Businesses and cargo owners moving goods by road.",
    problemTitle: "Moving cargo still runs on phone calls and informal prices.",
    problem:
      "Cargo owners call several transporters, compare prices that change between calls, and keep the only record of the job in a chat thread. When something goes wrong, there is nothing to refer back to.",
    steps: [
      ["Describe the cargo", "Type, weight, dimensions, number of packages, value and route."],
      ["Receive a written quotation", "ABRIA reviews the request and sends a quotation before you commit."],
      ["Approve and book", "On approval, a vehicle and driver are assigned to your shipment."],
      ["Delivery and proof", "The job closes with proof of delivery against your ABR reference."],
    ],
    features: [
      ["Cargo types", "General, refrigerated, hazardous, fragile and heavy machinery."],
      ["One reference per shipment", "Every request gets an ABR ID you can quote in every conversation."],
      ["Quotation before commitment", "You see the price in writing and approve it."],
      ["Proof of delivery", "Delivery is confirmed and recorded when the job completes."],
    ],
    example:
      "A building supplier moves a full load of bagged cement between two depots. It submits one request, approves the quotation, and receives proof of delivery on arrival.",
    related: ["match", "track"],
  },
  {
    id: "match",
    name: "AB Match",
    icon: "ph-arrows-left-right",
    line: "Smart matching that pairs your shipment with the right truck and carrier.",
    lineSw: "Kuunganisha mzigo wako na lori na msafirishaji sahihi.",
    short: "Shipment-to-carrier matching",
    shortSw: "Kuunganisha mzigo na lori",
    audience: "Shippers who need the right vehicle, and carriers who want fuller trucks.",
    problemTitle: "The right truck is often nearby. Nobody knows it is there.",
    problem:
      "Cargo owners cannot see which trucks are free, where they are, or what they can carry. Carriers drive back empty because they cannot see the loads waiting on their route. Both sides lose money.",
    steps: [
      ["Carriers register their trucks", "Truck type, capacity, current location and the routes they cover."],
      ["You describe the load", "Cargo type, weight, pickup, delivery and date."],
      ["ABRIA shortlists carriers", "Only trucks whose type, capacity and routes fit the load are considered."],
      ["A verified carrier is assigned", "You see the company, truck type and registration moving your goods."],
    ],
    features: [
      ["Truck type and capacity", "Refrigerated cargo is only offered to refrigerated trucks; a 20-tonne load only to trucks that can take it."],
      ["Location and routes covered", "Carriers already on or near your route come first."],
      ["Verified carriers", "Carriers are reviewed and their vehicle verified before they are assigned work."],
      ["Transparent assignment", "The assigned carrier and vehicle registration are shared with you."],
    ],
    example:
      "A produce exporter needs chilled transport. AB Match considers only registered refrigerated trucks with the capacity and route, and ABRIA assigns one of them.",
    related: ["cargo", "business"],
  },
  {
    id: "business",
    name: "AB Business",
    icon: "ph-buildings",
    line: "Dedicated logistics solutions for businesses with recurring transport needs.",
    lineSw: "Suluhisho maalum kwa biashara zenye mahitaji ya usafiri ya kudumu.",
    short: "Recurring transport",
    shortSw: "Usafiri wa kudumu",
    audience: "Companies that move goods every week or every month on the same routes.",
    problemTitle: "Recurring shipments get renegotiated every time.",
    problem:
      "A business that ships every week still starts from zero: a new transporter, a new price and a new set of calls. Nobody holds the history of what moved, when and at what cost.",
    steps: [
      ["Tell us your routes and volumes", "The lanes you use, how often and what you move."],
      ["Agree how we will work", "ABRIA sets out a plan for your recurring transport."],
      ["Request as you need", "Each shipment is a request against your profile."],
      ["Keep the record", "Every job is logged by ABR reference for your own reporting."],
    ],
    features: [
      ["Your cargo profile on file", "Routes, cargo types and handling needs recorded once."],
      ["Request history", "Every shipment is held under its own ABR reference."],
      ["Scheduled transport", "Plan pickups ahead against known dates."],
      ["Direct line to ABRIA", "Speak to the team on WhatsApp, phone or email."],
    ],
    example:
      "A manufacturer ships finished goods to three regional customers every fortnight. It agrees the lanes with ABRIA once, then requests each run against the same profile.",
    related: ["cargo", "pickup"],
  },
  {
    id: "express",
    name: "AB Express",
    icon: "ph-lightning",
    line: "Priority, time-critical delivery for shipments that can't afford to wait.",
    lineSw: "Usafirishaji wa haraka kwa mizigo isiyoweza kusubiri.",
    short: "Time-critical delivery",
    shortSw: "Usafiri wa haraka",
    audience: "Shipments with a hard delivery deadline.",
    problemTitle: "A missed deadline costs more than the transport.",
    problem:
      "Spare parts for a stopped machine, stock for a launch, documents for a tender. When the delivery date is fixed, the cheapest truck is not the right one.",
    steps: [
      ["Set the deadline", "Enter the required delivery date with your request."],
      ["Priority review", "ABRIA reviews time-critical requests first."],
      ["Carrier confirmed against the date", "The assigned carrier is confirmed against your deadline before pickup."],
    ],
    features: [
      ["Required delivery date", "Captured on every request and checked before assignment."],
      ["Priority handling", "Time-critical requests are reviewed first."],
      ["Direct contact", "Reach the team on WhatsApp while the shipment is moving."],
    ],
    example:
      "A mine needs a replacement pump part within 48 hours. The request is flagged time-critical and the carrier is confirmed against the deadline before pickup.",
    related: ["pickup", "track"],
  },
  {
    id: "track",
    name: "AB Track",
    icon: "ph-map-pin-line",
    line: "Shipment visibility from pickup to final delivery.",
    lineSw: "Kufuatilia mzigo kutoka kuchukuliwa hadi kufikishwa.",
    short: "Shipment visibility",
    shortSw: "Kufuatilia mzigo",
    audience: "Anyone waiting on a shipment moved through ABRIA.",
    problemTitle: "“Where is my cargo?” should not take five phone calls.",
    problem:
      "Once a truck leaves, most cargo owners lose sight of their goods until the driver calls. Every update depends on someone remembering to ask.",
    steps: [
      ["Every request gets an ABR ID", "Your reference is issued the moment you submit a request."],
      ["Status moves with the shipment", "Booked, vehicle assigned, picked up, in transit, delivered."],
      ["Look it up", "Enter your ABR ID on the Track Shipment page to see the current stage, or send it on WhatsApp for more detail."],
    ],
    features: [
      ["Status stages", "From request received to proof of delivery."],
      ["Assigned vehicle", "Carrier and truck registration on your shipment."],
      ["Last updated", "When the status last changed."],
    ],
    example:
      "A retailer receives its ABR ID on submitting a request. Later that week it enters the ID on the Track Shipment page and sees the cargo is in transit with the assigned truck.",
    related: ["cargo", "match"],
  },
];

export const solutions: Solution[] = RAW_SOLUTIONS.map((s, i) => ({
  ...s,
  n: String(i + 1).padStart(2, "0"),
  href: `/solutions/${s.id}`,
  iconClass: `ph-duotone ${s.icon}`,
}));

export function sol(id: string): Solution | undefined {
  return solutions.find((s) => s.id === id);
}

export const pages = {
  home: "/",
  solutions: "/solutions",
  how: "/how-it-works",
  tech: "/how-it-works#technology",
  shippers: "/for-shippers",
  carriers: "/for-carriers",
  about: "/about",
  contact: "/contact",
  faq: "/contact#faq",
  quote: "/request-transport",
  truck: "/register-truck",
  track: "/track",
  notfound: "/not-found",
};

export const CONTACT = {
  phone: "+255 723 999 039",
  phoneHref: "tel:+255723999039",
  email: "info@abrialogistics.co.tz",
  whatsapp: "255723999039",
};

export function wa(text?: string): string {
  return `https://wa.me/${CONTACT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export const STAGES = [
  "Request received",
  "Under review",
  "Quotation sent",
  "Booked",
  "Vehicle and driver assigned",
  "Picked up",
  "In transit",
  "Delivered",
  "Proof of delivery received",
];
