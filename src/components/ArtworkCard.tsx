import { Heart } from 'lucide-react';
import { StatusStamp } from './StatusStamp';
import type { Listing } from '../types';

type ArtworkCardProps = {
  isSelected: boolean;
  listing: Listing;
  onSaveToggle: (id: number) => void;
  onSelect: (id: number) => void;
};

export function ArtworkCard({ isSelected, listing, onSaveToggle, onSelect }: ArtworkCardProps) {
  return (
    <article
      className={`art-card art-card-${listing.size} accent-${listing.accent} ${
        isSelected ? 'is-selected' : ''
      }`}
      onClick={() => onSelect(listing.id)}
    >
      <button
        className={`save-button ${listing.saved ? 'is-saved' : ''}`}
        type="button"
        aria-label={listing.saved ? `Unsave ${listing.title}` : `Save ${listing.title}`}
        onClick={(event) => {
          event.stopPropagation();
          onSaveToggle(listing.id);
        }}
      >
        <Heart size={18} aria-hidden="true" />
      </button>
      <div className="art-media">
        <img src={listing.image} alt={`${listing.title} by ${listing.artist}`} />
      </div>
      <div className="art-card-body">
        <div className="meta-line">
          <span className="distance-dot" aria-hidden="true" />
          {listing.distance.toFixed(1)} mi
        </div>
        <h2>{listing.title}</h2>
        <p>
          {listing.artist} <span>{listing.medium}</span>
        </p>
        <p>{listing.neighborhood}</p>
        <div className="card-footer">
          <strong>${listing.price}</strong>
          <StatusStamp status={listing.status} />
        </div>
      </div>
    </article>
  );
}
