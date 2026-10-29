// Integration test for staff access resolution. Needs a disposable Postgres
// database with migrations applied: set TEST_DATABASE_URL to run it. It is
// skipped otherwise, and it refuses to run against a Supabase host.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const url = process.env.TEST_DATABASE_URL;
const skip = !url ? "TEST_DATABASE_URL not set" : /supabase\.(co|com)/.test(url) ? "refusing to run against Supabase" : false;

if (!skip) process.env.DATABASE_URL = url;

// Imported lazily so DATABASE_URL is set before Prisma initialises.
let ensureOpsUser: typeof import("../provision").ensureOpsUser;
let prisma: typeof import("../prisma").prisma;

before(async () => {
  if (skip) return;
  ({ ensureOpsUser } = await import("../provision"));
  ({ prisma } = await import("../prisma"));
  await prisma.opsUser.deleteMany({ where: { email: { endsWith: "@provision.test" } } });
  await prisma.opsUser.deleteMany({ where: { email: "admin@abria.co.tz" } });
});

after(async () => {
  if (skip) return;
  await prisma.opsUser.deleteMany({ where: { email: { endsWith: "@provision.test" } } });
  await prisma.opsUser.deleteMany({ where: { email: "admin@abria.co.tz" } });
  await prisma.$disconnect();
});

test("an unknown signed-in user gets no staff access and no row", { skip }, async () => {
  const result = await ensureOpsUser({ id: "u-stranger", email: "stranger@provision.test", emailConfirmed: true });
  assert.equal(result, null);
  assert.equal(await prisma.opsUser.count({ where: { email: "stranger@provision.test" } }), 0);
});

test("the first user is NOT auto-promoted to admin", { skip }, async () => {
  const admins = await prisma.opsUser.count({ where: { role: "ADMIN" } });
  const result = await ensureOpsUser({ id: "u-first", email: "first@provision.test", emailConfirmed: true });
  assert.equal(result, null, `got access with ${admins} existing admins`);
});

test("a provisioned active user resolves with their role", { skip }, async () => {
  await prisma.opsUser.create({ data: { email: "ops@provision.test", name: "Ops", role: "OPERATIONS" } });
  const result = await ensureOpsUser({ id: "x", email: "OPS@provision.test", emailConfirmed: false });
  assert.equal(result?.role, "OPERATIONS");
});

test("a deactivated user is denied", { skip }, async () => {
  await prisma.opsUser.create({ data: { email: "gone@provision.test", name: "Gone", role: "ADMIN", active: false } });
  assert.equal(await ensureOpsUser({ id: "y", email: "gone@provision.test", emailConfirmed: true }), null);
});

test("a known admin address needs a confirmed email before it is provisioned", { skip }, async () => {
  assert.equal(await ensureOpsUser({ id: "a1", email: "admin@abria.co.tz", emailConfirmed: false }), null);
  const confirmed = await ensureOpsUser({ id: "a1", email: "admin@abria.co.tz", emailConfirmed: true });
  assert.equal(confirmed?.role, "ADMIN");
});
