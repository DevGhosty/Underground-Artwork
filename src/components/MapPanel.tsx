import { MapPin, Minus, Plus } from 'lucide-react';
import type { Listing } from '../types';

type MapPanelProps = {
  listings: Listing[];
  onListingSelect: (id: number) => void;
  selectedListing: Listing;
};

export function MapPanel({ listings, onListingSelect, selectedListing }: MapPanelProps) {
  return (
    <section className="map-panel" aria-label="Neighborhood map">
      <div className="map-grid" aria-hidden="true">
        <span className="water-shape" />
        <span className="park-shape" />
        <span className="road road-one" />
        <span className="road road-two" />
        <span className="road road-three" />
      </div>
      <div className="map-pins" aria-label="Map listings">
        {listings.slice(0, 5).map((listing, index) => (
          <button
            aria-label={`Show ${listing.title} in ${listing.neighborhood}`}
            className={`map-pin pin-${index + 1} ${
              listing.id === selectedListing.id ? 'is-selected' : ''
            }`}
            key={listing.id}
            onClick={() => onListingSelect(listing.id)}
            type="button"
          >
            <MapPin size={26} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="map-label label-greenpoint">Greenpoint</div>
      <div className="map-label label-williamsburg">Williamsburg</div>
      <div className="map-label label-bushwick">Bushwick</div>
      <div className="map-label label-bedstuy">Bedford-Stuyvesant</div>
      <div className="map-controls" aria-label="Map controls">
        <button type="button" aria-label="Zoom in unavailable in demo" disabled>
          <Plus size={17} aria-hidden="true" />
        </button>
        <button type="button" aria-label="Zoom out unavailable in demo" disabled>
          <Minus size={17} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
