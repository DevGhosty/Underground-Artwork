import assert from "node:assert/strict";
import test from "node:test";
import {
  listingsQueryFromSearchParams,
  maxListingsPageSize,
} from "../dist/index.js";

test("listingsQueryFromSearchParams applies defaults", () => {
  const parsed = listingsQueryFromSearchParams(new URLSearchParams());

  assert.equal(parsed.success, true);
  assert.equal(parsed.data.page, 1);
  assert.equal(parsed.data.pageSize, 20);
  assert.equal(parsed.data.sort, "newest");
  assert.deepEqual(parsed.data.medium, []);
  assert.deepEqual(parsed.data.status, ["Available", "Pending", "Sold"]);
});

test("listingsQueryFromSearchParams parses filters used by the frontend", () => {
  const params = new URLSearchParams({
    search: "print",
    page: "2",
    pageSize: String(maxListingsPageSize),
    minPrice: "100",
    maxPrice: "500",
    maxDistance: "25",
    sort: "nearby",
    category: "prints",
  });
  params.append("medium", "Print");
  params.append("status", "Available");

  const parsed = listingsQueryFromSearchParams(params);

  assert.equal(parsed.success, true);
  assert.equal(parsed.data.search, "print");
  assert.equal(parsed.data.page, 2);
  assert.equal(parsed.data.pageSize, maxListingsPageSize);
  assert.equal(parsed.data.minPrice, 100);
  assert.equal(parsed.data.maxPrice, 500);
  assert.equal(parsed.data.maxDistance, 25);
  assert.equal(parsed.data.sort, "nearby");
  assert.equal(parsed.data.category, "prints");
  assert.deepEqual(parsed.data.medium, ["Print"]);
  assert.deepEqual(parsed.data.status, ["Available"]);
});

test("listingsQueryFromSearchParams rejects invalid page size and status", () => {
  const params = new URLSearchParams({
    pageSize: String(maxListingsPageSize + 1),
  });
  params.append("status", "Hidden");

  const parsed = listingsQueryFromSearchParams(params);

  assert.equal(parsed.success, false);
});
