import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SessionUser } from '../types';

type SellPageProps = {
  currentUser: SessionUser | null;
};

export function SellPage({ currentUser }: SellPageProps) {
  return (
    <main className="auth-shell">
      <section className="auth-card sell-card" aria-labelledby="sell-title">
        <Link className="back-link" to="/">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to browse
        </Link>

        <p className="section-note">Seller tools staged.</p>
        <h1 id="sell-title">Sell Artwork</h1>
        <p>
          Listing creation is intentionally paused until server-side authentication and ownership
          rules exist. This route gives the demo a real destination without opening unsafe
          mutations.
        </p>

        <div className="seller-next-steps" aria-label="Seller readiness checklist">
          <span>Auth-gated listing drafts</span>
          <span>Approximate neighborhood only</span>
          <span>Seller-owned status updates</span>
          <span>Offline contact handoff</span>
        </div>

        <Link className="contact-button" to={currentUser ? '/account' : '/signin'}>
          {currentUser ? 'View demo account' : 'Choose demo role'}
          <span aria-hidden="true">→</span>
        </Link>

        <p className="offline-note">
          <ShieldCheck size={18} aria-hidden="true" />
          No listing data is created or stored from this route yet.
        </p>
      </section>
    </main>
  );
}
