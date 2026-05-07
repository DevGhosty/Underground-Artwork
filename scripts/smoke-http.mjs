#!/usr/bin/env node
/**
 * Lightweight smoke check for the local API (no Cursor SDK required).
 * Usage: API_URL=http://127.0.0.1:3000 node scripts/smoke-http.mjs
 */

const base = (process.env.API_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

async function main() {
  const health = await fetch(`${base}/health`);
  if (!health.ok) {
    throw new Error(`GET /health failed: ${health.status}`);
  }
  const listings = await fetch(`${base}/listings?pageSize=5`);
  if (!listings.ok) {
    throw new Error(`GET /listings failed: ${listings.status}`);
  }
  const payload = await listings.json();
  const first = payload?.data?.[0];
  if (!first?.id) {
    throw new Error("Listings payload missing data[0].id");
  }
  const one = await fetch(`${base}/listings/${first.id}`);
  if (!one.ok) {
    throw new Error(`GET /listings/:id failed: ${one.status}`);
  }
  const contact = await fetch(`${base}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      listingId: first.id,
      message: "Smoke test — please ignore.",
    }),
  });
  if (contact.status !== 201) {
    throw new Error(`POST /contact expected 201, got ${contact.status}`);
  }
  console.log(`OK — smoke passed against ${base}`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
