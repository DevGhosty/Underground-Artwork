import { Megaphone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SessionUser } from '../types';
import { TopNav } from './TopNav';

type SellPageProps = {
  currentUser: SessionUser | null;
};

export function SellPage({ currentUser }: SellPageProps) {
  return (
    <div className="app-shell">
      <TopNav active="sell" currentUser={currentUser} />

      <main className="sell-shell">
        <section className="sell-card" aria-labelledby="sell-title">
          <p className="section-note">Seller tools</p>
          <h1 id="sell-title">
            <Megaphone size={28} aria-hidden="true" /> List your work
          </h1>
          <p>
            Uploads, payouts, and moderation are still getting wired. For now this page is a calm place
            to explain how Underground Artwork thinks about selling in real life.
          </p>
          <ul className="sell-points">
            <li>Meet buyers offline in neighborhoods you already trust.</li>
            <li>No public DMs — coordinate handoffs after you both opt in.</li>
            <li>Pricing and authenticity checks stay between humans.</li>
          </ul>
          <div className="sell-actions">
            <Link className="contact-button" to="/">
              Back to browse
            </Link>
            <button className="ghost-button" disabled type="button">
              Start a listing (soon)
            </button>
          </div>
          <p className="offline-note">
            <ShieldCheck size={18} aria-hidden="true" />
            Listing creation will open once uploads and verification ship on the API.
          </p>
        </section>
      </main>
    </div>
  );
}
