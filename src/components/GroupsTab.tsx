import React, { useState } from 'react';
import type { QuickDropGroup } from '../types';

interface GroupsTabProps {
  groups: QuickDropGroup[];
  selectedGroupId: string;
  selectedSubgroupId: string;
  setSelectedGroupId: (id: string) => void;
  setSelectedSubgroupId: (id: string) => void;
  onCreateGroup: (name: string, parentGroupId?: string) => Promise<void>;
}

export const GroupsTab: React.FC<GroupsTabProps> = ({
  groups,
  selectedGroupId,
  selectedSubgroupId,
  setSelectedGroupId,
  setSelectedSubgroupId,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [subgroupName, setSubgroupName] = useState('');
  const parentGroups = groups.filter((group) => !group.parentGroupId);
  const childGroups = groups.filter((group) => group.parentGroupId === selectedGroupId);

  const createGroup = async () => {
    if (!groupName.trim()) return;
    await onCreateGroup(groupName.trim());
    setGroupName('');
  };

  const createSubgroup = async () => {
    if (!subgroupName.trim() || !selectedGroupId) return;
    await onCreateGroup(subgroupName.trim(), selectedGroupId);
    setSubgroupName('');
  };

  return (
    <div className="settings-page">
      <div className="input-section">
        <h3>Groups</h3>
        <div className="group-picker">
          <select
            value={selectedGroupId}
            onChange={(event) => {
              setSelectedGroupId(event.target.value);
              setSelectedSubgroupId('');
            }}
          >
            <option value="">No group</option>
            {parentGroups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          <select
            value={selectedSubgroupId}
            onChange={(event) => setSelectedSubgroupId(event.target.value)}
            disabled={!selectedGroupId}
          >
            <option value="">No subgroup</option>
            {childGroups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="input-section">
        <h3>Create Group</h3>
        <div className="inline-form-row">
          <input
            type="text"
            placeholder="Group name"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
          />
          <button type="button" onClick={createGroup}>Add</button>
        </div>
      </div>

      <div className="input-section">
        <h3>Create Subgroup</h3>
        <div className="inline-form-row">
          <input
            type="text"
            placeholder="Subgroup name"
            value={subgroupName}
            onChange={(event) => setSubgroupName(event.target.value)}
            disabled={!selectedGroupId}
          />
          <button type="button" onClick={createSubgroup} disabled={!selectedGroupId}>Add</button>
        </div>
      </div>

      <div className="input-section">
        <h3>All Groups</h3>
        <div className="group-list">
          {parentGroups.length === 0 ? (
            <p className="muted-text">Create a group to organize saved resources.</p>
          ) : (
            parentGroups.map((group) => (
              <div key={group.id} className="group-row">
                <strong>{group.name}</strong>
                <span>
                  {groups.filter((child) => child.parentGroupId === group.id).length} subgroups
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
