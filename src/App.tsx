import { useState, useEffect, useRef } from 'react';
import './App.css';
import type { FileItem, Task, NoteItem } from './types';
import { saveData, loadData } from './services/storage';
import { 
  getFileType, 
  formatFileSize, 
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

function App() {
  const [activeTab, setActiveTab] = useState<'drop' | 'notes' | 'files' | 'tasks'>('drop');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

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

  // Load data from storage on component mount
  useEffect(() => {
    const loadDataOnMount = async () => {
      try {
        const { files: loadedFiles, tasks: loadedTasks, notes: loadedNotes } = await loadData();
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
      saveData(files, tasks, notes);
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

  const handleSaveNote = () => {
    const cleanContent = editorContent.trim();
    const isContentEmpty = !cleanContent || cleanContent === '<br>' || cleanContent === '<div><br></div>' || cleanContent === '<ul><li>&nbsp;</li></ul>' || cleanContent === '<ul><li><br></li></ul>';
    
    if (!editorTitle.trim() && isContentEmpty) {
      showNotification('Cannot save an empty note!');
      return;
    }

    const titleToSave = editorTitle.trim() || 'Untitled Note';

    // Always create a new note in history to prevent overwriting previous content
    const newId = Date.now().toString() + Math.random();
    const newNote: NoteItem = {
      id: newId,
      title: titleToSave,
      content: editorContent,
      timestamp: Date.now()
    };
    
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newId);
    showNotification('Note saved successfully!');
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

  const deleteNote = (noteId: string) => {
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
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const fileItem: FileItem = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: getFileType(file.name),
          content,
          size: formatFileSize(file.size),
          timestamp: Date.now()
        };
        setFiles(prev => [fileItem, ...prev]);
        showNotification('File added successfully!');
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      const newUrl: FileItem = {
        id: Date.now().toString() + Math.random(),
        name: urlInput.trim(),
        type: 'url',
        url: urlInput.trim(),
        description: urlDescription.trim() || 'Text Snippet',
        timestamp: Date.now()
      };
      setFiles(prev => [newUrl, ...prev]);
      setUrlInput('');
      setUrlDescription('');
      showNotification('Snippet saved!');
    }
  };

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    showNotification('Item deleted!');
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString() + Math.random(),
        title: newTask.trim(),
        completed: false,
        date: new Date()
      };
      setTasks(prev => [task, ...prev]);
      setNewTask('');
      showNotification('Task added!');
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    showNotification('Task deleted!');
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



  const editNoteFromList = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      selectNote(note);
      setActiveTab('notes');
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
