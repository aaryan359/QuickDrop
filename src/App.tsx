import { useState, useEffect, useRef } from 'react';
import './App.css';
import type { FileItem, Task, NoteItem } from './types';
import { saveData, loadData } from './services/storage';
import { 
  getFileType, 
  formatFileSize, 
  isValidUrl, 
  getTodayDateFormatted, 
  formatDate, 
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlDescription, setUrlDescription] = useState(''); 
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [fileListFilter, setFileListFilter] = useState<'all' | 'files' | 'links' | 'notes' | 'tasks'>('all');

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

    if (activeNoteId) {
      setNotes(prev => prev.map(note => 
        note.id === activeNoteId 
          ? { ...note, title, content, timestamp: Date.now() }
          : note
      ));
    } else {
      // Auto-create note on first character typed (zero friction)
      if (title.trim() || (content.trim() && content !== '<br>' && content !== '<div><br></div>' && content !== '')) {
        const newId = Date.now().toString() + Math.random();
        const newNote: NoteItem = {
          id: newId,
          title: title || 'Untitled Note',
          content: content,
          timestamp: Date.now()
        };
        setNotes(prev => [newNote, ...prev]);
        setActiveNoteId(newId);
      }
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      handleNoteChange(editorTitle, html);
    }
  };

  const format = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorInput();
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

  const getPastDays = (days: number) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
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
    
    tasks.forEach(t => {
      const time = t.date instanceof Date ? t.date.getTime() : new Date(t.date).getTime();
      items.push({
        id: t.id,
        title: t.title,
        subtitle: t.completed ? 'Completed' : 'Pending',
        type: 'task',
        timestamp: time,
        completed: t.completed,
        raw: t
      });
    });
    
    let filtered = items;
    if (fileListFilter === 'files') {
      filtered = items.filter(item => ['file', 'image', 'pdf', 'text'].includes(item.type));
    } else if (fileListFilter === 'links') {
      filtered = items.filter(item => item.type === 'url');
    } else if (fileListFilter === 'notes') {
      filtered = items.filter(item => item.type === 'note');
    } else if (fileListFilter === 'tasks') {
      filtered = items.filter(item => item.type === 'task');
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
            handleEditorInput={handleEditorInput}
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
            setSelectedDate={setSelectedDate}
            showTaskHistory={showTaskHistory}
            setShowTaskHistory={setShowTaskHistory}
            getPastDays={getPastDays}
            getTasksByDate={getTasksByDate}
            formatDate={formatDate}
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
