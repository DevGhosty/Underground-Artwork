import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { SessionUser } from '../types';
import { demoUsers } from '../lib/session';

type SignInPageProps = {
  currentUser: SessionUser | null;
  onSignIn: (user: SessionUser) => void;
};

export function SignInPage({ currentUser, onSignIn }: SignInPageProps) {
  const navigate = useNavigate();

  function signInAs(user: SessionUser) {
    onSignIn(user);
    navigate('/account');
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="signin-title">
        <Link className="back-link" to="/">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to browse
        </Link>

        <p className="section-note">Demo access only.</p>
        <h1 id="signin-title">Choose a role</h1>
        <p>
          This stub defines the session boundary for V1 planning. It does not collect passwords,
          issue tokens, or persist account data on the server.
        </p>

        {currentUser && (
          <div className="session-banner">
            Signed in as <strong>{currentUser.displayName}</strong>.
          </div>
        )}

        <div className="demo-user-grid" aria-label="Demo sign-in roles">
          {demoUsers.map((user) => (
            <button key={user.id} type="button" onClick={() => signInAs(user)}>
              <span>{user.role}</span>
              <strong>{user.displayName}</strong>
              {user.artistHandle && <small>{user.artistHandle}</small>}
            </button>
          ))}
        </div>

        <p className="offline-note">
          <ShieldCheck size={18} aria-hidden="true" />
          Seller changes, favorites persistence, messages, and moderation stay protected until real
          authentication exists.
        </p>
      </section>
    </main>
  );
}
