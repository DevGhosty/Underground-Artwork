import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryListingsRepository } from "../dist/listings-repository.js";

const rows = [
  {
    id: 1,
    title: "Screen Noise",
    artist: "@one",
    price: 100,
    status: "Available",
    medium: "Screen Print",
    category: "prints",
    dimensions: "10 x 10 in",
    neighborhood: "Bushwick",
    borough: "Brooklyn",
    distance: 2,
    story: "One",
    image: "/one.webp",
    saved: false,
    accent: "red",
    size: "standard",
  },
  {
    id: 2,
    title: "Clay Blue",
    artist: "@two",
    price: 250,
    status: "Pending",
    medium: "Ceramic",
    category: "objects",
    dimensions: "5 x 5 in",
    neighborhood: "Ridgewood",
    borough: "Queens",
    distance: 1,
    story: "Two",
    image: "/two.webp",
    saved: true,
    accent: "blue",
    size: "standard",
  },
  {
    id: 3,
    title: "Ink Study",
    artist: "@three",
    price: 90,
    status: "Sold",
    medium: "Ink",
    category: "drawing",
    dimensions: "8 x 8 in",
    neighborhood: "Greenpoint",
    borough: "Brooklyn",
    distance: 3,
    story: "Three",
    image: "/three.webp",
    saved: false,
    accent: "green",
    size: "wide",
  },
];

test("findPage filters by search, medium, status, price, distance, and category", () => {
  const repo = new InMemoryListingsRepository(rows);

  const page = repo.findPage(
    {
      search: "screen",
      mediums: ["Print"],
      statuses: ["Available"],
      minPrice: 50,
      maxPrice: 150,
      maxDistance: 2,
      category: "prints",
      sort: "newest",
    },
    { page: 1, pageSize: 20 },
  );

  assert.equal(page.total, 1);
  assert.equal(page.items[0].id, 1);
});

test("findPage paginates after stable sorting", () => {
  const repo = new InMemoryListingsRepository(rows);

  const page = repo.findPage(
    {
      mediums: [],
      statuses: ["Available", "Pending", "Sold"],
      sort: "price",
    },
    { page: 2, pageSize: 1 },
  );

  assert.equal(page.total, 3);
  assert.equal(page.items.length, 1);
  assert.equal(page.items[0].id, 1);
});

test("findById returns cloned rows", () => {
  const repo = new InMemoryListingsRepository(rows);
  const row = repo.findById(1);

  assert.equal(row.id, 1);
  row.title = "Changed";

  assert.equal(repo.findById(1).title, "Screen Noise");
});
