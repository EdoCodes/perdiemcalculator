import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  localityShortName,
  slugifyLocalityName,
  uniqueLocalitySlugs
} from "./localitySlug.ts";

describe("slugifyLocalityName", () => {
  it("uses the primary city before a slash list", () => {
    assert.equal(
      slugifyLocalityName("Los Angeles / Orange / Ventura / Edwards AFB"),
      "los-angeles"
    );
  });

  it("strips punctuation and ampersands", () => {
    assert.equal(slugifyLocalityName("St. Louis"), "st-louis");
    assert.equal(slugifyLocalityName("Dallas & Fort Worth"), "dallas-and-fort-worth");
  });
});

describe("localityShortName", () => {
  it("returns the key city for GSA combo names", () => {
    assert.equal(
      localityShortName("San Francisco / San Mateo"),
      "San Francisco"
    );
  });
});

describe("uniqueLocalitySlugs", () => {
  it("keeps distinct names as distinct slugs", () => {
    const slugs = uniqueLocalitySlugs([
      { city: "Los Angeles", county: "Los Angeles", did: "1" },
      { city: "San Diego", county: "San Diego", did: "2" }
    ]);
    assert.deepEqual(slugs, ["los-angeles", "san-diego"]);
  });

  it("disambiguates collisions with county then DID", () => {
    const slugs = uniqueLocalitySlugs([
      { city: "Springfield", county: "Sangamon", did: "aaa" },
      { city: "Springfield", county: "Greene", did: "bbb" }
    ]);
    assert.equal(new Set(slugs).size, 2);
    assert.ok(slugs[0].startsWith("springfield"));
    assert.ok(slugs[1].startsWith("springfield"));
    assert.notEqual(slugs[0], slugs[1]);
  });
});
