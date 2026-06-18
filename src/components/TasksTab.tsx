import React from 'react';
import type { Task } from '../types';

interface TasksTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  showTaskHistory: boolean;
  setShowTaskHistory: (show: boolean) => void;
  getPastDays: (days: number) => string[];
  getTasksByDate: (date: string) => Task[];
  formatDate: (dateStr: string) => string;
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
  setSelectedDate,
  showTaskHistory,
  setShowTaskHistory,
  getPastDays,
  getTasksByDate,
  formatDate,
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
        <h3>Tasks</h3>
        <div className="task-controls">
          <div className="date-selector">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <button 
            className="history-toggle"
            onClick={() => setShowTaskHistory(!showTaskHistory)}
          >
            {showTaskHistory ? 'Hide Stats' : 'Stats History'}
          </button>
        </div>
      </div>

      {showTaskHistory && (
        <div className="task-history">
          <h4>7-Day Stats</h4>
          <div className="history-days">
            {getPastDays(7).map(date => {
              const dayTasks = getTasksByDate(date);
              const comp = dayTasks.filter(t => t.completed).length;
              const tot = dayTasks.length;
              const prog = tot > 0 ? Math.round((comp / tot) * 100) : 0;
              
              return (
                <div key={date} className="history-day">
                  <div className="history-date">{formatDate(date)}</div>
                  <div className="history-stats">
                    <span>{comp}/{tot}</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${prog}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
            <div className="empty-icon">✅</div>
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
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
