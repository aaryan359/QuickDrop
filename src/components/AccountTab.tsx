import React, { useState } from 'react';
import type { QuickDropUser } from '../types';

interface AccountTabProps {
  backendMode: string;
  isFirebaseReady: boolean;
  user: QuickDropUser | null;
  onGoogleSignIn: () => Promise<void>;
  onEmailSignIn: (email: string, password: string) => Promise<void>;
  onEmailCreate: (email: string, password: string) => Promise<void>;
  onAnonymousSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

export const AccountTab: React.FC<AccountTabProps> = ({
  backendMode,
  isFirebaseReady,
  user,
  onGoogleSignIn,
  onEmailSignIn,
  onEmailCreate,
  onAnonymousSignIn,
  onSignOut,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitEmail = (action: 'sign-in' | 'create') => {
    if (!email.trim() || !password.trim()) return;
    if (action === 'create') {
      onEmailCreate(email.trim(), password);
    } else {
      onEmailSignIn(email.trim(), password);
    }
  };

  return (
    <div className="settings-page">
      <div className="input-section">
        <h3>Account</h3>
        <div className="status-grid">
          <div>
            <span className="status-label">Backend</span>
            <strong>{backendMode}</strong>
          </div>
          <div>
            <span className="status-label">Firebase</span>
            <strong>{isFirebaseReady ? 'Configured' : 'Missing env'}</strong>
          </div>
        </div>

        {user ? (
          <div className="account-card">
            {user.photoURL && <img src={user.photoURL} alt="" className="account-avatar" />}
            <div>
              <strong>{user.displayName || user.email || 'Anonymous user'}</strong>
              <p>{user.isAnonymous ? 'Anonymous session' : user.email}</p>
            </div>
            <button type="button" onClick={onSignOut}>Sign Out</button>
          </div>
        ) : (
          <div className="auth-stack">
            <button type="button" onClick={onGoogleSignIn} disabled={!isFirebaseReady}>
              Continue with Google
            </button>
            <button type="button" onClick={onAnonymousSignIn} disabled={!isFirebaseReady}>
              Continue Anonymously
            </button>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <div className="two-button-row">
              <button type="button" onClick={() => submitEmail('sign-in')} disabled={!isFirebaseReady}>
                Sign In
              </button>
              <button type="button" onClick={() => submitEmail('create')} disabled={!isFirebaseReady}>
                Create
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
