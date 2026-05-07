import { Heart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SessionUser } from '../types';

export type NavActive = 'browse' | 'saved' | 'sell';

type TopNavProps = {
  active: NavActive;
  currentUser: SessionUser | null;
  showSearch?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
};

export function TopNav({
  active,
  currentUser,
  showSearch = false,
  search = '',
  onSearchChange,
}: TopNavProps) {
  return (
    <header className="topbar">
      <Link className="brand-mark" to="/" aria-label="Underground Artwork home">
        <span className="brand-stamp" aria-hidden="true" />
        <span>
          Underground
          <strong>Artwork</strong>
        </span>
      </Link>

      {showSearch && onSearchChange ? (
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search artwork, artist, medium, neighborhood..."
          />
        </label>
      ) : (
        <div className="topbar-spacer" aria-hidden="true" />
      )}

      <nav className="nav-links" aria-label="Main navigation">
        <Link className={active === 'browse' ? 'active' : undefined} to="/">
          Browse
        </Link>
        <Link className={active === 'sell' ? 'active' : undefined} to="/sell">
          Sell
        </Link>
        <Link className={`saved-link ${active === 'saved' ? 'active' : ''}`} to="/saved">
          <Heart size={18} aria-hidden="true" />
          Saved
        </Link>
        <Link className="sign-in" to={currentUser ? '/account' : '/signin'}>
          {currentUser ? currentUser.role : 'Sign in'}
        </Link>
      </nav>
    </header>
  );
}
