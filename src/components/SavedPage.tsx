import { useQuery } from '@tanstack/react-query';
import { listingStatusValues } from '@underground-artwork/shared';
import { MapPin } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ListingStatus, ListingsSort } from '@underground-artwork/shared';
import type { SessionUser } from '../types';
import { fetchListings } from '../lib/api';
import { ArtworkCard } from './ArtworkCard';
import { TopNav } from './TopNav';

const mediums = ['Print', 'Painting', 'Drawing', 'Mixed Media', 'Ceramic', 'Textile'];
const statuses: ListingStatus[] = [...listingStatusValues];
const defaultDistance = 50;
const defaultSort: ListingsSort = 'newest';

type SavedPageProps = {
  currentUser: SessionUser | null;
  savedOverrides: Record<number, boolean>;
  setSavedOverrides: Dispatch<SetStateAction<Record<number, boolean>>>;
};

export function SavedPage({ currentUser, savedOverrides, setSavedOverrides }: SavedPageProps) {
  const navigate = useNavigate();

  const listingsQuery = useQuery({
    queryKey: ['listings', 'saved-page'],
    queryFn: () =>
      fetchListings({
        search: '',
        mediums,
        statuses,
        maxDistance: defaultDistance,
        sort: defaultSort,
        pageSize: 50,
      }),
  });

  const apiListings = listingsQuery.data ?? [];
  const listings = apiListings.map((listing) => ({
    ...listing,
    saved: savedOverrides[listing.id] ?? listing.saved,
  }));

  const savedListings = listings.filter((listing) => listing.saved);

  function toggleSaved(id: number) {
    const listing = listings.find((item) => item.id === id);
    if (!listing) return;
    setSavedOverrides((current) => ({ ...current, [id]: !listing.saved }));
  }

  function selectListing(id: number) {
    navigate(`/listings/${id}`);
  }

  return (
    <div className="app-shell">
      <TopNav active="saved" currentUser={currentUser} />

      <main className="saved-shell">
        <div className="saved-heading">
          <p className="section-note">Your wall</p>
          <h1>Saved artwork</h1>
          <p className="saved-subtitle">
            Pieces you’ve bookmarked stay here on this device until we ship accounts-backed saves.
          </p>
        </div>

        {listingsQuery.isLoading && (
          <div className="empty-state skeleton-pad" aria-busy="true">
            <MapPin size={24} aria-hidden="true" />
            <h2>Loading saved pieces…</h2>
            <p>Gathering listings to match against your saves.</p>
          </div>
        )}

        {listingsQuery.isError && (
          <div className="empty-state">
            <MapPin size={24} aria-hidden="true" />
            <h2>Could not load saved artwork.</h2>
            <p>Make sure the API server is running, then try again.</p>
            <button className="contact-button" type="button" onClick={() => listingsQuery.refetch()}>
              Retry
            </button>
          </div>
        )}

        {!listingsQuery.isLoading && !listingsQuery.isError && savedListings.length === 0 && (
          <div className="empty-state">
            <MapPin size={24} aria-hidden="true" />
            <h2>No saves yet.</h2>
            <p>Browse nearby work and tap the heart on any card to stash it here.</p>
            <Link className="contact-button" to="/">
              Browse artwork
            </Link>
          </div>
        )}

        {!listingsQuery.isLoading && !listingsQuery.isError && savedListings.length > 0 && (
          <div className="saved-grid">
            {savedListings.map((listing) => (
              <ArtworkCard
                isSelected={false}
                key={listing.id}
                listing={listing}
                onSaveToggle={toggleSaved}
                onSelect={selectListing}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
