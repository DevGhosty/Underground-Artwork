import { z } from "zod";
import type { ListingStatus } from "./types.js";

const listingStatuses = ["Available", "Pending", "Sold"] as const;

export const listingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  search: z
    .string()
    .optional()
    .transform((s) => (s && s.trim() !== "" ? s.trim() : undefined)),
  sort: z.enum(["newest", "nearby", "price"]).default("newest"),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  maxDistance: z.coerce.number().optional(),
  medium: z.array(z.string().min(1)).default([]),
  status: z.array(z.enum(listingStatuses)).default([...listingStatuses]),
});

export type ListingsQueryParsed = z.infer<typeof listingsQuerySchema>;

export function listingsQueryFromSearchParams(sp: URLSearchParams) {
  const medium = sp.getAll("medium").filter((s) => s.length > 0);
  const statusRaw = sp.getAll("status").filter((s) => s.length > 0);
  return listingsQuerySchema.safeParse({
    page: sp.get("page") ?? undefined,
    pageSize: sp.get("pageSize") ?? undefined,
    search: sp.get("search") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    minPrice: sp.get("minPrice") ?? undefined,
    maxPrice: sp.get("maxPrice") ?? undefined,
    maxDistance: sp.get("maxDistance") ?? undefined,
    medium,
    status: statusRaw.length > 0 ? statusRaw : undefined,
  });
}

export function parseListingIdParam(raw: string | undefined): number | null {
  if (raw === undefined || raw === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

export const contactBodySchema = z.object({
  listingId: z.number().int().positive(),
  message: z.string().trim().min(1).max(2000),
  contactHint: z.string().trim().max(500).optional(),
});

export type ContactBody = z.infer<typeof contactBodySchema>;
