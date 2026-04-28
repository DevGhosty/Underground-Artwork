import { MapPin, Minus, Plus } from 'lucide-react';
import type { Listing } from '../types';

type MapPanelProps = {
  listings: Listing[];
  selectedListing: Listing;
};

export function MapPanel({ listings, selectedListing }: MapPanelProps) {
  return (
    <section className="map-panel" aria-label="Neighborhood map">
      <div className="map-grid" aria-hidden="true">
        <span className="water-shape" />
        <span className="park-shape" />
        <span className="road road-one" />
        <span className="road road-two" />
        <span className="road road-three" />
        {listings.slice(0, 5).map((listing, index) => (
          <span
            className={`map-pin pin-${index + 1} ${
              listing.id === selectedListing.id ? 'is-selected' : ''
            }`}
            key={listing.id}
          >
            <MapPin size={26} />
          </span>
        ))}
      </div>
      <div className="map-label label-greenpoint">Greenpoint</div>
      <div className="map-label label-williamsburg">Williamsburg</div>
      <div className="map-label label-bushwick">Bushwick</div>
      <div className="map-label label-bedstuy">Bedford-Stuyvesant</div>
      <div className="map-controls" aria-label="Map controls">
        <button type="button" aria-label="Zoom in">
          <Plus size={17} aria-hidden="true" />
        </button>
        <button type="button" aria-label="Zoom out">
          <Minus size={17} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
