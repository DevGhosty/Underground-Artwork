import { listingListResponseSchema } from '@underground-artwork/shared';
import type { Listing, ListingStatus, ListingsSort } from '@underground-artwork/shared';
import artwork01 from '../assets/artwork/artwork-01.webp';
import artwork02 from '../assets/artwork/artwork-02.webp';
import artwork03 from '../assets/artwork/artwork-03.webp';
import artwork04 from '../assets/artwork/artwork-04.webp';
import artwork05 from '../assets/artwork/artwork-05.webp';
import artwork06 from '../assets/artwork/artwork-06.webp';
import artwork07 from '../assets/artwork/artwork-07.webp';
import artwork08 from '../assets/artwork/artwork-08.webp';

const DEFAULT_API_URL = 'http://127.0.0.1:3000';

const artworkByApiPath: Record<string, string> = {
  '/artwork/artwork-01.webp': artwork01,
  '/artwork/artwork-02.webp': artwork02,
  '/artwork/artwork-03.webp': artwork03,
  '/artwork/artwork-04.webp': artwork04,
  '/artwork/artwork-05.webp': artwork05,
  '/artwork/artwork-06.webp': artwork06,
  '/artwork/artwork-07.webp': artwork07,
  '/artwork/artwork-08.webp': artwork08,
};

export type ListingsRequest = {
  search: string;
  mediums: string[];
  statuses: ListingStatus[];
  maxDistance: number;
  sort: ListingsSort;
  pageSize?: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');
}

function appendRepeated(params: URLSearchParams, key: string, values: string[]) {
  values.forEach((value) => {
    if (value) {
      params.append(key, value);
    }
  });
}

function resolveListingImages(listings: Listing[]): Listing[] {
  return listings.map((listing) => ({
    ...listing,
    image: artworkByApiPath[listing.image] ?? listing.image,
  }));
}

export async function fetchListings({
  search,
  mediums,
  statuses,
  maxDistance,
  sort,
  pageSize = 50,
}: ListingsRequest): Promise<Listing[]> {
  const params = new URLSearchParams({
    pageSize: String(pageSize),
    maxDistance: String(maxDistance),
    sort,
  });

  if (search.trim()) {
    params.set('search', search.trim());
  }
  appendRepeated(params, 'medium', mediums);
  appendRepeated(params, 'status', statuses);

  const response = await fetch(`${getApiBaseUrl()}/listings?${params.toString()}`);
  if (!response.ok) {
    throw new ApiError('Could not load artwork listings.', response.status);
  }

  const payload: unknown = await response.json();
  const parsed = listingListResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError('The listings response was not in the expected format.');
  }

  return resolveListingImages(parsed.data.data);
}
