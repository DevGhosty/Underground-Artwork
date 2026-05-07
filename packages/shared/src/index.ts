import { z } from "zod";

export const listingStatusValues = ["Available", "Pending", "Sold"] as const;
export const listingAccentValues = ["red", "blue", "yellow", "teal", "magenta", "green"] as const;
export const listingSizeValues = ["standard", "tall", "wide"] as const;
export const listingsSortValues = ["newest", "nearby", "price"] as const;

export const maxListingsPageSize = 50;

export const listingStatusSchema = z.enum(listingStatusValues);
export const listingAccentSchema = z.enum(listingAccentValues);
export const listingSizeSchema = z.enum(listingSizeValues);
export const listingsSortSchema = z.enum(listingsSortValues);

export const listingSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  artist: z.string().min(1),
  price: z.number().nonnegative(),
  status: listingStatusSchema,
  medium: z.string().min(1),
  dimensions: z.string().min(1),
  neighborhood: z.string().min(1),
  borough: z.string().min(1),
  distance: z.number().nonnegative(),
  story: z.string().min(1),
  image: z.string().min(1),
  saved: z.boolean(),
  accent: listingAccentSchema,
  size: listingSizeSchema,
});

export const paginationMetaSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(maxListingsPageSize),
});

export const listingResponseSchema = z.object({
  data: listingSchema,
});

export const listingListResponseSchema = z.object({
  data: z.array(listingSchema),
  meta: paginationMetaSchema,
});

export const apiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: z.unknown().optional(),
  }),
});

export const listingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(maxListingsPageSize).default(20),
  search: z
    .string()
    .optional()
    .transform((s) => (s && s.trim() !== "" ? s.trim() : undefined)),
  sort: listingsSortSchema.default("newest"),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  maxDistance: z.coerce.number().optional(),
  medium: z.array(z.string().min(1)).default([]),
  status: z.array(listingStatusSchema).default([...listingStatusValues]),
});

export const listingIdParamSchema = z.coerce.number().int().positive();

export const contactBodySchema = z.object({
  listingId: z.number().int().positive(),
  message: z.string().trim().min(1).max(2000),
  contactHint: z.string().trim().max(500).optional(),
});

export type ListingStatus = z.infer<typeof listingStatusSchema>;
export type ListingAccent = z.infer<typeof listingAccentSchema>;
export type ListingSize = z.infer<typeof listingSizeSchema>;
export type ListingsSort = z.infer<typeof listingsSortSchema>;
export type Listing = z.infer<typeof listingSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type ListingResponse = z.infer<typeof listingResponseSchema>;
export type ListingListResponse = z.infer<typeof listingListResponseSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type ListingsQueryParsed = z.infer<typeof listingsQuerySchema>;
export type ContactBody = z.infer<typeof contactBodySchema>;

export type ListingsQuery = {
  search?: string;
  mediums: string[];
  statuses: ListingStatus[];
  minPrice?: number;
  maxPrice?: number;
  maxDistance?: number;
  sort: ListingsSort;
};

export type Pagination = {
  page: number;
  pageSize: number;
};

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
  const parsed = listingIdParamSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
