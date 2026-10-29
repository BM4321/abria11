import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNextPath, configuredSiteUrl } from "../safe-redirect";

const FALLBACK = "/operations/dashboard";

test("keeps same-origin paths with query and hash", () => {
  assert.equal(safeNextPath("/operations/requests?status=new#top", FALLBACK), "/operations/requests?status=new#top");
  assert.equal(safeNextPath("/admin", FALLBACK), "/admin");
});

test("rejects open-redirect payloads", () => {
  for (const evil of [
    "//evil.com",
    "//evil.com/operations",
    "/\\evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "evil.com",
    "/%0d%0aSet-Cookie:x",
    "/\t/evil.com",
    "",
    null,
    undefined,
  ]) {
    const out = safeNextPath(evil as string, FALLBACK);
    assert.ok(out.startsWith("/") && !out.startsWith("//"), `unsafe output for ${String(evil)}: ${out}`);
    if (evil && /evil|javascript|\t/.test(evil)) assert.equal(out, FALLBACK, String(evil));
  }
});

test("configuredSiteUrl only accepts http(s) origins", () => {
  const saved = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    process.env.NEXT_PUBLIC_SITE_URL = "https://abrialogistics.co.tz/some/path";
    assert.equal(configuredSiteUrl(), "https://abrialogistics.co.tz");
    process.env.NEXT_PUBLIC_SITE_URL = "javascript:alert(1)";
    assert.equal(configuredSiteUrl(), null);
    process.env.NEXT_PUBLIC_SITE_URL = "";
    assert.equal(configuredSiteUrl(), null);
  } finally {
    process.env.NEXT_PUBLIC_SITE_URL = saved;
  }
});
