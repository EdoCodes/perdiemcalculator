import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EMBED_PATH,
  WIDGET_IFRAME_HEIGHT,
  isEmbedPath,
  widgetEmbedSnippet,
  widgetEmbedSrc,
  widgetHomeHref
} from "./embedSnippet.ts";

describe("widgetEmbedSnippet", () => {
  it("points the iframe at the apex embed URL", () => {
    const html = widgetEmbedSnippet("https://perdiemcalculator.com/");
    assert.equal(widgetEmbedSrc("https://perdiemcalculator.com/"), "https://perdiemcalculator.com/embed/");
    assert.match(html, /src="https:\/\/perdiemcalculator\.com\/embed\/"/);
    assert.match(html, new RegExp(`height="${WIDGET_IFRAME_HEIGHT}"`));
    assert.match(html, /title="GSA per diem calculator"/);
    assert.equal(widgetHomeHref("https://perdiemcalculator.com"), "https://perdiemcalculator.com/");
    assert.match(html, /href="https:\/\/perdiemcalculator\.com\/"/);
  });

  it("does not emit www or a trailing-slash origin inside src", () => {
    const html = widgetEmbedSnippet("https://perdiemcalculator.com");
    assert.doesNotMatch(html, /www\.perdiemcalculator/);
    assert.doesNotMatch(html, /com\/\/embed/);
  });
});

describe("isEmbedPath", () => {
  it("matches the frameless embed route only", () => {
    assert.equal(isEmbedPath(EMBED_PATH), true);
    assert.equal(isEmbedPath("/embed/"), true);
    assert.equal(isEmbedPath("/widget/"), false);
    assert.equal(isEmbedPath("/"), false);
  });
});
