import { useState, useEffect, useRef } from 'react';
import './App.css';
import type { FileItem, Task, NoteItem, QuickDropUser } from './types';
import { DataService } from './services/dataService';
import { isFirebaseConfigured } from './services/firebase';
import {
  createAccountWithEmail,
  getAuthErrorMessage,
  getGoogleRedirectUri,
  onAuthUserChanged,
  signInAnonymously,
  signInWithEmail,
  signOut,
} from './services/authService';
import { 
  isValidUrl, 
  getTodayDateFormatted, 
  showNotification, 
  copyToClipboard, 
  downloadFile, 
  openUrl 
} from './utils/helpers';

// Components
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { DropTab } from './components/DropTab';
import { NotesTab } from './components/NotesTab';
import { FeedTab } from './components/FeedTab';
import { TasksTab } from './components/TasksTab';

declare const chrome: any;

function App() {
  const [activeTab, setActiveTab] = useState<'drop' | 'notes' | 'files' | 'tasks'>('drop');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [user, setUser] = useState<QuickDropUser | null>(null);
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'create'>('sign-in');
  const [authMessage, setAuthMessage] = useState('');
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Notes states
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteMode, setNoteMode] = useState<'list' | 'view' | 'editor'>('list');
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  // Input states
  const [newTask, setNewTask] = useState('');
  const selectedDate = new Date().toISOString().split('T')[0];
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlDescription, setUrlDescription] = useState(''); 
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [fileListFilter, setFileListFilter] = useState<'all' | 'files' | 'links' | 'notes'>('all');

  const [currentTabInfo, setCurrentTabInfo] = useState<{ title: string; url: string; available: boolean }>({
    title: '',
    url: '',
    available: false
  });

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        if (tabs && tabs[0]) {
          setCurrentTabInfo({
            title: tabs[0].title || '',
            url: tabs[0].url || '',
            available: true
          });
        }
      });
    } else {
      setCurrentTabInfo({
        title: 'AWS Bedrock Pricing',
        url: 'https://aws.amazon.com/bedrock/pricing/',
        available: true
      });
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    return onAuthUserChanged((authUser) => {
      setUser(authUser);
      if (authUser) {
        setShowAuthPanel(false);
        loadCloudData();
      }
    });
  }, []);

  const loadCloudData = async () => {
    try {
      const { files: loadedFiles, tasks: loadedTasks, notes: loadedNotes } = await DataService.loadAllData();
      setFiles(loadedFiles);
      setTasks(loadedTasks);
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Failed to load cloud data:', error);
    }
  };

  // Load data from storage on component mount
  useEffect(() => {
    const loadDataOnMount = async () => {
      try {
        const { files: loadedFiles, tasks: loadedTasks, notes: loadedNotes } = await DataService.loadAllData();
        setFiles(loadedFiles);
        setTasks(loadedTasks);
        setNotes(loadedNotes);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDataOnMount();
  }, []);

  // Trigger file selection if opened via triggerUpload query param (handles the popup file dialog workaround)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('triggerUpload') === 'true') {
      setTimeout(() => {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.click();
        }
      }, 600);
    }
  }, []);

  // Save data to storage whenever files, tasks, or notes change
  useEffect(() => {
    if (!isLoading) {
      DataService.syncData(files, tasks, notes);
    }
  }, [files, tasks, notes, isLoading]);

  // Sync editor content editable DOM when the note editor opens or changes.
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== editorContent) {
        editorRef.current.innerHTML = editorContent;
      }
    }
  }, [activeNoteId, editorContent, noteMode]);

  const handleEditorInput = () => {
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  const format = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      editorRef.current.focus();
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  const formatList = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        document.execCommand('insertUnorderedList', false);
        setEditorContent(editorRef.current.innerHTML);
        return;
      }

      const content = editorRef.current.innerHTML.trim();
      // If the editor is completely empty, initialize with a list structure
      if (content === '' || content === '<br>' || content === '<div><br></div>') {
        editorRef.current.innerHTML = '<ul><li>&nbsp;</li></ul>';
        // Move selection inside the li
        const li = editorRef.current.querySelector('li');
        if (li) {
          const range = document.createRange();
          range.selectNodeContents(li);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        document.execCommand('insertUnorderedList', false);
      }
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  const handleSaveNote = async () => {
    const cleanContent = editorContent.trim();
    const isContentEmpty = !cleanContent || cleanContent === '<br>' || cleanContent === '<div><br></div>' || cleanContent === '<ul><li>&nbsp;</li></ul>' || cleanContent === '<ul><li><br></li></ul>';
    
    if (!editorTitle.trim() && isContentEmpty) {
      showNotification('Cannot save an empty note!');
      return;
    }

    const titleToSave = editorTitle.trim() || 'Untitled Note';

    try {
      if (activeNoteId) {
        const existingNote = notes.find((note) => note.id === activeNoteId);
        if (!existingNote) return;
        const updatedNote: NoteItem = {
          ...existingNote,
          title: titleToSave,
          content: editorContent,
        };
        await DataService.updateNote(updatedNote);
        const updatedNotes = notes.map((note) => note.id === activeNoteId ? updatedNote : note);
        setNotes(updatedNotes);
        await DataService.syncData(files, tasks, updatedNotes);
        showNotification('Note updated!');
        setNoteMode('view');
        return;
      }

      const newNote = await DataService.addNoteItem(
        titleToSave,
        editorContent
      );
      setNotes(prev => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
      setNoteMode('view');
      showNotification('Note saved successfully!');
    } catch (err) {
      showNotification('Failed to save note!');
      console.error(err);
    }
  };

  const handleClearNote = () => {
    if (window.confirm('Clear all text in the editor? Any unsaved changes will be lost.')) {
      setEditorTitle('');
      setEditorContent('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  };

  const createNewNote = () => {
    setActiveNoteId(null);
    setNoteMode('editor');
    setEditorTitle('');
    setEditorContent('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    showNotification('Started a new note!');
  };

  const deleteNote = async (noteId: string) => {
    try {
      await DataService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      if (activeNoteId === noteId) {
        setActiveNoteId(null);
        setEditorTitle('');
        setEditorContent('');
        setNoteMode('list');
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
      }
      showNotification('Note deleted!');
    } catch (err) {
      showNotification('Failed to delete note!');
      console.error(err);
    }
  };

  const selectNote = (note: NoteItem) => {
    setActiveNoteId(note.id);
    setNoteMode('view');
  };

  const editActiveNote = () => {
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;
    setEditorTitle(note.title);
    setEditorContent(note.content);
    setNoteMode('editor');
    if (editorRef.current) {
      editorRef.current.innerHTML = note.content;
    }
  };

  const closeNoteView = () => {
    setNoteMode('list');
    setActiveNoteId(null);
    setEditorTitle('');
    setEditorContent('');
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = (fileList: File[]) => {
    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          const fileItem = await DataService.addFile(
            file,
            content
          );
          setFiles(prev => [fileItem, ...prev]);
          showNotification('File added successfully!');
        } catch (err) {
          showNotification('Failed to add file!');
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUrlSubmit = async (
    url: string, 
    description: string,
    status?: 'review' | 'done' | 'archived',
    reminderDate?: string
  ) => {
    if (url.trim()) {
      try {
        const newUrl = await DataService.addUrlItem(
          url,
          description,
          status,
          reminderDate
        );
        setFiles(prev => [newUrl, ...prev]);
        showNotification('Snippet saved!');
      } catch (err) {
        showNotification('Failed to save snippet!');
        console.error(err);
      }
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await DataService.deleteFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
      showNotification('Item deleted!');
    } catch (err) {
      showNotification('Failed to delete item!');
      console.error(err);
    }
  };

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        const task = await DataService.addTaskItem(newTask);
        setTasks(prev => [task, ...prev]);
        setNewTask('');
        showNotification('Task added!');
      } catch (err) {
        showNotification('Failed to add task!');
        console.error(err);
      }
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    try {
      await DataService.toggleTask(taskId, !task.completed);
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
    } catch (err) {
      showNotification('Failed to update task!');
      console.error(err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await DataService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      showNotification('Task deleted!');
    } catch (err) {
      showNotification('Failed to delete task!');
      console.error(err);
    }
  };

  const getTasksByDate = (date: string) => {
    return tasks.filter(task => {
      const taskDateStr = task.date instanceof Date 
        ? task.date.toISOString().split('T')[0] 
        : new Date(task.date).toISOString().split('T')[0];
      return taskDateStr === date;
    });
  };

  const getCompletedTasks = (date: string) => {
    return getTasksByDate(date).filter(task => task.completed).length;
  };

  const getTotalTasks = (date: string) => {
    return getTasksByDate(date).length;
  };



  const toggleItemStatus = async (itemId: string, itemType: string) => {
    try {
      if (itemType === 'note') {
        const updatedNotes = notes.map(n => 
          n.id === itemId ? { ...n, status: (n.status === 'done' ? 'review' as const : 'done' as const) } : n
        );
        setNotes(updatedNotes);
        await DataService.syncData(files, tasks, updatedNotes);
      } else {
        const updatedFiles = files.map(f => 
          f.id === itemId ? { ...f, status: (f.status === 'done' ? 'review' as const : 'done' as const) } : f
        );
        setFiles(updatedFiles);
        await DataService.syncData(updatedFiles, tasks, notes);
      }
      showNotification('Status updated!');
    } catch (err) {
      showNotification('Failed to update status!');
      console.error(err);
    }
  };

  const editNoteFromList = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setActiveNoteId(note.id);
      setEditorTitle(note.title);
      setEditorContent(note.content);
      setNoteMode('editor');
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content;
      }
      setActiveTab('notes');
    }
  };

  const handleEmailSignIn = async (email: string, password: string) => {
    setIsAuthBusy(true);
    setAuthMessage('');
    try {
      await signInWithEmail(email, password);
      setShowAuthPanel(false);
      showNotification('Signed in!');
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setAuthMessage(message);
      showNotification(message);
      console.error(error);
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleEmailCreate = async (email: string, password: string) => {
    setIsAuthBusy(true);
    setAuthMessage('');
    try {
      await createAccountWithEmail(email, password);
      setShowAuthPanel(false);
      showNotification('Account created!');
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setAuthMessage(message);
      showNotification(message);
      console.error(error);
    } finally {
      setIsAuthBusy(false);
    }
  };

  const submitAuthEmail = () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      const message = 'Enter email and password.';
      setAuthMessage(message);
      showNotification(message);
      return;
    }

    if (authMode === 'create') {
      handleEmailCreate(authEmail.trim(), authPassword);
    } else {
      handleEmailSignIn(authEmail.trim(), authPassword);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsAuthBusy(true);
    setAuthMessage('');
    try {
      await signInAnonymously();
      setShowAuthPanel(false);
      showNotification('Anonymous session started!');
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setAuthMessage(message);
      showNotification(message);
      console.error(error);
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setShowAuthPanel(false);
      showNotification('Signed out!');
    } catch (error) {
      showNotification('Sign out failed!');
      console.error(error);
    }
  };

  const getUnifiedItems = () => {
    const items: any[] = [];
    
    files.forEach(f => {
      const isUrlType = f.type === 'url';
      items.push({
        id: f.id,
        title: isUrlType ? (f.description || 'Snippet') : f.name,
        subtitle: isUrlType ? f.name : (f.size || 'File'),
        type: f.type,
        timestamp: f.timestamp,
        status: f.status,
        reminderDate: f.reminderDate,
        raw: f
      });
    });
    
    notes.forEach(n => {
      const excerpt = n.content 
        ? n.content.replace(/<[^>]*>/g, '').substring(0, 50)
        : 'Empty note';
      items.push({
        id: n.id,
        title: n.title || 'Untitled Note',
        subtitle: excerpt || 'Text Note',
        type: 'note',
        timestamp: n.timestamp,
        status: n.status,
        reminderDate: n.reminderDate,
        raw: n
      });
    });
    
    let filtered = items;
    if (fileListFilter === 'files') {
      filtered = items.filter(item => ['file', 'image', 'pdf', 'text'].includes(item.type));
    } else if (fileListFilter === 'links') {
      filtered = items.filter(item => item.type === 'url');
    } else if (fileListFilter === 'notes') {
      filtered = items.filter(item => item.type === 'note');
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  };

  const renderFilePreview = (file: FileItem) => {
    if (hoveredFile !== file.id) return null;

    return (
      <div className="file-preview show">
        <div className="file-preview-title">{file.name}</div>
        <div className="file-preview-content">
          {file.type === 'image' && (
            <img 
              src={file.content} 
              alt={file.name}
              className="file-preview-image"
            />
          )}
          {file.type === 'text' && (
            <div className="file-preview-text">
              {file.content && file.content.length > 200 
                ? file.content.substring(0, 200) + '...' 
                : file.content}
            </div>
          )}
          {file.type === 'url' && (
            <div className="file-preview-url">
              {file.url}
            </div>
          )}
          {file.type === 'pdf' && (
            <div className="file-preview-text">
              PDF Document - {file.size}
            </div>
          )}
          {file.type === 'file' && (
            <div className="file-preview-file">
              <div className="file-info">
                <h4>{file.name}</h4>
                <p className="file-date">{new Date(file.timestamp).toLocaleString()}</p>
                {file.size && <p className="file-size">{file.size}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const activeNote = notes.find((note) => note.id === activeNoteId) || null;

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading QuickDrop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <Header
          todayDate={getTodayDateFormatted()}
          user={user}
          onLoginClick={() => setShowAuthPanel((open) => !open)}
          onSignOut={handleSignOut}
        />
        {showAuthPanel && !user && (
          <div className="auth-panel">
            <button className="auth-google-button" type="button" disabled title="Google login coming soon">
              Google login coming soon
            </button>
            <div className="auth-divider">or</div>
            <div className="auth-panel-title">
              {authMode === 'sign-in' ? 'Sign in with email' : 'Create your account'}
            </div>
            <input
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
            />
            <button onClick={submitAuthEmail} disabled={!isFirebaseConfigured() || isAuthBusy}>
              {authMode === 'sign-in' ? 'Sign In' : 'Create Account'}
            </button>
            <button
              className="auth-text-button"
              onClick={() => {
                setAuthMessage('');
                setAuthMode(authMode === 'sign-in' ? 'create' : 'sign-in');
              }}
              type="button"
            >
              {authMode === 'sign-in'
                ? "Don't have an account? Create one"
                : 'Already have an account? Sign in'}
            </button>
            <button className="auth-link-button" onClick={handleAnonymousSignIn} disabled={!isFirebaseConfigured() || isAuthBusy}>
              Continue anonymously
            </button>
            {authMessage && <div className="auth-message">{authMessage}</div>}
            {getGoogleRedirectUri() && (
              <div className="auth-help">
                Google redirect URL: <span>{getGoogleRedirectUri()}</span>
              </div>
            )}
          </div>
        )}
        <Tabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          feedCount={getUnifiedItems().length} 
        />
      </div>

      <div className="content">
        {activeTab === 'drop' && (
          <DropTab 
            isDragging={isDragging}
            handleFileDrop={handleFileDrop}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleUrlSubmit={handleUrlSubmit}
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            urlDescription={urlDescription}
            setUrlDescription={setUrlDescription}
            onManualUpload={processFiles}
            currentTabInfo={currentTabInfo}
          />
        )}

        {activeTab === 'notes' && (
          <NotesTab 
            editorRef={editorRef}
            editorTitle={editorTitle}
            editorContent={editorContent}
            noteMode={noteMode}
            activeNote={activeNote}
            setEditorTitle={setEditorTitle}
            createNewNote={createNewNote}
            editActiveNote={editActiveNote}
            closeNoteView={closeNoteView}
            format={format}
            formatList={formatList}
            handleEditorInput={handleEditorInput}
            handleSaveNote={handleSaveNote}
            handleClearNote={handleClearNote}
            notes={notes}
            openNote={selectNote}
            deleteNote={deleteNote}
          />
        )}

        {activeTab === 'files' && (
          <FeedTab 
            files={files}
            notes={notes}
            tasks={tasks}
            fileListFilter={fileListFilter}
            setFileListFilter={setFileListFilter}
            getUnifiedItems={getUnifiedItems}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            deleteNote={deleteNote}
            deleteFile={deleteFile}
            editNoteFromList={editNoteFromList}
            copyToClipboard={(content) => copyToClipboard(content, showNotification)}
            downloadFile={(file) => downloadFile(file, showNotification)}
            openUrl={openUrl}
            isValidUrl={isValidUrl}
            setHoveredFile={setHoveredFile}
            renderFilePreview={renderFilePreview}
            toggleItemStatus={toggleItemStatus}
            clearAll={() => {
              setFiles([]);
              setNotes([]);
              setTasks([]);
              setActiveNoteId(null);
              setNoteMode('list');
              setEditorTitle('');
              setEditorContent('');
              if (editorRef.current) editorRef.current.innerHTML = '';
              showNotification('All history cleared!');
            }}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksTab 
            selectedDate={selectedDate}
            getTasksByDate={getTasksByDate}
            getTotalTasks={getTotalTasks}
            getCompletedTasks={getCompletedTasks}
            newTask={newTask}
            setNewTask={setNewTask}
            addTask={addTask}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
          />
        )}
      </div>
    </div>
  );
}

export default App;
