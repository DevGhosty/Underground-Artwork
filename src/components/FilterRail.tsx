import type { ListingStatus } from '../types';

type FilterRailProps = {
  distance: number;
  mediums: string[];
  selectedMediums: string[];
  selectedStatuses: string[];
  statuses: readonly ListingStatus[];
  onDistanceChange: (distance: number) => void;
  onMediumToggle: (medium: string) => void;
  onReset: () => void;
  onStatusToggle: (status: string) => void;
};

const mediumCounts: Record<string, number> = {
  Print: 19,
  Painting: 28,
  Drawing: 15,
  'Mixed Media': 11,
  Ceramic: 8,
  Textile: 6,
};

const statusCounts: Record<ListingStatus, number> = {
  Available: 62,
  Pending: 12,
  Sold: 12,
};

export function FilterRail({
  distance,
  mediums,
  selectedMediums,
  selectedStatuses,
  statuses,
  onDistanceChange,
  onMediumToggle,
  onReset,
  onStatusToggle,
}: FilterRailProps) {
  return (
    <div className="filter-rail">
      <div className="filter-title-row">
        <h2>Filters</h2>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>

      <section className="filter-group">
        <h3>
          <span className="burst burst-red" aria-hidden="true" />
          Distance
        </h3>
        <div className="distance-value">{distance} miles</div>
        <input
          aria-label="Distance in miles"
          max="50"
          min="1"
          onChange={(event) => onDistanceChange(Number(event.target.value))}
          type="range"
          value={distance}
        />
        <div className="range-labels">
          <span>1 mi</span>
          <span>10 mi</span>
          <span>25 mi</span>
          <span>50 mi</span>
        </div>
      </section>

      <section className="filter-group">
        <h3>
          <span className="burst burst-blue" aria-hidden="true" />
          Medium
        </h3>
        {mediums.map((medium) => (
          <label className="check-row" key={medium}>
            <input
              checked={selectedMediums.includes(medium)}
              onChange={() => onMediumToggle(medium)}
              type="checkbox"
            />
            <span>{medium}</span>
            <small>{mediumCounts[medium]}</small>
          </label>
        ))}
      </section>

      <section className="filter-group">
        <h3>
          <span className="burst burst-yellow" aria-hidden="true" />
          Price
        </h3>
        <div className="price-inputs">
          <span>$ 0</span>
          <span>$ 2,000</span>
        </div>
        <div className="price-chips">
          {['All', 'Under $200', '$200 - $500', '$500 - $1k', '$1k+'].map((price) => (
            <button key={price} type="button">
              {price}
            </button>
          ))}
        </div>
      </section>

      <section className="filter-group">
        <h3>
          <span className="burst burst-magenta" aria-hidden="true" />
          Status
        </h3>
        {statuses.map((status) => (
          <label className="check-row status-row" key={status}>
            <input
              checked={selectedStatuses.includes(status)}
              onChange={() => onStatusToggle(status)}
              type="checkbox"
            />
            <span className={`status-dot status-${status.toLowerCase()}`} aria-hidden="true" />
            <span>{status}</span>
            <small>{statusCounts[status]}</small>
          </label>
        ))}
      </section>

      <div className="local-stamp">Art should be local.</div>
    </div>
  );
}
