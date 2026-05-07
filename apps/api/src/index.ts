import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { pathToFileURL } from "node:url";
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

export function createApp(repo = new InMemoryListingsRepository()) {
  const app = new Hono();

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
    const xf = c.req.header("x-forwarded-for");
    const ip = (xf?.split(",")[0] ?? c.req.header("cf-connecting-ip") ?? "unknown").trim();
    const limited = rateLimitTake(`contact:${ip}`, 10, 60_000);
    if (!limited.ok) {
      c.header("Retry-After", String(limited.retryAfterSec));
      return c.json(
        { error: { code: "rate_limit", message: "Too many requests" } },
        429,
      );
    }

    let body: unknown;
    try {
      body = await c.req.json();
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

  return app;
}

function startServer() {
  const port = Number(process.env.PORT) || 3000;
  serve({ fetch: createApp().fetch, port }, (info) => {
    console.log(`API listening on http://127.0.0.1:${info.port}`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
