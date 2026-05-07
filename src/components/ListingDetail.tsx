import { CalendarDays, Heart, ShieldCheck, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Listing } from '../types';
import { StatusStamp } from './StatusStamp';

type ListingDetailProps = {
  listing: Listing;
  detailPosition?: { index: number; total: number };
  onContactClick: () => void;
  onSaveToggle: (id: number) => void;
};

export function ListingDetail({
  listing,
  detailPosition,
  onContactClick,
  onSaveToggle,
}: ListingDetailProps) {
  const countLabel = detailPosition
    ? `${String(detailPosition.index).padStart(2, '0')} / ${detailPosition.total}`
    : `#${listing.id}`;

  return (
    <article className={`listing-detail accent-${listing.accent}`}>
      <div className="detail-count">{countLabel}</div>
      <StatusStamp status={listing.status} />
      <button
        className={`detail-save ${listing.saved ? 'is-saved' : ''}`}
        type="button"
        aria-label={listing.saved ? `Unsave ${listing.title}` : `Save ${listing.title}`}
        onClick={() => onSaveToggle(listing.id)}
      >
        <Heart size={18} aria-hidden="true" />
      </button>

      <div className="detail-main">
        <img src={listing.image} alt={`${listing.title} by ${listing.artist}`} />
        <div>
          <h2>{listing.title}</h2>
          <Link to={`/?search=${encodeURIComponent(listing.artist)}`}>{listing.artist}</Link>
          <strong>${listing.price}</strong>
          <p>{listing.medium}</p>
          <p>{listing.dimensions}</p>
          <p>
            {listing.neighborhood}, {listing.borough}{' '}
            <span>{listing.distance.toFixed(1)} mi</span>
          </p>
        </div>
      </div>

      <div className="story-block">
        <h3>Story</h3>
        <p>{listing.story}</p>
      </div>

      <div className="detail-tags" aria-label="Listing details">
        <span>
          <CalendarDays size={16} aria-hidden="true" />
          Meet locally · verify in person
        </span>
        <span>
          <Tag size={16} aria-hidden="true" />
          {listing.medium}
        </span>
      </div>

      <button className="contact-button" type="button" onClick={onContactClick}>
        Contact seller
        <span aria-hidden="true">→</span>
      </button>

      <p className="offline-note">
        <ShieldCheck size={18} aria-hidden="true" />
        Meet offline. Verify in person.
      </p>
    </article>
  );
}
