import { useQuery } from '@tanstack/react-query';
import {
  listingCategoryValues,
  listingStatusValues,
  listingsSortValues,
} from '@underground-artwork/shared';
import { LayoutGrid, ListFilter, MapPin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import type { ListingCategory, ListingStatus, ListingsSort } from '@underground-artwork/shared';
import type { Listing, PriceBand, SessionUser } from './types';
import { AccountPage } from './components/AccountPage';
import { ArtworkCard } from './components/ArtworkCard';
import { ContactSellerDialog } from './components/ContactSellerDialog';
import { FilterRail } from './components/FilterRail';
import { ListingDetail } from './components/ListingDetail';
import { MapPanel } from './components/MapPanel';
import { SavedPage } from './components/SavedPage';
import { SellPage } from './components/SellPage';
import { SignInPage } from './components/SignInPage';
import { TopNav } from './components/TopNav';
import { listings as seedListings } from './data/listings';
import { fetchListing, fetchListings } from './lib/api';
import { loadSavedToggles, persistSavedToggles } from './lib/saved-storage';
import { clearStoredSession, readStoredSession, storeSession } from './lib/session';

const mediums = ['Print', 'Painting', 'Drawing', 'Mixed Media', 'Ceramic', 'Textile'];
const statuses: ListingStatus[] = [...listingStatusValues];
const defaultDistance = 25;
const defaultSort: ListingsSort = 'newest';

const categories: { label: string; value?: ListingCategory }[] = [
  { label: 'All' },
  { label: 'Prints', value: 'prints' },
  { label: 'Painting', value: 'painting' },
  { label: 'Drawing', value: 'drawing' },
  { label: 'Mixed Media', value: 'mixed-media' },
  { label: 'Objects', value: 'objects' },
];

const priceRanges: Record<PriceBand, { minPrice?: number; maxPrice?: number }> = {
  all: {},
  'under-200': { maxPrice: 199 },
  '200-500': { minPrice: 200, maxPrice: 500 },
  '500-1000': { minPrice: 500, maxPrice: 1000 },
  '1000-plus': { minPrice: 1000 },
};

type BrowsePageProps = {
  currentUser: SessionUser | null;
  savedOverrides: Record<number, boolean>;
  setSavedOverrides: Dispatch<SetStateAction<Record<number, boolean>>>;
};

export default function App() {
  const [savedOverrides, setSavedOverrides] = useState<Record<number, boolean>>(() =>
    loadSavedToggles(),
  );
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(() => readStoredSession());

  useEffect(() => {
    persistSavedToggles(savedOverrides);
  }, [savedOverrides]);

  function signIn(user: SessionUser) {
    storeSession(user);
    setCurrentUser(user);
  }

  function signOut() {
    clearStoredSession();
    setCurrentUser(null);
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <BrowsePage
            currentUser={currentUser}
            savedOverrides={savedOverrides}
            setSavedOverrides={setSavedOverrides}
          />
        }
      />
      <Route
        path="/listings/:listingId"
        element={
          <BrowsePage
            currentUser={currentUser}
            savedOverrides={savedOverrides}
            setSavedOverrides={setSavedOverrides}
          />
        }
      />
      <Route path="/signin" element={<SignInPage currentUser={currentUser} onSignIn={signIn} />} />
      <Route path="/account" element={<AccountPage currentUser={currentUser} onSignOut={signOut} />} />
      <Route
        path="/saved"
        element={
          <SavedPage
            currentUser={currentUser}
            savedOverrides={savedOverrides}
            setSavedOverrides={setSavedOverrides}
          />
        }
      />
      <Route path="/sell" element={<SellPage currentUser={currentUser} />} />
    </Routes>
  );
}

function BrowsePage({ currentUser, savedOverrides, setSavedOverrides }: BrowsePageProps) {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [contactListing, setContactListing] = useState<Listing | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const search = searchParams.get('search') ?? '';
  const selectedMediums = searchParams.getAll('medium').filter((medium) => mediums.includes(medium));
  const selectedStatuses = readStatuses(searchParams);
  const distance = readDistance(searchParams);
  const sort = readSort(searchParams);
  const selectedCategory = readCategory(searchParams);
  const selectedPrice = readPrice(searchParams);
  const priceRange = priceRanges[selectedPrice];

  const listingsQuery = useQuery({
    queryKey: [
      'listings',
      {
        search,
        selectedMediums,
        selectedStatuses,
        distance,
        sort,
        selectedCategory,
        selectedPrice,
      },
    ],
    queryFn: () =>
      fetchListings({
        search,
        mediums: selectedMediums,
        statuses: selectedStatuses,
        category: selectedCategory,
        minPrice: priceRange.minPrice,
        maxPrice: priceRange.maxPrice,
        maxDistance: distance,
        sort,
      }),
  });

  const apiListings = listingsQuery.data ?? [];
  const listings = useMemo(
    () =>
      apiListings.map((listing) => ({
        ...listing,
        saved: savedOverrides[listing.id] ?? listing.saved,
      })),
    [apiListings, savedOverrides],
  );

  const routeListingId = readListingId(listingId);
  const listingFromBatch =
    routeListingId !== null ? apiListings.find((listing) => listing.id === routeListingId) : undefined;

  const listingDetailQuery = useQuery({
    queryKey: ['listing', routeListingId],
    queryFn: () => fetchListing(routeListingId!),
    enabled:
      routeListingId !== null &&
      !listingsQuery.isLoading &&
      listingFromBatch === undefined,
  });

  const fetchedListing = listingDetailQuery.data;

  const browsingDefault = listings[0] ?? seedListings[0];

  const resolvedFromRoute =
    routeListingId === null
      ? undefined
      : listingFromBatch !== undefined
        ? {
            ...listingFromBatch,
            saved: savedOverrides[listingFromBatch.id] ?? listingFromBatch.saved,
          }
        : fetchedListing !== undefined
          ? {
              ...fetchedListing,
              saved: savedOverrides[fetchedListing.id] ?? fetchedListing.saved,
            }
          : undefined;

  const selectedListing =
    routeListingId === null ? browsingDefault : (resolvedFromRoute ?? browsingDefault);

  const showDetailSpinner =
    routeListingId !== null &&
    resolvedFromRoute === undefined &&
    (listingDetailQuery.isFetching || listingsQuery.isLoading);

  const showDetailMissing =
    routeListingId !== null &&
    resolvedFromRoute === undefined &&
    listingDetailQuery.isFetched &&
    !listingDetailQuery.isFetching &&
    listingDetailQuery.isError;

  const galleryIndex = apiListings.findIndex((listing) => listing.id === selectedListing.id);
  const detailPosition =
    galleryIndex >= 0 ? { index: galleryIndex + 1, total: apiListings.length } : undefined;

  const mapListings = listings.length > 0 ? listings : [selectedListing];

  function toggleSaved(id: number) {
    const fromGrid = listings.find((item) => item.id === id);
    const fromFetch =
      fetchedListing?.id === id
        ? { ...fetchedListing, saved: savedOverrides[id] ?? fetchedListing.saved }
        : undefined;
    const listing = fromGrid ?? fromFetch;
    if (!listing) return;
    const effectiveSaved = savedOverrides[id] ?? listing.saved;
    setSavedOverrides((current) => ({ ...current, [id]: !effectiveSaved }));
  }

  function updateSearchParams(update: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams);
    update(next);
    setSearchParams(next);
  }

  function updateSearch(value: string) {
    updateSearchParams((next) => {
      if (value.trim()) {
        next.set('search', value.trim());
      } else {
        next.delete('search');
      }
    });
  }

  function toggleMedium(medium: string) {
    const nextMediums = selectedMediums.includes(medium)
      ? selectedMediums.filter((item) => item !== medium)
      : mediums.filter((item) => item === medium || selectedMediums.includes(item));

    updateSearchParams((next) => {
      next.delete('medium');
      nextMediums.forEach((item) => next.append('medium', item));
    });
  }

  function toggleStatus(status: ListingStatus) {
    const nextStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((item) => item !== status)
      : statuses.filter((item) => item === status || selectedStatuses.includes(item));

    updateSearchParams((next) => {
      next.delete('status');
      if (nextStatuses.length > 0 && nextStatuses.length < statuses.length) {
        nextStatuses.forEach((item) => next.append('status', item));
      }
    });
  }

  function updateDistance(value: number) {
    updateSearchParams((next) => {
      if (value === defaultDistance) {
        next.delete('distance');
      } else {
        next.set('distance', String(value));
      }
    });
  }

  function updateSort(value: ListingsSort) {
    updateSearchParams((next) => {
      if (value === defaultSort) {
        next.delete('sort');
      } else {
        next.set('sort', value);
      }
    });
  }

  function updateCategory(value?: ListingCategory) {
    updateSearchParams((next) => {
      if (value) {
        next.set('category', value);
      } else {
        next.delete('category');
      }
    });
  }

  function updatePrice(value: PriceBand) {
    updateSearchParams((next) => {
      if (value === 'all') {
        next.delete('price');
      } else {
        next.set('price', value);
      }
    });
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams());
  }

  function selectListing(id: number) {
    const currentSearch = searchParams.toString();
    navigate({
      pathname: `/listings/${id}`,
      search: currentSearch ? `?${currentSearch}` : '',
    });
  }

  return (
    <div className="app-shell">
      <TopNav
        active="browse"
        currentUser={currentUser}
        search={search}
        showSearch
        onSearchChange={updateSearch}
      />

      <main className="browse-shell" id="browse">
        <button
          aria-controls="filter-panel"
          aria-expanded={showMobileFilters}
          className="mobile-filter-button"
          type="button"
          onClick={() => setShowMobileFilters((current) => !current)}
        >
          <ListFilter size={18} aria-hidden="true" />
          Filters
        </button>

        <aside id="filter-panel" className={`filter-column ${showMobileFilters ? 'is-open' : ''}`}>
          <FilterRail
            distance={distance}
            mediums={mediums}
            selectedMediums={selectedMediums}
            selectedPrice={selectedPrice}
            selectedStatuses={selectedStatuses}
            statuses={statuses}
            onDistanceChange={updateDistance}
            onMediumToggle={toggleMedium}
            onPriceChange={updatePrice}
            onReset={resetFilters}
            onStatusToggle={toggleStatus}
          />
        </aside>

        <section className="gallery-column" aria-label="Nearby artwork">
          <div className="gallery-heading">
            <div>
              <p className="section-note">Support local artists.</p>
              <h1>Nearby Artwork</h1>
              <p>
                {listings.length} local pieces within{' '}
                <span className="linkish">{distance} miles</span>
              </p>
            </div>
            <div className="gallery-actions">
              <label>
                Sort:
                <select
                  value={sort}
                  onChange={(event) => updateSort(event.target.value as ListingsSort)}
                >
                  <option value="newest">Newest</option>
                  <option value="nearby">Nearby</option>
                  <option value="price">Price</option>
                </select>
              </label>
              <button className="icon-button is-active" type="button" aria-label="Grid view">
                <LayoutGrid size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="category-strip" aria-label="Artwork categories">
            {categories.map((category) => (
              <button
                aria-pressed={category.value === selectedCategory}
                className={
                  category.value === selectedCategory ? 'category-tab is-active' : 'category-tab'
                }
                key={category.label}
                onClick={() => updateCategory(category.value)}
                type="button"
              >
                {category.label}
              </button>
            ))}
          </div>

          {listingsQuery.isLoading && (
            <div className="empty-state">
              <MapPin size={24} aria-hidden="true" />
              <h2>Loading nearby artwork...</h2>
              <p>Pulling the latest wall from the local marketplace.</p>
            </div>
          )}

          {listingsQuery.isError && (
            <div className="empty-state">
              <MapPin size={24} aria-hidden="true" />
              <h2>Could not load nearby artwork.</h2>
              <p>Make sure the API server is running, then try again.</p>
              <button
                className="contact-button"
                type="button"
                onClick={() => listingsQuery.refetch()}
              >
                Retry
              </button>
            </div>
          )}

          {!listingsQuery.isLoading && !listingsQuery.isError && (
            <div className="artwork-grid">
              {listings.map((listing) => (
                <ArtworkCard
                  isSelected={listing.id === selectedListing.id}
                  key={listing.id}
                  listing={listing}
                  onSaveToggle={toggleSaved}
                  onSelect={selectListing}
                />
              ))}
            </div>
          )}

          {!listingsQuery.isLoading && !listingsQuery.isError && listings.length === 0 && (
            <div className="empty-state">
              <MapPin size={24} aria-hidden="true" />
              <h2>No nearby pieces match those filters.</h2>
              <p>Try a wider distance or clear a medium to reopen the wall.</p>
            </div>
          )}
        </section>

        <aside className="detail-column" aria-label="Selected artwork">
          <MapPanel
            listings={mapListings}
            selectedListing={selectedListing}
            onListingSelect={selectListing}
          />
          {showDetailSpinner && (
            <article aria-busy="true" className="listing-detail listing-detail--loading">
              <h2>Loading listing…</h2>
              <p>Fetching artwork details for this link.</p>
            </article>
          )}
          {showDetailMissing && (
            <article className="listing-detail listing-detail--error">
              <h2>Listing unavailable</h2>
              <p>That ID is missing or hidden by filters. Adjust filters or return home.</p>
              <Link className="contact-button" to="/">
                Back to browse
              </Link>
            </article>
          )}
          {!showDetailSpinner && !showDetailMissing && (
            <ListingDetail
              detailPosition={detailPosition}
              listing={selectedListing}
              onContactClick={() => setContactListing(selectedListing)}
              onSaveToggle={toggleSaved}
            />
          )}
        </aside>
      </main>

      <ContactSellerDialog listing={contactListing} onClose={() => setContactListing(null)} />
    </div>
  );
}

function readStatuses(searchParams: URLSearchParams): ListingStatus[] {
  const nextStatuses = searchParams.getAll('status').filter(isListingStatus);
  return nextStatuses.length > 0 ? nextStatuses : statuses;
}

function readDistance(searchParams: URLSearchParams): number {
  const distanceParam = searchParams.get('distance');
  if (distanceParam === null) return defaultDistance;
  const rawDistance = Number(distanceParam);
  if (!Number.isFinite(rawDistance)) return defaultDistance;
  return Math.min(Math.max(Math.round(rawDistance), 1), 50);
}

function readSort(searchParams: URLSearchParams): ListingsSort {
  const sort = searchParams.get('sort');
  return sort && isListingsSort(sort) ? sort : defaultSort;
}

function readCategory(searchParams: URLSearchParams): ListingCategory | undefined {
  const category = searchParams.get('category');
  return category && isListingCategory(category) ? category : undefined;
}

function readPrice(searchParams: URLSearchParams): PriceBand {
  const price = searchParams.get('price');
  return price && isPriceBand(price) ? price : 'all';
}

function readListingId(listingId: string | undefined): number | null {
  const id = Number(listingId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function isListingStatus(value: string): value is ListingStatus {
  return (listingStatusValues as readonly string[]).includes(value);
}

function isListingCategory(value: string): value is ListingCategory {
  return (listingCategoryValues as readonly string[]).includes(value);
}

function isListingsSort(value: string): value is ListingsSort {
  return (listingsSortValues as readonly string[]).includes(value);
}

function isPriceBand(value: string): value is PriceBand {
  return Object.prototype.hasOwnProperty.call(priceRanges, value);
}
