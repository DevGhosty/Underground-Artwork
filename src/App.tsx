import { Heart, LayoutGrid, ListFilter, MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ArtworkCard } from './components/ArtworkCard';
import { FilterRail } from './components/FilterRail';
import { ListingDetail } from './components/ListingDetail';
import { MapPanel } from './components/MapPanel';
import { listings as seedListings } from './data/listings';
import type { Listing } from './types';

const mediums = ['Print', 'Painting', 'Drawing', 'Mixed Media', 'Ceramic', 'Textile'];
const statuses = ['Available', 'Pending', 'Sold'] as const;

export default function App() {
  const [listings, setListings] = useState<Listing[]>(seedListings);
  const [selectedId, setSelectedId] = useState(seedListings[0].id);
  const [search, setSearch] = useState('');
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    'Available',
    'Pending',
    'Sold',
  ]);
  const [distance, setDistance] = useState(25);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return listings.filter((listing) => {
      const matchesSearch =
        !query ||
        [listing.title, listing.artist, listing.medium, listing.neighborhood, listing.borough]
          .join(' ')
          .toLowerCase()
          .includes(query);
      const matchesMedium =
        selectedMediums.length === 0 ||
        selectedMediums.some((medium) => listing.medium.toLowerCase().includes(medium.toLowerCase()));
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(listing.status);

      return matchesSearch && matchesMedium && matchesStatus && listing.distance <= distance;
    });
  }, [distance, listings, search, selectedMediums, selectedStatuses]);

  const selectedListing =
    listings.find((listing) => listing.id === selectedId) ?? filteredListings[0] ?? listings[0];

  function toggleSaved(id: number) {
    setListings((currentListings) =>
      currentListings.map((listing) =>
        listing.id === id ? { ...listing, saved: !listing.saved } : listing,
      ),
    );
  }

  function toggleMedium(medium: string) {
    setSelectedMediums((currentMediums) =>
      currentMediums.includes(medium)
        ? currentMediums.filter((item) => item !== medium)
        : [...currentMediums, medium],
    );
  }

  function toggleStatus(status: string) {
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
                {filteredListings.length} local pieces within{' '}
                <span className="linkish">{distance} miles</span>
              </p>
            </div>
            <div className="gallery-actions">
              <label>
                Sort:
                <select defaultValue="newest">
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

          <div className="artwork-grid">
            {filteredListings.map((listing) => (
              <ArtworkCard
                isSelected={listing.id === selectedListing.id}
                key={listing.id}
                listing={listing}
                onSaveToggle={toggleSaved}
                onSelect={setSelectedId}
              />
            ))}
          </div>

          {filteredListings.length === 0 && (
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
