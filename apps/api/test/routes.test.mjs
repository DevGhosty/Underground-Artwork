import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../dist/index.js";

async function readJson(response) {
  return response.json();
}

test("GET /health returns an ok payload", async () => {
  const app = createApp();

  const response = await app.request("/health");
  const body = await readJson(response);

  assert.equal(response.status, 200);
  assert.deepEqual(body, { ok: true });
});

test("GET /listings validates query params", async () => {
  const app = createApp();

  const response = await app.request("/listings?pageSize=999");
  const body = await readJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "validation_error");
});

test("GET /listings/:id returns 404 for missing listings", async () => {
  const app = createApp();

  const response = await app.request("/listings/9999");
  const body = await readJson(response);

  assert.equal(response.status, 404);
  assert.equal(body.error.code, "not_found");
});

test("POST /contact validates JSON bodies", async () => {
  const app = createApp();

  const response = await app.request("/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "bad-json-test",
    },
    body: "not-json",
  });
  const body = await readJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "bad_request");
});

test("POST /contact rate limits repeated requests", async () => {
  const app = createApp();
  const request = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "rate-limit-test",
    },
    body: JSON.stringify({
      listingId: 1,
      message: "Is this still available?",
      contactHint: "maya@example.test",
    }),
  };

  for (let i = 0; i < 10; i += 1) {
    const response = await app.request("/contact", request);
    assert.equal(response.status, 201);
  }

  const limited = await app.request("/contact", request);
  const body = await readJson(limited);

  assert.equal(limited.status, 429);
  assert.equal(body.error.code, "rate_limit");
});
