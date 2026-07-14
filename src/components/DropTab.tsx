import React, { useRef, useState, useEffect } from 'react';
import { formatReminder } from '../utils/helpers';

declare const chrome: any;

interface DropTabProps {
  isDragging: boolean;
  handleFileDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleUrlSubmit: (
    url: string,
    description: string,
    status?: 'review' | 'done' | 'archived',
    reminderDate?: string
  ) => void;
  urlInput: string;
  setUrlInput: (val: string) => void;
  urlDescription: string;
  setUrlDescription: (val: string) => void;
  onManualUpload: (files: File[]) => void;
  currentTabInfo: {
    title: string;
    url: string;
    available: boolean;
  };
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
  onManualUpload,
  currentTabInfo
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const snippetDateRef = useRef<HTMLInputElement>(null);
  const tabDateRef = useRef<HTMLInputElement>(null);

  // Snippet states
  const [snippetReminder, setSnippetReminder] = useState<string>('');

  // Tab states
  const [tabTitle, setTabTitle] = useState('');
  const [tabUrl, setTabUrl] = useState('');
  const [tabReminder, setTabReminder] = useState<string>('');

  // Auto-fill when currentTabInfo is available
  useEffect(() => {
    if (currentTabInfo.available) {
      setTabTitle(currentTabInfo.title || '');
      setTabUrl(currentTabInfo.url || '');
    }
  }, [currentTabInfo]);

  const handleAreaClick = () => {
    const isPopup = window.innerWidth <= 450;
    if (isPopup && typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: 'index.html?triggerUpload=true' });
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onManualUpload(Array.from(e.target.files));
    }
  };

  const onSnippetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      handleUrlSubmit(urlInput, urlDescription, 'review', snippetReminder || undefined);
      setUrlInput('');
      setUrlDescription('');
      setSnippetReminder('');
    }
  };

  const onTabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tabUrl.trim()) {
      handleUrlSubmit(tabUrl, tabTitle, 'review', tabReminder || undefined);
      setTabReminder('');
    }
  };

  // Helper to check if a date is tomorrow
  const isTomorrow = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  const getTomorrowString = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    // Convert to local datetime-local format: YYYY-MM-DDThh:mm
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T09:00`;
  };

  const openPicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      try {
        ref.current.showPicker();
      } catch (e) {
        ref.current.click();
      }
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
          <form onSubmit={onSnippetSubmit} className="url-form">
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
            
            <div className="horizontal-options-row">
              <button 
                type="button" 
                className={`option-btn ${snippetReminder && isTomorrow(snippetReminder) ? 'active' : ''}`}
                onClick={() => {
                  if (snippetReminder && isTomorrow(snippetReminder)) {
                    setSnippetReminder('');
                  } else {
                    setSnippetReminder(getTomorrowString());
                  }
                }}
              >
                Remind Tomorrow
              </button>
              <button 
                type="button" 
                className={`option-btn ${snippetReminder && !isTomorrow(snippetReminder) ? 'active' : ''}`}
                onClick={() => openPicker(snippetDateRef)}
              >
                {snippetReminder && !isTomorrow(snippetReminder) 
                  ? formatReminder(snippetReminder) 
                  : 'Pick Date/Time'}
              </button>
              <input 
                type="datetime-local" 
                ref={snippetDateRef}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                value={snippetReminder}
                onChange={(e) => setSnippetReminder(e.target.value)}
              />
            </div>

            <button type="submit">Save Snippet</button>
          </form>
        </div>

        {currentTabInfo.available && (
          <div className="input-section">
            <h3>Save Current Tab</h3>
            <form onSubmit={onTabSubmit} className="url-form">
              <input
                type="text"
                placeholder="Title or Description..."
                value={tabTitle}
                onChange={(e) => setTabTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Tab Link..."
                value={tabUrl}
                onChange={(e) => setTabUrl(e.target.value)}
                required
                className="tab-url-input"
              />
              
              <div className="horizontal-options-row">
                <button 
                  type="button" 
                  className={`option-btn ${tabReminder && isTomorrow(tabReminder) ? 'active' : ''}`}
                  onClick={() => {
                    if (tabReminder && isTomorrow(tabReminder)) {
                      setTabReminder('');
                    } else {
                      setTabReminder(getTomorrowString());
                    }
                  }}
                >
                  Remind Tomorrow
                </button>
                <button 
                  type="button" 
                  className={`option-btn ${tabReminder && !isTomorrow(tabReminder) ? 'active' : ''}`}
                  onClick={() => openPicker(tabDateRef)}
                >
                  {tabReminder && !isTomorrow(tabReminder) 
                    ? formatReminder(tabReminder) 
                    : 'Pick Date/Time'}
                </button>
                <input 
                  type="datetime-local" 
                  ref={tabDateRef}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                  value={tabReminder}
                  onChange={(e) => setTabReminder(e.target.value)}
                />
              </div>

              <button type="submit">Save Current Tab</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
