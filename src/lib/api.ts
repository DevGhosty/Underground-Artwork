import {
  apiErrorResponseSchema,
  contactBodySchema,
  listingListResponseSchema,
  listingResponseSchema,
} from '@underground-artwork/shared';
import type {
  ContactBody,
  Listing,
  ListingCategory,
  ListingStatus,
  ListingsSort,
} from '@underground-artwork/shared';
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
  category?: ListingCategory;
  minPrice?: number;
  maxPrice?: number;
  maxDistance: number;
  sort: ListingsSort;
  pageSize?: number;
};

export type ContactSellerRequest = {
  listingId: number;
  message: string;
  contactHint?: string;
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

function resolveListingImage(listing: Listing): Listing {
  return {
    ...listing,
    image: artworkByApiPath[listing.image] ?? listing.image,
  };
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json();
    const parsed = apiErrorResponseSchema.safeParse(payload);
    if (parsed.success) {
      return parsed.data.error.message;
    }
  } catch {
    /* ignore */
  }
  return response.statusText || 'Request failed';
}

export async function fetchListings({
  search,
  mediums,
  statuses,
  category,
  minPrice,
  maxPrice,
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
  if (category) {
    params.set('category', category);
  }
  if (minPrice !== undefined) {
    params.set('minPrice', String(minPrice));
  }
  if (maxPrice !== undefined) {
    params.set('maxPrice', String(maxPrice));
  }
  appendRepeated(params, 'medium', mediums);
  appendRepeated(params, 'status', statuses);

  const response = await fetch(`${getApiBaseUrl()}/listings?${params.toString()}`);
  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  const payload: unknown = await response.json();
  const parsed = listingListResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError('The listings response was not in the expected format.');
  }

  return resolveListingImages(parsed.data.data);
}

export async function fetchListing(id: number): Promise<Listing> {
  const response = await fetch(`${getApiBaseUrl()}/listings/${id}`);
  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  const payload: unknown = await response.json();
  const parsed = listingResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError('The listing response was not in the expected format.');
  }

  return resolveListingImage(parsed.data.data);
}

export async function sendContact(body: ContactBody): Promise<void> {
  const validated = contactBodySchema.safeParse(body);
  if (!validated.success) {
    throw new ApiError('Please check your message and try again.');
  }

  const response = await fetch(`${getApiBaseUrl()}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated.data),
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }
}

/** @deprecated Prefer sendContact with ContactBody — kept for compatibility */
export async function sendContactRequest({
  listingId,
  message,
  contactHint,
}: ContactSellerRequest): Promise<void> {
  return sendContact({
    listingId,
    message,
    contactHint: contactHint?.trim() || undefined,
  });
}
