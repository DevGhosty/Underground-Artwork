import { useQuery } from '@tanstack/react-query';
import { Heart, LayoutGrid, ListFilter, MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ListingStatus, ListingsSort } from '@underground-artwork/shared';
import { ArtworkCard } from './components/ArtworkCard';
import { FilterRail } from './components/FilterRail';
import { ListingDetail } from './components/ListingDetail';
import { MapPanel } from './components/MapPanel';
import { listings as seedListings } from './data/listings';
import { fetchListings } from './lib/api';

const mediums = ['Print', 'Painting', 'Drawing', 'Mixed Media', 'Ceramic', 'Textile'];
const statuses: ListingStatus[] = ['Available', 'Pending', 'Sold'];

export default function App() {
  const [selectedId, setSelectedId] = useState(seedListings[0].id);
  const [search, setSearch] = useState('');
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ListingStatus[]>([
    'Available',
    'Pending',
    'Sold',
  ]);
  const [distance, setDistance] = useState(25);
  const [sort, setSort] = useState<ListingsSort>('newest');
  const [savedOverrides, setSavedOverrides] = useState<Record<number, boolean>>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const listingsQuery = useQuery({
    queryKey: ['listings', { search, selectedMediums, selectedStatuses, distance, sort }],
    queryFn: () =>
      fetchListings({
        search,
        mediums: selectedMediums,
        statuses: selectedStatuses,
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

  const selectedListing =
    listings.find((listing) => listing.id === selectedId) ?? listings[0] ?? seedListings[0];

  function toggleSaved(id: number) {
    const listing = listings.find((item) => item.id === id);
    if (!listing) return;
    setSavedOverrides((current) => ({ ...current, [id]: !listing.saved }));
  }

  function toggleMedium(medium: string) {
    setSelectedMediums((currentMediums) =>
      currentMediums.includes(medium)
        ? currentMediums.filter((item) => item !== medium)
        : [...currentMediums, medium],
    );
  }

  function toggleStatus(status: ListingStatus) {
    setSelectedStatuses((currentStatuses) =>
      currentStatuses.includes(status)
        ? currentStatuses.filter((item) => item !== status)
        : [...currentStatuses, status],
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand-mark" href="/" aria-label="Underground Artwork home">
          <span className="brand-stamp" aria-hidden="true" />
          <span>
            Underground
            <strong>Artwork</strong>
          </span>
        </a>

        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search artwork, artist, medium, neighborhood..."
          />
        </label>

        <nav className="nav-links" aria-label="Main navigation">
          <a className="active" href="#browse">
            Browse
          </a>
          <a href="#sell">Sell</a>
          <a className="saved-link" href="#saved">
            <Heart size={18} aria-hidden="true" />
            Saved
          </a>
          <a className="sign-in" href="#signin">
            Sign in
          </a>
        </nav>
      </header>

      <main className="browse-shell" id="browse">
        <button
          className="mobile-filter-button"
          type="button"
          onClick={() => setShowMobileFilters((current) => !current)}
        >
          <ListFilter size={18} aria-hidden="true" />
          Filters
        </button>

        <aside className={`filter-column ${showMobileFilters ? 'is-open' : ''}`}>
          <FilterRail
            distance={distance}
            mediums={mediums}
            selectedMediums={selectedMediums}
            selectedStatuses={selectedStatuses}
            statuses={statuses}
            onDistanceChange={setDistance}
            onMediumToggle={toggleMedium}
            onReset={() => {
              setSearch('');
              setSelectedMediums([]);
              setSelectedStatuses(['Available', 'Pending', 'Sold']);
              setDistance(25);
              setSort('newest');
            }}
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
                  onChange={(event) => setSort(event.target.value as ListingsSort)}
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
            {['All', 'Prints', 'Painting', 'Drawing', 'Mixed Media', 'Objects'].map((category) => (
              <button
                className={category === 'All' ? 'category-tab is-active' : 'category-tab'}
                key={category}
                type="button"
              >
                {category}
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
                  onSelect={setSelectedId}
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
          <MapPanel listings={listings} selectedListing={selectedListing} />
          <ListingDetail listing={selectedListing} onSaveToggle={toggleSaved} />
        </aside>
      </main>
    </div>
  );
}
