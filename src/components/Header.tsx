import React from 'react';
import type { QuickDropUser } from '../types';

interface HeaderProps {
  todayDate: string;
  user: QuickDropUser | null;
  onLoginClick: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ todayDate, user, onLoginClick, onSignOut }) => {
  const initial = user?.displayName?.[0] || user?.email?.[0] || 'U';

  return (
    <div className="header-top">
      <div className="logo-container">
        <h1>QuickDrop</h1>
      </div>
      <div className="header-actions">
        <div className="header-date">{todayDate}</div>
        {user ? (
          <button className="profile-button" onClick={onSignOut} title="Sign out">
            {user.photoURL ? <img src={user.photoURL} alt="" /> : <span>{initial.toUpperCase()}</span>}
          </button>
        ) : (
          <button className="login-button" onClick={onLoginClick}>Login</button>
        )}
      </div>
    </div>
  );
};
