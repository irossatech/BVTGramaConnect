// `npm test`: the website's page addresses (src/website/routes.ts), which the sitemap and old #links rely on.
import assert from "node:assert/strict";
import { test } from "node:test";
import { PAGES, isPage, pageFromSlug, pathOf, subpageSlugs } from "../src/website/routes.ts";

test("every page has its own address and is found from it again", () => {
  assert.equal(pathOf("home"), "/");
  for (const p of PAGES.filter((x) => x !== "home")) {
    const path = pathOf(p);
    assert.match(path, /^\/[a-z]+\/$/);
    assert.equal(pageFromSlug(path.slice(1, -1)), p);
  }
});

test("the addresses search engines already know stay the same", () => {
  assert.deepEqual(subpageSlugs(), ["howitworks", "officials", "faq", "contact", "privacy", "terms"]);
});

test("unknown names are not pages", () => {
  assert.equal(isPage("how"), true);
  assert.equal(isPage("admin"), false);
  assert.equal(pageFromSlug("console"), null);
  assert.equal(pageFromSlug(""), null);
});
