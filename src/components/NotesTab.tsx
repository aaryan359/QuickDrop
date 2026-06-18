import React, { type RefObject } from 'react';
import type { NoteItem } from '../types';

interface NotesTabProps {
  editorRef: RefObject<HTMLDivElement | null>;
  editorTitle: string;
  handleNoteChange: (title: string, content: string) => void;
  createNewNote: () => void;
  format: (command: string) => void;
  handleEditorInput: () => void;
  notes: NoteItem[];
  activeNoteId: string | null;
  selectNote: (note: NoteItem) => void;
  deleteNote: (id: string) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  editorRef,
  editorTitle,
  handleNoteChange,
  createNewNote,
  format,
  handleEditorInput,
  notes,
  activeNoteId,
  selectNote,
  deleteNote
}) => {
  const currentContent = notes.find(n => n.id === activeNoteId)?.content || '';

  return (
    <div className="notes-section">
      <div className="notes-editor-container">
        <div className="notes-editor-header">
          <input 
            type="text" 
            className="note-title-input" 
            placeholder="Untitled Note..." 
            value={editorTitle}
            onChange={(e) => handleNoteChange(e.target.value, currentContent)}
          />
          <button className="new-note-btn" onClick={createNewNote} title="New Note">
            + New
          </button>
        </div>
        
        <div className="note-toolbar">
          <button 
            type="button" 
            className="toolbar-btn bold-btn" 
            onClick={() => format('bold')}
            title="Bold"
          >
            B
          </button>
          <button 
            type="button" 
            className="toolbar-btn italic-btn" 
            onClick={() => format('italic')}
            title="Italic"
          >
            I
          </button>
          <button 
            type="button" 
            className="toolbar-btn list-btn" 
            onClick={() => format('insertUnorderedList')}
            title="Bullet List"
          >
            • List
          </button>
          <button 
            type="button" 
            className="toolbar-btn clear-btn" 
            onClick={() => format('removeFormat')}
            title="Clear Formatting"
          >
            Clear
          </button>
          <span className="autosave-indicator">
            ✓ Saved
          </span>
        </div>
        
        <div 
          ref={editorRef}
          className="note-body-editor"
          contentEditable={true}
          onInput={handleEditorInput}
          data-placeholder="Start typing notes here... (Autosaves instantly)"
        ></div>
      </div>
      
      <div className="saved-notes-container">
        <h3>Notes History ({notes.length})</h3>
        {notes.length === 0 ? (
          <div className="empty-state-notes">
            <p>No saved notes. Start typing above to create one immediately!</p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map(note => (
              <div 
                key={note.id} 
                className={`note-card-item ${activeNoteId === note.id ? 'active' : ''}`}
                onClick={() => selectNote(note)}
              >
                <div className="note-card-header">
                  <h4 className="note-card-title">{note.title || 'Untitled Note'}</h4>
                  <button 
                    className="delete-note-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    title="Delete Note"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
                <div 
                  className="note-card-excerpt"
                  dangerouslySetInnerHTML={{ __html: note.content || 'Empty note...' }}
                ></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
