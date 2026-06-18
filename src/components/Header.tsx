import React from 'react';

interface HeaderProps {
  todayDate: string;
}

export const Header: React.FC<HeaderProps> = ({ todayDate }) => {
  return (
    <div className="header-top">
      <div className="logo-container">
        <span className="logo-icon">💧</span>
        <h1>QuickDrop</h1>
      </div>
      <div className="header-date">
        {todayDate}
      </div>
    </div>
  );
};
