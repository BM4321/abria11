import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Seeds the real structural defaults the admin area manages: website page
// registry, editable site settings and public form definitions. No demo or
// sample content is created. Idempotent — safe to re-run.

const prisma = new PrismaClient();

const pages = [
  { slug: "home", title: "Homepage", url: "/", status: "PUBLISHED" },
  { slug: "solutions", title: "Solutions", url: "/solutions", status: "PUBLISHED" },
  { slug: "how", title: "How It Works", url: "/how-it-works", status: "PUBLISHED" },
  { slug: "shippers", title: "For Businesses", url: "/for-shippers", status: "PUBLISHED" },
  { slug: "carriers", title: "For Carriers", url: "/for-carriers", status: "PUBLISHED" },
  { slug: "about", title: "About", url: "/about", status: "PUBLISHED" },
  { slug: "contact", title: "Contact", url: "/contact", status: "PUBLISHED" },
  { slug: "quote", title: "Request a Quote", url: "/request-transport", status: "PUBLISHED" },
  { slug: "truck", title: "Register Your Truck", url: "/register-truck", status: "PUBLISHED" },
  { slug: "track", title: "Track Shipment", url: "/track", status: "PUBLISHED" },
];

const settings = [
  { key: "site.name", value: "ABRIA Logistics" },
  { key: "site.tagline", value: "Connected Logistics. Better Movement." },
  { key: "site.email", value: "info@abrialogistics.co.tz" },
  { key: "site.phone", value: "+255 723 999 039" },
  { key: "seo.title", value: "ABRIA Logistics | Transport and cargo coordination in Tanzania" },
  { key: "seo.description", value: "ABRIA connects businesses and cargo owners with verified transport providers in Tanzania." },
];

const forms = [
  {
    formId: "quote",
    name: "Request Quote",
    description: "Businesses request a transport quotation.",
    status: "PUBLISHED",
    publicPath: "/request-transport",
    fields: JSON.stringify([
      "contactPerson", "companyName", "phone", "email", "pickupLocation",
      "deliveryLocation", "cargoType", "transportType", "cargoDescription",
      "weight", "numberOfPackages", "dimensions", "cargoValue", "transportDate",
      "requiredDeliveryDate", "specialHandling", "additionalInstructions",
    ]),
  },
  {
    formId: "truck",
    name: "Truck Registration",
    description: "Carriers register vehicles for verification.",
    status: "PUBLISHED",
    publicPath: "/register-truck",
    fields: JSON.stringify([
      "contactPerson", "companyName", "phone", "email", "truckType",
      "registrationNumber", "truckCapacity", "makeModel", "currentLocation",
      "routesCovered", "additionalInfo",
    ]),
  },
  {
    formId: "contact",
    name: "Contact Form",
    description: "General, transport and partnership enquiries.",
    status: "PUBLISHED",
    publicPath: "/contact",
    fields: JSON.stringify(["topic", "name", "company", "phone", "email", "message"]),
  },
];

async function main() {
  for (const p of pages) {
    await prisma.cmsPage.upsert({ where: { slug: p.slug }, create: p, update: {} });
  }
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, create: s, update: {} });
  }
  for (const f of forms) {
    await prisma.formDefinition.upsert({ where: { formId: f.formId }, create: f, update: {} });
  }
  console.log("[seed] Website pages, settings and form definitions are ready.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
