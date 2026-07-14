import React, { type RefObject } from 'react';
import type { NoteItem } from '../types';

interface NotesTabProps {
  editorRef: RefObject<HTMLDivElement | null>;
  editorTitle: string;
  editorContent: string;
  noteMode: 'list' | 'view' | 'editor';
  activeNote: NoteItem | null;
  setEditorTitle: (title: string) => void;
  createNewNote: () => void;
  editActiveNote: () => void;
  closeNoteView: () => void;
  format: (command: string) => void;
  formatList: () => void;
  handleEditorInput: () => void;
  handleSaveNote: () => void;
  handleClearNote: () => void;
  notes: NoteItem[];
  openNote: (note: NoteItem) => void;
  deleteNote: (id: string) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  editorRef,
  editorTitle,
  editorContent,
  noteMode,
  activeNote,
  setEditorTitle,
  createNewNote,
  editActiveNote,
  closeNoteView,
  format,
  formatList,
  handleEditorInput,
  handleSaveNote,
  handleClearNote,
  notes,
  openNote,
  deleteNote,
}) => {
  if (noteMode === 'editor') {
    return (
      <div className="notes-section">
        <div className="notes-editor-container">
          <div className="notes-editor-header">
            <input
              type="text"
              className="note-title-input"
              placeholder="Untitled Note..."
              value={editorTitle}
              onChange={(event) => setEditorTitle(event.target.value)}
            />
            <button className="new-note-btn" onClick={closeNoteView} title="Back to notes">
              Back
            </button>
          </div>

          <div className="note-toolbar">
            <div className="toolbar-left">
              <button type="button" className="toolbar-btn bold-btn" onClick={() => format('bold')} title="Bold">B</button>
              <button type="button" className="toolbar-btn italic-btn" onClick={() => format('italic')} title="Italic">I</button>
              <button type="button" className="toolbar-btn list-btn" onClick={formatList} title="Bullet List">• List</button>
              <button type="button" className="toolbar-btn clear-format-btn" onClick={() => format('removeFormat')} title="Clear Formatting">Tx</button>
            </div>

            <div className="toolbar-right">
              <button type="button" className="toolbar-action-btn clear-note-btn" onClick={handleClearNote}>
                Clear
              </button>
              <button type="button" className="toolbar-action-btn save-note-btn" onClick={handleSaveNote}>
                Save
              </button>
            </div>
          </div>

          <div
            ref={editorRef}
            className="note-body-editor"
            contentEditable={true}
            onInput={handleEditorInput}
            data-placeholder="Start typing notes here..."
            suppressContentEditableWarning
          >
            {editorContent ? null : ''}
          </div>
        </div>
      </div>
    );
  }

  if (noteMode === 'view' && activeNote) {
    return (
      <div className="notes-section">
        <div className="note-detail-view">
          <div className="note-detail-header">
            <button className="new-note-btn" onClick={closeNoteView}>Back</button>
            <button className="new-note-btn" onClick={editActiveNote}>Edit</button>
          </div>
          <h3>{activeNote.title || 'Untitled Note'}</h3>
          <div
            className="note-detail-content"
            dangerouslySetInnerHTML={{ __html: activeNote.content || 'Empty note...' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="notes-section">
      <div className="saved-notes-container">
        <div className="notes-list-header">
          <h3>Notes ({notes.length})</h3>
          <button className="new-note-btn" onClick={createNewNote}>New Note</button>
        </div>

        {notes.length === 0 ? (
          <div className="empty-state-notes">
            <p>No saved notes yet.</p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note.id} className="note-card-item" onClick={() => openNote(note)}>
                <div className="note-card-header">
                  <h4 className="note-card-title">{note.title || 'Untitled Note'}</h4>
                  <button
                    className="delete-note-btn"
                    onClick={(event) => {
                      event.stopPropagation();
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
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
