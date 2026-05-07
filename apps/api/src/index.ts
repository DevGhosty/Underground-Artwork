import { serve } from "@hono/node-server";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { pathToFileURL } from "node:url";
import {
  contactBodySchema,
  listingsQueryFromSearchParams,
  maxContactRequestBytes,
  parseListingIdParam,
} from "@underground-artwork/shared";
import {
  InMemoryListingsRepository,
  type ListingsRepository,
} from "./listings-repository.js";
import { rateLimitTake } from "./rate-limit.js";

function parseOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("WEB_ORIGINS must be set in production");
    }
    return ["http://localhost:5173"];
  }
  const origins = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return origins.map((origin) => {
    const parsed = new URL(origin);
    if (parsed.origin !== origin.replace(/\/$/, "")) {
      throw new Error(`WEB_ORIGINS entries must be exact origins: ${origin}`);
    }
    return parsed.origin;
  });
}

function isJsonRequest(c: Context): boolean {
  return (c.req.header("content-type") ?? "").toLowerCase().includes("application/json");
}

function readContentLength(c: Context): number | null {
  const raw = c.req.header("content-length");
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

async function readBoundedJson(c: Context): Promise<
  | { ok: true; body: unknown }
  | { ok: false; status: 400 | 413 | 415; code: string; message: string }
> {
  if (!isJsonRequest(c)) {
    return {
      ok: false,
      status: 415,
      code: "unsupported_media_type",
      message: "Content-Type must be application/json",
    };
  }

  const contentLength = readContentLength(c);
  if (contentLength !== null && contentLength > maxContactRequestBytes) {
    return {
      ok: false,
      status: 413,
      code: "payload_too_large",
      message: "Request body is too large",
    };
  }

  const rawBody = await c.req.text();
  if (new TextEncoder().encode(rawBody).length > maxContactRequestBytes) {
    return {
      ok: false,
      status: 413,
      code: "payload_too_large",
      message: "Request body is too large",
    };
  }

  try {
    return { ok: true, body: JSON.parse(rawBody) };
  } catch {
    return { ok: false, status: 400, code: "bad_request", message: "Invalid JSON body" };
  }
}

function readClientRateLimitKey(c: Context): string {
  if (process.env.TRUST_PROXY !== "true") return "direct";
  const forwardedFor = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    c.req.header("cf-connecting-ip")?.trim() ??
    c.req.header("x-real-ip")?.trim() ??
    forwardedFor ??
    "unknown"
  );
}

export function createApp(repo: ListingsRepository = new InMemoryListingsRepository()) {
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
    const clientKey = readClientRateLimitKey(c);
    const limited = rateLimitTake(`contact:${clientKey}`, 10, 60_000);
    if (!limited.ok) {
      c.header("Retry-After", String(limited.retryAfterSec));
      return c.json(
        { error: { code: "rate_limit", message: "Too many requests" } },
        429,
      );
    }

    const body = await readBoundedJson(c);
    if (!body.ok) {
      return c.json(
        { error: { code: body.code, message: body.message } },
        body.status,
      );
    }

    const parsed = contactBodySchema.safeParse(body.body);
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

    const listingLimited = rateLimitTake(
      `contact:${clientKey}:listing:${parsed.data.listingId}`,
      3,
      60_000,
    );
    if (!listingLimited.ok) {
      c.header("Retry-After", String(listingLimited.retryAfterSec));
      return c.json(
        { error: { code: "rate_limit", message: "Too many requests for this listing" } },
        429,
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
      hasContactHint: Boolean(parsed.data.contactHint),
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
