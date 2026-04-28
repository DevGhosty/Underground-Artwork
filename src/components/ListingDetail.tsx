import { CalendarDays, Heart, ShieldCheck, Tag } from 'lucide-react';
import { StatusStamp } from './StatusStamp';
import type { Listing } from '../types';

type ListingDetailProps = {
  listing: Listing;
  onSaveToggle: (id: number) => void;
};

export function ListingDetail({ listing, onSaveToggle }: ListingDetailProps) {
  return (
    <article className={`listing-detail accent-${listing.accent}`}>
      <div className="detail-count">01 / 86</div>
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
          <a href="#artist">{listing.artist}</a>
          <strong>${listing.price}</strong>
          <p>{listing.medium}</p>
          <p>{listing.dimensions}</p>
          <p>
            {listing.neighborhood}, {listing.borough} <span>{listing.distance.toFixed(1)} mi</span>
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
          Listed May 12, 2024
        </span>
        <span>
          <Tag size={16} aria-hidden="true" />
          Signed
        </span>
      </div>

      <button className="contact-button" type="button">
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
