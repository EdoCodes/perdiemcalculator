import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCityPlacePages,
  cityPageQualifies,
  stripCensusPlaceSuffix,
  uniqueCitySlugs
} from "./cityPlaces.ts";

describe("stripCensusPlaceSuffix", () => {
  it("drops Census legal-type suffixes", () => {
    assert.equal(stripCensusPlaceSuffix("Los Angeles city"), "Los Angeles");
    assert.equal(stripCensusPlaceSuffix("East Los Angeles CDP"), "East Los Angeles");
    assert.equal(stripCensusPlaceSuffix("Prairie Grove village"), "Prairie Grove");
  });
});

describe("cityPageQualifies", () => {
  it("requires a 5-digit ZIP and a short county name", () => {
    assert.equal(cityPageQualifies({ county: "Los Angeles", zip: "91350" }), true);
    assert.equal(cityPageQualifies({ county: "Los Angeles", zip: "9135" }), false);
    assert.equal(
      cityPageQualifies({
        county: "Los Angeles / Orange / Ventura",
        zip: "90001"
      }),
      false
    );
  });
});

describe("uniqueCitySlugs", () => {
  it("skips cities whose slug is already a GSA NSA page", () => {
    const slugs = uniqueCitySlugs(
      [
        { name: "Los Angeles", county: "Los Angeles" },
        { name: "Santa Clarita", county: "Los Angeles" }
      ],
      new Set(["los-angeles"])
    );
    assert.equal(slugs[0], null);
    assert.equal(slugs[1], "santa-clarita");
  });

  it("disambiguates same city name in two counties", () => {
    const slugs = uniqueCitySlugs(
      [
        { name: "Franklin", county: "Sacramento" },
        { name: "Franklin", county: "Merced" }
      ],
      new Set()
    );
    assert.equal(new Set(slugs.filter(Boolean)).size, 2);
    assert.notEqual(slugs[0], slugs[1]);
  });
});

describe("buildCityPlacePages", () => {
  it("drops unmapped ZIPs and reserved NSA slugs", () => {
    const pages = buildCityPlacePages(
      [
        { name: "Los Angeles", county: "Los Angeles", zip: "90001", state: "CA" },
        { name: "Santa Clarita", county: "Los Angeles", zip: "91350", state: "CA" },
        { name: "Nowhere", county: "Modoc", zip: "99999", state: "CA" }
      ],
      new Set(["los-angeles"]),
      (zip) => zip !== "99999"
    );
    assert.deepEqual(
      pages.map((p) => p.slug),
      ["santa-clarita"]
    );
    assert.equal(pages[0]?.zip, "91350");
  });
});
