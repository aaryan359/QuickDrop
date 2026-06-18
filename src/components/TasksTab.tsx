import React from 'react';
import type { Task } from '../types';

interface TasksTabProps {
  selectedDate: string;
  getTasksByDate: (date: string) => Task[];
  getTotalTasks: (date: string) => number;
  getCompletedTasks: (date: string) => number;
  newTask: string;
  setNewTask: (val: string) => void;
  addTask: () => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  selectedDate,
  getTasksByDate,
  getTotalTasks,
  getCompletedTasks,
  newTask,
  setNewTask,
  addTask,
  toggleTask,
  deleteTask
}) => {
  const currentTasks = getTasksByDate(selectedDate);
  const total = getTotalTasks(selectedDate);
  const completed = getCompletedTasks(selectedDate);
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="tasks-section">
      <div className="task-header">
        <h3>Tasks (Today)</h3>
      </div>

      <div className="task-stats-bar">
        <div className="stat-pill">
          <span className="stat-pill-label">Total:</span>
          <span className="stat-pill-value">{total}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-pill-label">Done:</span>
          <span className="stat-pill-value">{completed}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-pill-label">Progress:</span>
          <span className="stat-pill-value">{progress}%</span>
        </div>
      </div>

      <div className="add-task">
        <input 
          type="text"
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addTask();
            }
          }}
        />
        <button onClick={addTask}>Add</button>
      </div>

      <div className="tasks-list">
        {currentTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h4>All caught up!</h4>
            <p>Add tasks above to start organizing your day.</p>
          </div>
        ) : (
          currentTasks.map(task => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <input 
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="task-checkbox"
              />
              <span className="task-title">{task.title}</span>
              <button 
                onClick={() => deleteTask(task.id)}
                className="delete-task"
                title="Delete task"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
