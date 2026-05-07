import { useQuery } from '@tanstack/react-query';
import { listingStatusValues } from '@underground-artwork/shared';
import { ArrowLeft, Heart } from 'lucide-react';
import { useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArtworkCard } from './ArtworkCard';
import { fetchListings } from '../lib/api';

type SavedPageProps = {
  savedOverrides: Record<number, boolean>;
  setSavedOverrides: Dispatch<SetStateAction<Record<number, boolean>>>;
};

export function SavedPage({ savedOverrides, setSavedOverrides }: SavedPageProps) {
  const navigate = useNavigate();
  const listingsQuery = useQuery({
    queryKey: ['saved-listings'],
    queryFn: () =>
      fetchListings({
        search: '',
        mediums: [],
        statuses: [...listingStatusValues],
        maxDistance: 50,
        sort: 'newest',
        pageSize: 50,
      }),
  });

  const listings = useMemo(
    () =>
      (listingsQuery.data ?? []).map((listing) => ({
        ...listing,
        saved: savedOverrides[listing.id] ?? listing.saved,
      })),
    [listingsQuery.data, savedOverrides],
  );
  const savedListings = listings.filter((listing) => listing.saved);

  function toggleSaved(id: number) {
    const listing = listings.find((item) => item.id === id);
    if (!listing) return;
    setSavedOverrides((current) => ({ ...current, [id]: !listing.saved }));
  }

  return (
    <main className="saved-page">
      <header className="route-header">
        <Link className="back-link" to="/">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to browse
        </Link>
        <p className="section-note">Client-only for now.</p>
        <h1>Saved Artwork</h1>
        <p>
          Saved pieces stay in this browser session until real authentication and per-user
          favorites exist.
        </p>
      </header>

      {listingsQuery.isLoading && (
        <div className="empty-state">
          <Heart size={24} aria-hidden="true" />
          <h2>Loading saved pieces...</h2>
        </div>
      )}

      {listingsQuery.isError && (
        <div className="empty-state">
          <Heart size={24} aria-hidden="true" />
          <h2>Could not load saved pieces.</h2>
          <button className="contact-button" type="button" onClick={() => listingsQuery.refetch()}>
            Retry
          </button>
        </div>
      )}

      {!listingsQuery.isLoading && !listingsQuery.isError && savedListings.length === 0 && (
        <div className="empty-state">
          <Heart size={24} aria-hidden="true" />
          <h2>No saved pieces yet.</h2>
          <p>Tap a heart on any listing to pin it here for this demo session.</p>
          <Link className="contact-button saved-empty-link" to="/">
            Browse artwork
          </Link>
        </div>
      )}

      {savedListings.length > 0 && (
        <div className="saved-grid">
          {savedListings.map((listing) => (
            <ArtworkCard
              isSelected={false}
              key={listing.id}
              listing={listing}
              onSaveToggle={toggleSaved}
              onSelect={(id) => navigate(`/listings/${id}`)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
