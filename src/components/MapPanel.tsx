import { MapPin, Minus, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Listing } from '../types';

type MapPanelProps = {
  listings: Listing[];
  selectedListing: Listing;
};

const ZOOM_STEPS = [0.82, 0.92, 1, 1.1, 1.22] as const;

export function MapPanel({ listings, selectedListing }: MapPanelProps) {
  const defaultIndex = ZOOM_STEPS.indexOf(1);
  const [zoomIndex, setZoomIndex] = useState(defaultIndex === -1 ? 2 : defaultIndex);
  const scale = ZOOM_STEPS[zoomIndex] ?? 1;

  const zoomSummary = useMemo(
    () => `Illustrative neighborhood map at ${Math.round(scale * 100)} percent zoom`,
    [scale],
  );

  function zoomIn() {
    setZoomIndex((current) => Math.min(current + 1, ZOOM_STEPS.length - 1));
  }

  function zoomOut() {
    setZoomIndex((current) => Math.max(current - 1, 0));
  }

  return (
    <section aria-label="Illustrative neighborhood map" className="map-panel">
      <p className="map-disclaimer">
        Stylized preview — not navigation grade cartography. Pins echo nearby listings.
      </p>
      <div className="map-viewport">
        <div
          aria-hidden="true"
          className="map-grid"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
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
        <div aria-label="Illustrative zoom controls" className="map-controls" role="group">
          <button
            aria-label="Zoom preview in"
            disabled={zoomIndex >= ZOOM_STEPS.length - 1}
            title={zoomSummary}
            type="button"
            onClick={zoomIn}
          >
            <Plus size={17} aria-hidden="true" />
          </button>
          <button
            aria-label="Zoom preview out"
            disabled={zoomIndex <= 0}
            title={zoomSummary}
            type="button"
            onClick={zoomOut}
          >
            <Minus size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="map-label label-greenpoint">Greenpoint</div>
      <div className="map-label label-williamsburg">Williamsburg</div>
      <div className="map-label label-bushwick">Bushwick</div>
      <div className="map-label label-bedstuy">Bedford-Stuyvesant</div>
    </section>
  );
}
