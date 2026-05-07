import type { Listing, ListingStatus } from "./types.js";
import { seedListings } from "./seed-listings.js";

export type ListingsSort = "newest" | "nearby" | "price";

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

const MAX_PAGE_SIZE = 50;

export function clampPageSize(n: number): number {
  return Math.min(Math.max(1, n), MAX_PAGE_SIZE);
}

export class InMemoryListingsRepository {
  private listings: Listing[];

  constructor(initial?: Listing[]) {
    this.listings = structuredClone(initial ?? seedListings);
  }

  findById(id: number): Listing | undefined {
    const row = this.listings.find((l) => l.id === id);
    return row ? structuredClone(row) : undefined;
  }

  findPage(query: ListingsQuery, pagination: Pagination): { items: Listing[]; total: number } {
    let rows = this.filterRows(query);
    rows = this.sortRows(rows, query.sort);
    const total = rows.length;
    const page = Math.max(1, pagination.page);
    const pageSize = clampPageSize(pagination.pageSize);
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize).map((r) => structuredClone(r));
    return { items, total };
  }

  private filterRows(q: ListingsQuery): Listing[] {
    const search = q.search?.trim().toLowerCase() ?? "";
    return this.listings.filter((listing) => {
      const hay = [listing.title, listing.artist, listing.medium, listing.neighborhood, listing.borough]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !search || hay.includes(search);
      const matchesMedium =
        q.mediums.length === 0 ||
        q.mediums.some((m) => listing.medium.toLowerCase().includes(m.toLowerCase()));
      const matchesStatus = q.statuses.length === 0 || q.statuses.includes(listing.status);
      const matchesMin = q.minPrice === undefined || listing.price >= q.minPrice;
      const matchesMax = q.maxPrice === undefined || listing.price <= q.maxPrice;
      const matchesDist = q.maxDistance === undefined || listing.distance <= q.maxDistance;
      return matchesSearch && matchesMedium && matchesStatus && matchesMin && matchesMax && matchesDist;
    });
  }

  private sortRows(rows: Listing[], sort: ListingsSort): Listing[] {
    const out = [...rows];
    if (sort === "nearby") {
      out.sort((a, b) => (a.distance !== b.distance ? a.distance - b.distance : b.id - a.id));
    } else if (sort === "price") {
      out.sort((a, b) => (a.price !== b.price ? a.price - b.price : b.id - a.id));
    } else {
      out.sort((a, b) => b.id - a.id);
    }
    return out;
  }
}
