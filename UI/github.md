repo: BM4321/abria
branch: main

## Last sync
date: 2026-09-25T04:51:15Z

### Updated in this project
- Redesigned public site as a multi-page prototype on the Broadsheet system
- Quote and truck forms mirror RequestForm / TruckRegistrationForm fields and validation
- Shipment stages taken from src/lib/status.ts

## Screen map
| Screen | Repo files |
| --- | --- |
| Home.dc.html | src/app/page.tsx, src/components/Hero.tsx, Metrics.tsx, Marketplace.tsx, Solutions.tsx, HowItWorks.tsx, Founder.tsx |
| Nav.dc.html / Footer.dc.html | src/components/Navbar.tsx, Footer.tsx |
| Solutions.dc.html / Solution.dc.html | src/components/Solutions.tsx, Technology.tsx |
| How It Works.dc.html | src/components/HowItWorks.tsx, Technology.tsx, src/lib/status.ts |
| For Shippers.dc.html / For Carriers.dc.html | src/components/Marketplace.tsx, src/lib/status.ts |
| Request Quote.dc.html | src/app/request-transport/page.tsx, src/components/RequestForm.tsx |
| Register Truck.dc.html | src/app/register-truck/page.tsx, src/components/TruckRegistrationForm.tsx |
| Track Shipment.dc.html | src/app/track/page.tsx, src/components/TrackForm.tsx |
| About.dc.html | src/components/About.tsx, Founder.tsx |
| Contact.dc.html | src/components/Contact.tsx |
