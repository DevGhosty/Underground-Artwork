import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import type { SessionUser } from '../types';

type AccountPageProps = {
  currentUser: SessionUser | null;
  onSignOut: () => void;
};

export function AccountPage({ currentUser, onSignOut }: AccountPageProps) {
  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="account-title">
        <Link className="back-link" to="/">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to browse
        </Link>

        <p className="section-note">Demo session</p>
        <h1 id="account-title">{currentUser.displayName}</h1>
        <dl className="account-summary">
          <div>
            <dt>Role</dt>
            <dd>{currentUser.role}</dd>
          </div>
          {currentUser.artistHandle && (
            <div>
              <dt>Artist handle</dt>
              <dd>{currentUser.artistHandle}</dd>
            </div>
          )}
          <div>
            <dt>Session type</dt>
            <dd>Client-only demo</dd>
          </div>
        </dl>

        <button className="contact-button" type="button" onClick={onSignOut}>
          <LogOut size={18} aria-hidden="true" />
          Sign out
        </button>

        <p className="offline-note">
          <ShieldCheck size={18} aria-hidden="true" />
          No account data is stored in the API or database yet.
        </p>
      </section>
    </main>
  );
}
