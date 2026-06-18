import React, { useRef } from 'react';

interface DropTabProps {
  isDragging: boolean;
  handleFileDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleUrlSubmit: (e: React.FormEvent) => void;
  urlInput: string;
  setUrlInput: (val: string) => void;
  urlDescription: string;
  setUrlDescription: (val: string) => void;
  onManualUpload: (files: File[]) => void;
}

export const DropTab: React.FC<DropTabProps> = ({
  isDragging,
  handleFileDrop,
  handleDragOver,
  handleDragLeave,
  handleUrlSubmit,
  urlInput,
  setUrlInput,
  urlDescription,
  setUrlDescription,
  onManualUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onManualUpload(Array.from(e.target.files));
    }
  };

  return (
    <div className="drop-zone">
      <div
        className={`file-drop-area ${isDragging ? 'dragging' : ''}`}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleAreaClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          multiple
        />
        <h3>Drag & Drop or Click to Upload</h3>
        <p>Supports images, PDFs, documents and text files</p>
        <div className="drop-hint">
          <span>Click or Drag & Drop</span>
        </div>
      </div>

      <div className="input-sections">
        <div className="input-section">
          <h3> Add Link / Snippet</h3>
          <form onSubmit={handleUrlSubmit} className="url-form">
            <input
              type="text"
              placeholder="Title or Description..."
              value={urlDescription}
              onChange={(e) => setUrlDescription(e.target.value)}
            />
            <textarea
              placeholder="Paste link, command, code or any copied text here..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              required
              rows={2}
              className="snippet-textarea"
            />
            <button type="submit">Save Snippet</button>
          </form>
        </div>
      </div>
    </div>
  );
};
