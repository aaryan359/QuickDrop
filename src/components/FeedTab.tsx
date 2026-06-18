import React from 'react';
import type { FileItem, NoteItem, Task } from '../types';

interface FeedTabProps {
  files: FileItem[];
  notes: NoteItem[];
  tasks: Task[];
  fileListFilter: 'all' | 'files' | 'links' | 'notes' | 'tasks';
  setFileListFilter: (filter: 'all' | 'files' | 'links' | 'notes' | 'tasks') => void;
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
  clearAll
}) => {
  const unifiedItems = getUnifiedItems();

  return (
    <div className="files-list">
      <div className="files-header">
        <h3>Feed & History</h3>
        {(files.length > 0 || notes.length > 0 || tasks.length > 0) && (
          <button className="clear-all-btn" onClick={clearAll}>
            Clear All
          </button>
        )}
      </div>

      <div className="feed-filters">
        <button className={`filter-pill ${fileListFilter === 'all' ? 'active' : ''}`} onClick={() => setFileListFilter('all')}>All</button>
        <button className={`filter-pill ${fileListFilter === 'files' ? 'active' : ''}`} onClick={() => setFileListFilter('files')}>Files</button>
        <button className={`filter-pill ${fileListFilter === 'links' ? 'active' : ''}`} onClick={() => setFileListFilter('links')}>Snippets</button>
        <button className={`filter-pill ${fileListFilter === 'notes' ? 'active' : ''}`} onClick={() => setFileListFilter('notes')}>Notes</button>
        <button className={`filter-pill ${fileListFilter === 'tasks' ? 'active' : ''}`} onClick={() => setFileListFilter('tasks')}>Tasks</button>
      </div>

      {unifiedItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
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
                  {item.type === 'note' && '📝 Note'}
                  {item.type === 'url' && '🔗 Snippet'}
                  {item.type === 'task' && '✅ Task'}
                  {!['note', 'url', 'task'].includes(item.type) && '📁 File'}
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
                </div>
              </div>

              <div className="file-actions">
                {item.type === 'note' && (
                  <>
                    <button 
                      onClick={() => editNoteFromList(item.id)}
                      title="Edit Note"
                      className="action-btn edit-btn"
                    >
                      📝
                    </button>
                    <button 
                      onClick={() => copyToClipboard(item.raw.content.replace(/<[^>]*>/g, ''))}
                      title="Copy Note Text"
                      className="action-btn copy-btn"
                    >
                      📋
                    </button>
                    <button 
                      onClick={() => deleteNote(item.id)}
                      title="Delete Note"
                      className="action-btn delete-btn"
                    >
                      🗑️
                    </button>
                  </>
                )}

                {item.type === 'url' && (
                  <>
                    <button 
                      onClick={() => copyToClipboard(item.raw.name)}
                      title="Copy Snippet"
                      className="action-btn copy-btn"
                    >
                      📋
                    </button>
                    {isValidUrl(item.raw.name) && (
                      <button 
                        onClick={() => openUrl(item.raw.name)}
                        title="Open Link"
                        className="action-btn open-btn"
                      >
                        🔗
                      </button>
                    )}
                    <button 
                      onClick={() => deleteFile(item.id)}
                      title="Delete Snippet"
                      className="action-btn delete-btn"
                    >
                      🗑️
                    </button>
                  </>
                )}

                {item.type === 'task' && (
                  <button 
                    onClick={() => deleteTask(item.id)}
                    title="Delete Task"
                    className="action-btn delete-btn"
                  >
                    🗑️
                  </button>
                )}

                {!['note', 'url', 'task'].includes(item.type) && (
                  <>
                    <button 
                      onClick={() => copyToClipboard(item.raw.content || '')}
                      title="Copy content"
                      className="action-btn copy-btn"
                    >
                      📋
                    </button>
                    <button 
                      onClick={() => downloadFile(item.raw)}
                      title="Download file"
                      className="action-btn download-btn"
                    >
                      ⬇️
                    </button>
                    <button 
                      onClick={() => deleteFile(item.id)}
                      title="Delete file"
                      className="action-btn delete-btn"
                    >
                      🗑️
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
