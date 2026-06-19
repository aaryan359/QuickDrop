import React from 'react';
import type { FileItem, NoteItem, Task } from '../types';
import { formatReminder } from '../utils/helpers';

interface FeedTabProps {
  files: FileItem[];
  notes: NoteItem[];
  tasks: Task[];
  fileListFilter: 'all' | 'files' | 'links' | 'notes';
  setFileListFilter: (filter: 'all' | 'files' | 'links' | 'notes') => void;
  getUnifiedItems: () => any[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  deleteNote: (id: string) => void;
  deleteFile: (id: string) => void;
  editNoteFromList: (id: string) => void;
  copyToClipboard: (content: string) => void;
  downloadFile: (file: FileItem) => void;
  openUrl: (url: string) => void;
  isValidUrl: (url: string) => boolean;
  setHoveredFile: (id: string | null) => void;
  renderFilePreview: (file: FileItem) => React.ReactNode;
  clearAll: () => void;
  toggleItemStatus: (id: string, type: string) => void;
}

export const FeedTab: React.FC<FeedTabProps> = ({
  files,
  notes,
  tasks,
  fileListFilter,
  setFileListFilter,
  getUnifiedItems,
  toggleTask,
  deleteTask,
  deleteNote,
  deleteFile,
  editNoteFromList,
  copyToClipboard,
  downloadFile,
  openUrl,
  isValidUrl,
  setHoveredFile,
  renderFilePreview,
  clearAll,
  toggleItemStatus
}) => {
  const unifiedItems = getUnifiedItems();

  return (
    <div className="files-list">
      <div className="files-header">
        <h3>Feed & History</h3>
        {(files.length > 0 || notes.length > 0 || tasks.length > 0) && (
          <button className="clear-all-btn" onClick={clearAll}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Clear All
          </button>
        )}
      </div>

      <div className="feed-filters">
        <button className={`filter-pill ${fileListFilter === 'all' ? 'active' : ''}`} onClick={() => setFileListFilter('all')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="pill-icon">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          All
        </button>
        <button className={`filter-pill ${fileListFilter === 'files' ? 'active' : ''}`} onClick={() => setFileListFilter('files')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="pill-icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          Files
        </button>
        <button className={`filter-pill ${fileListFilter === 'links' ? 'active' : ''}`} onClick={() => setFileListFilter('links')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="pill-icon">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          Snippets
        </button>
        <button className={`filter-pill ${fileListFilter === 'notes' ? 'active' : ''}`} onClick={() => setFileListFilter('notes')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="pill-icon">
            <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"></path>
            <polyline points="14 3 14 8 19 8"></polyline>
          </svg>
          Notes
        </button>
      </div>

      {unifiedItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h4>No items found</h4>
          <p>Add some files, notes, snippets, or tasks to see them here!</p>
        </div>
      ) : (
        <div className="files-grid">
          {unifiedItems.map((item) => (
            <div
              key={item.id}
              className={`file-card type-${item.type}`}
              onMouseEnter={['image', 'file', 'pdf'].includes(item.type) ? () => setHoveredFile(item.id) : undefined}
              onMouseLeave={['image', 'file', 'pdf'].includes(item.type) ? () => setHoveredFile(null) : undefined}
            >
              {['image', 'file', 'pdf'].includes(item.type) && renderFilePreview(item.raw)}

              <div className="file-card-main">
                <div className="file-card-tag">
                  {item.type === 'note' && 'Note'}
                  {item.type === 'url' && 'Snippet'}
                  {item.type === 'task' && 'Task'}
                  {!['note', 'url', 'task'].includes(item.type) && 'File'}
                </div>

                <div className="file-info">
                  {item.type === 'task' ? (
                    <div className="list-task-wrapper">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleTask(item.id)}
                        className="task-checkbox-mini"
                      />
                      <span className={`list-task-title ${item.completed ? 'completed' : ''}`}>{item.title}</span>
                    </div>
                  ) : item.type === 'url' ? (
                    <div className="url-display">
                      <div className="url-title">{item.title}</div>
                      <div className="url-link">{item.subtitle}</div>
                    </div>
                  ) : (
                    <div className="generic-display">
                      <div className="generic-title">{item.title}</div>
                      {item.type === 'note' ? (
                        <div className="generic-desc" dangerouslySetInnerHTML={{ __html: item.subtitle }}></div>
                      ) : (
                        <div className="generic-desc">{item.subtitle}</div>
                      )}
                    </div>
                  )}

                  {/* Status/Reminder labels in Feed list */}
                  {(item.status === 'done' || item.reminderDate) && (
                    <div className="card-labels-row" style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      {item.status === 'done' && (
                        <span className="card-badge done-badge" style={{ background: '#d1fae5', color: '#065f46', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                          ✓ Done
                        </span>
                      )}
                      {item.reminderDate && (
                        <span className="card-badge reminder-badge" style={{ background: '#eff6ff', color: '#1e40af', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          ⏰ {formatReminder(item.reminderDate)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="file-actions">
                {item.type === 'note' && (
                  <>
                    <button
                      onClick={() => toggleItemStatus(item.id, item.type)}
                      title={item.status === 'done' ? "Mark as Review" : "Mark as Done"}
                      className={`action-btn done-btn ${item.status === 'done' ? 'active' : ''}`}
                      style={item.status === 'done' ? { color: '#10b981' } : {}}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={() => editNoteFromList(item.id)}
                      title="Edit Note"
                      className="action-btn edit-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.raw.content.replace(/<[^>]*>/g, ''))}
                      title="Copy Note Text"
                      className="action-btn copy-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteNote(item.id)}
                      title="Delete Note"
                      className="action-btn delete-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </>
                )}

                {item.type === 'url' && (
                  <>
                    <button
                      onClick={() => toggleItemStatus(item.id, item.type)}
                      title={item.status === 'done' ? "Mark as Review" : "Mark as Done"}
                      className={`action-btn done-btn ${item.status === 'done' ? 'active' : ''}`}
                      style={item.status === 'done' ? { color: '#10b981' } : {}}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.raw.name)}
                      title="Copy Snippet"
                      className="action-btn copy-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                    {isValidUrl(item.raw.name) && (
                      <button
                        onClick={() => openUrl(item.raw.name)}
                        title="Open Link"
                        className="action-btn open-btn"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => deleteFile(item.id)}
                      title="Delete Snippet"
                      className="action-btn delete-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </>
                )}

                {item.type === 'task' && (
                  <button
                    onClick={() => deleteTask(item.id)}
                    title="Delete Task"
                    className="action-btn delete-btn"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                )}

                {!['note', 'url', 'task'].includes(item.type) && (
                  <>
                    <button
                      onClick={() => toggleItemStatus(item.id, item.type)}
                      title={item.status === 'done' ? "Mark as Review" : "Mark as Done"}
                      className={`action-btn done-btn ${item.status === 'done' ? 'active' : ''}`}
                      style={item.status === 'done' ? { color: '#10b981' } : {}}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.raw.content || '')}
                      title="Copy content"
                      className="action-btn copy-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => downloadFile(item.raw)}
                      title="Download file"
                      className="action-btn download-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteFile(item.id)}
                      title="Delete file"
                      className="action-btn delete-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
