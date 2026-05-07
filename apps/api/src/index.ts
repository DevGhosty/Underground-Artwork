import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  contactBodySchema,
  listingsQueryFromSearchParams,
  parseListingIdParam,
} from "@underground-artwork/shared";
import { InMemoryListingsRepository } from "./listings-repository.js";
import { rateLimitTake } from "./rate-limit.js";

function parseOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) return ["http://localhost:5173"];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const app = new Hono();
const repo = new InMemoryListingsRepository();
const maxContactRequestBytes = 16_384;

function readContactRateLimitKey(c: { req: { header: (name: string) => string | undefined } }) {
  if (process.env.TRUST_PROXY === "1") {
    const xf = c.req.header("x-forwarded-for");
    const hop = xf?.split(",")[0]?.trim();
    if (hop) return hop;
  }
  return (c.req.header("cf-connecting-ip") ?? "unknown").trim();
}

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: parseOrigins(process.env.WEB_ORIGINS),
  }),
);

app.onError((err, c) => {
  console.error(err);
  return c.json(
    { error: { code: "internal_error", message: "Something went wrong" } },
    500,
  );
});

app.notFound((c) => c.json({ error: { code: "not_found", message: "Not found" } }, 404));

app.get("/health", (c) => c.json({ ok: true }));

app.get("/listings", (c) => {
  const parsed = listingsQueryFromSearchParams(new URL(c.req.url).searchParams);
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: "validation_error",
          message: "Invalid query",
          details: parsed.error.flatten(),
        },
      },
      400,
    );
  }
  const q = parsed.data;
  const { items, total } = repo.findPage(
    {
      search: q.search,
      mediums: q.medium,
      statuses: q.status,
      minPrice: q.minPrice,
      maxPrice: q.maxPrice,
      maxDistance: q.maxDistance,
      category: q.category,
      sort: q.sort,
    },
    { page: q.page, pageSize: q.pageSize },
  );
  return c.json({
    data: items,
    meta: { total, page: q.page, pageSize: q.pageSize },
  });
});

app.get("/listings/:id", (c) => {
  const id = parseListingIdParam(c.req.param("id"));
  if (id === null) {
    return c.json(
      { error: { code: "validation_error", message: "Invalid listing id" } },
      400,
    );
  }
  const row = repo.findById(id);
  if (!row) {
    return c.json(
      { error: { code: "not_found", message: "Listing not found" } },
      404,
    );
  }
  return c.json({ data: row });
});

app.post("/contact", async (c) => {
  const ip = readContactRateLimitKey(c);
  const limited = rateLimitTake(`contact:${ip}`, 10, 60_000);
  if (!limited.ok) {
    c.header("Retry-After", String(limited.retryAfterSec));
    return c.json(
      { error: { code: "rate_limit", message: "Too many requests" } },
      429,
    );
  }

  const contentType = c.req.header("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return c.json(
      {
        error: {
          code: "unsupported_media_type",
          message: "Content-Type must be application/json",
        },
      },
      415,
    );
  }

  const raw = await c.req.text();
  if (new TextEncoder().encode(raw).length > maxContactRequestBytes) {
    return c.json(
      { error: { code: "payload_too_large", message: "Request body too large" } },
      413,
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return c.json(
      { error: { code: "bad_request", message: "Invalid JSON body" } },
      400,
    );
  }

  const parsed = contactBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: "validation_error",
          message: "Invalid body",
          details: parsed.error.flatten(),
        },
      },
      400,
    );
  }

  const listing = repo.findById(parsed.data.listingId);
  if (!listing) {
    return c.json(
      { error: { code: "not_found", message: "Listing not found" } },
      404,
    );
  }

  console.info("[contact stub]", {
    listingId: parsed.data.listingId,
    contactHint: parsed.data.contactHint,
    messageLen: parsed.data.message.length,
  });

  return c.json({ ok: true }, 201);
});

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://127.0.0.1:${info.port}`);
});
