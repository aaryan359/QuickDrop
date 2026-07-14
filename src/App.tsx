import { useState, useEffect, useRef } from 'react';
import './App.css';
import type { FileItem, Task, NoteItem, QuickDropGroup, QuickDropUser } from './types';
import { DataService } from './services/dataService';
import { getConfiguredBackendMode } from './services/backend/backendClient';
import { isFirebaseConfigured } from './services/firebase';
import {
  createAccountWithEmail,
  onAuthUserChanged,
  signInAnonymously,
  signInWithEmail,
  signInWithGoogle,
  signOut,
} from './services/authService';
import { createGroup, getUserGroups } from './services/groupService';
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
import { AccountTab } from './components/AccountTab';
import { GroupsTab } from './components/GroupsTab';

declare const chrome: any;

function App() {
  const [activeTab, setActiveTab] = useState<'drop' | 'notes' | 'files' | 'tasks' | 'groups' | 'account'>('drop');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [groups, setGroups] = useState<QuickDropGroup[]>([]);
  const [user, setUser] = useState<QuickDropUser | null>(null);

  // Notes states
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
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
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedSubgroupId, setSelectedSubgroupId] = useState('');

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
        loadCloudData();
      }
    });
  }, []);

  const loadCloudData = async () => {
    try {
      const [{ files: loadedFiles, tasks: loadedTasks, notes: loadedNotes }, loadedGroups] =
        await Promise.all([DataService.loadAllData(), getUserGroups()]);
      setFiles(loadedFiles);
      setTasks(loadedTasks);
      setNotes(loadedNotes);
      setGroups(loadedGroups);
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

  // Sync editor content editable DOM when activeNoteId changes
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== editorContent) {
        editorRef.current.innerHTML = editorContent;
      }
    }
  }, [activeNoteId]);

  const handleNoteChange = (title: string, content: string) => {
    setEditorTitle(title);
    setEditorContent(content);
  };

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
      const newNote = await DataService.addNoteItem(
        titleToSave,
        editorContent,
        selectedGroupId || undefined,
        selectedSubgroupId || undefined
      );
      setNotes(prev => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
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
    setEditorTitle(note.title);
    setEditorContent(note.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = note.content;
    }
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
            content,
            selectedGroupId || undefined,
            selectedSubgroupId || undefined
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
          reminderDate,
          selectedGroupId || undefined,
          selectedSubgroupId || undefined
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
      selectNote(note);
      setActiveTab('notes');
    }
  };

  const handleSaveCloudGroup = async (name: string, parentGroupId?: string) => {
    try {
      const createdGroup = user
        ? await createGroup({ name, parentGroupId })
        : {
            id: Date.now().toString() + Math.random(),
            userId: 'local',
            name,
            parentGroupId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

      setGroups((prev) => [createdGroup, ...prev]);
      showNotification(parentGroupId ? 'Subgroup created!' : 'Group created!');
    } catch (error) {
      showNotification('Failed to create group!');
      console.error(error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      showNotification('Signed in with Google!');
    } catch (error) {
      showNotification('Google sign in failed!');
      console.error(error);
    }
  };

  const handleEmailSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      showNotification('Signed in!');
    } catch (error) {
      showNotification('Email sign in failed!');
      console.error(error);
    }
  };

  const handleEmailCreate = async (email: string, password: string) => {
    try {
      await createAccountWithEmail(email, password);
      showNotification('Account created!');
    } catch (error) {
      showNotification('Account creation failed!');
      console.error(error);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously();
      showNotification('Anonymous session started!');
    } catch (error) {
      showNotification('Anonymous sign in failed!');
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
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
        <Header todayDate={getTodayDateFormatted()} />
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
            groups={groups}
            selectedGroupId={selectedGroupId}
            selectedSubgroupId={selectedSubgroupId}
            setSelectedGroupId={setSelectedGroupId}
            setSelectedSubgroupId={setSelectedSubgroupId}
          />
        )}

        {activeTab === 'notes' && (
          <NotesTab 
            editorRef={editorRef}
            editorTitle={editorTitle}
            handleNoteChange={handleNoteChange}
            createNewNote={createNewNote}
            format={format}
            formatList={formatList}
            handleEditorInput={handleEditorInput}
            handleSaveNote={handleSaveNote}
            handleClearNote={handleClearNote}
            notes={notes}
            activeNoteId={activeNoteId}
            selectNote={selectNote}
            deleteNote={deleteNote}
            selectedGroupId={selectedGroupId}
            selectedSubgroupId={selectedSubgroupId}
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
            groups={groups}
            clearAll={() => {
              setFiles([]);
              setNotes([]);
              setTasks([]);
              setActiveNoteId(null);
              setEditorTitle('');
              setEditorContent('');
              if (editorRef.current) editorRef.current.innerHTML = '';
              showNotification('All history cleared!');
            }}
          />
        )}

        {activeTab === 'groups' && (
          <GroupsTab
            groups={groups}
            selectedGroupId={selectedGroupId}
            selectedSubgroupId={selectedSubgroupId}
            setSelectedGroupId={setSelectedGroupId}
            setSelectedSubgroupId={setSelectedSubgroupId}
            onCreateGroup={handleSaveCloudGroup}
          />
        )}

        {activeTab === 'account' && (
          <AccountTab
            backendMode={getConfiguredBackendMode()}
            isFirebaseReady={isFirebaseConfigured()}
            user={user}
            onGoogleSignIn={handleGoogleSignIn}
            onEmailSignIn={handleEmailSignIn}
            onEmailCreate={handleEmailCreate}
            onAnonymousSignIn={handleAnonymousSignIn}
            onSignOut={handleSignOut}
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
