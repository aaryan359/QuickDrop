import React from 'react';

interface TabsProps {
  activeTab: 'drop' | 'notes' | 'files' | 'tasks' | 'groups' | 'account';
  setActiveTab: (tab: 'drop' | 'notes' | 'files' | 'tasks' | 'groups' | 'account') => void;
  feedCount: number;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, feedCount }) => {
  return (
    <div className="tabs">
      <button 
        className={`tab ${activeTab === 'drop' ? 'active' : ''}`}
        onClick={() => setActiveTab('drop')}
      >
        Drop
      </button>
      <button 
        className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
        onClick={() => setActiveTab('notes')}
      >
        Notes
      </button>
      <button 
        className={`tab ${activeTab === 'files' ? 'active' : ''}`}
        onClick={() => setActiveTab('files')}
      >
        Feed ({feedCount})
      </button>
      <button 
        className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
        onClick={() => setActiveTab('tasks')}
      >
        Tasks
      </button>
      <button 
        className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
        onClick={() => setActiveTab('groups')}
      >
        Groups
      </button>
      <button 
        className={`tab ${activeTab === 'account' ? 'active' : ''}`}
        onClick={() => setActiveTab('account')}
      >
        Account
      </button>
    </div>
  );
};
