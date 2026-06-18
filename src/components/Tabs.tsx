import React from 'react';

interface TabsProps {
  activeTab: 'drop' | 'notes' | 'files' | 'tasks';
  setActiveTab: (tab: 'drop' | 'notes' | 'files' | 'tasks') => void;
  feedCount: number;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, feedCount }) => {
  return (
    <div className="tabs">
      <button 
        className={`tab ${activeTab === 'drop' ? 'active' : ''}`}
        onClick={() => setActiveTab('drop')}
      >
        📁 Drop
      </button>
      <button 
        className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
        onClick={() => setActiveTab('notes')}
      >
        📝 Notes
      </button>
      <button 
        className={`tab ${activeTab === 'files' ? 'active' : ''}`}
        onClick={() => setActiveTab('files')}
      >
        📋 Feed ({feedCount})
      </button>
      <button 
        className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
        onClick={() => setActiveTab('tasks')}
      >
        ✅ Tasks
      </button>
    </div>
  );
};
