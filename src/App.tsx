


import { useState, useEffect, useRef } from 'react'
import './App.css'

// Chrome API type declarations
declare const chrome: any

interface FileItem {
  id: string
  name: string
  type: 'text' | 'image' | 'pdf' | 'url' | 'other'
  content: string
  url?: string
  size?: string
  date: Date
}

interface Task {
  id: string
  title: string
  completed: boolean
  date: Date
}

// Storage utility functions
const saveData = async (files: FileItem[], tasks: Task[]) => {
  try {
    // Try Chrome storage first
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'SAVE_DATA',
          data: { files, tasks }
        }, (response: any) => {
          if (response && response.success) {
            resolve(response)
          } else {
            reject(new Error('Chrome storage failed'))
          }
        })
      })
    } else {
      // Fallback to localStorage
      localStorage.setItem('quickdrop-files', JSON.stringify(files))
      localStorage.setItem('quickdrop-tasks', JSON.stringify(tasks))
    }
  } catch (error) {
    console.error('Error saving data:', error)
    // Final fallback to localStorage
    try {
      localStorage.setItem('quickdrop-files', JSON.stringify(files))
      localStorage.setItem('quickdrop-tasks', JSON.stringify(tasks))
    } catch (localError) {
      console.error('localStorage also failed:', localError)
    }
  }
}

const loadData = async (): Promise<{ files: FileItem[], tasks: Task[] }> => {
  try {
    // Try Chrome storage first
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'LOAD_DATA'
        }, (response: any) => {
          if (response) {
            const files = (response.files || []).map((file: any) => ({
              ...file,
              date: new Date(file.date)
            }))
            const tasks = (response.tasks || []).map((task: any) => ({
              ...task,
              date: new Date(task.date)
            }))
            resolve({ files, tasks })
          } else {
            reject(new Error('Chrome storage failed'))
          }
        })
      })
    } else {
      // Fallback to localStorage
      const savedFiles = localStorage.getItem('quickdrop-files')
      const savedTasks = localStorage.getItem('quickdrop-tasks')
      
      const files = savedFiles ? JSON.parse(savedFiles).map((file: any) => ({
        ...file,
        date: new Date(file.date)
      })) : []
      
      const tasks = savedTasks ? JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        date: new Date(task.date)
      })) : []
      
      return { files, tasks }
    }
  } catch (error) {
    console.error('Error loading data:', error)
    // Final fallback to localStorage
    try {
      const savedFiles = localStorage.getItem('quickdrop-files')
      const savedTasks = localStorage.getItem('quickdrop-tasks')
      
      const files = savedFiles ? JSON.parse(savedFiles).map((file: any) => ({
        ...file,
        date: new Date(file.date)
      })) : []
      
      const tasks = savedTasks ? JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        date: new Date(task.date)
      })) : []
      
      return { files, tasks }
    } catch (localError) {
      console.error('localStorage also failed:', localError)
      return { files: [], tasks: [] }
    }
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<'drop' | 'files' | 'tasks'>('drop')
  const [files, setFiles] = useState<FileItem[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isDragging, setIsDragging] = useState(false)
  const [textNote, setTextNote] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [showTaskHistory, setShowTaskHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredFile, setHoveredFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load data from storage on component mount
  useEffect(() => {
    const loadDataOnMount = async () => {
      try {
        const { files: loadedFiles, tasks: loadedTasks } = await loadData()
        setFiles(loadedFiles)
        setTasks(loadedTasks)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadDataOnMount()
  }, [])

  // Save data to storage whenever files or tasks change
  useEffect(() => {
    if (!isLoading) {
      saveData(files, tasks)
    }
  }, [files, tasks, isLoading])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    processFiles(selectedFiles)
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const processFiles = (fileList: File[]) => {
    fileList.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const fileItem: FileItem = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: getFileType(file.name),
          content,
          size: formatFileSize(file.size),
          date: new Date()
        }
        setFiles(prev => [...prev, fileItem])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSelectFiles = () => {
    fileInputRef.current?.click()
  }

  const handleTextSubmit = () => {
    if (textNote.trim()) {
      const textItem: FileItem = {
        id: Date.now().toString() + Math.random(),
        name: `Text Note ${new Date().toLocaleString()}`,
        type: 'text',
        content: textNote,
        date: new Date()
      }
      setFiles(prev => [...prev, textItem])
      setTextNote('')
      showNotification('Text note added!')
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      const urlItem: FileItem = {
        id: Date.now().toString() + Math.random(),
        name: `URL ${new Date().toLocaleString()}`,
        type: 'url',
        content: urlInput,
        url: urlInput,
        date: new Date()
      }
      setFiles(prev => [...prev, urlItem])
      setUrlInput('')
      showNotification('URL added!')
    }
  }

  const getFileType = (fileName: string): FileItem['type'] => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image'
    if (ext === 'pdf') return 'pdf'
    if (ext === 'txt' || ext === 'md') return 'text'
    return 'other'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      showNotification('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      showNotification('Failed to copy to clipboard')
    }
  }

  const downloadFile = (file: FileItem) => {
    const link = document.createElement('a')
    link.href = file.content
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotification('Download started!')
  }

  const openUrl = (url: string) => {
    window.open(url, '_blank')
  }

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
    showNotification('File deleted!')
  }

  const showNotification = (message: string) => {
    const notification = document.createElement('div')
    notification.className = 'notification'
    notification.textContent = message
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString() + Math.random(),
        title: newTask,
        completed: false,
        date: new Date()
      }
      setTasks(prev => [...prev, task])
      setNewTask('')
      showNotification('Task added!')
    }
  }

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
    showNotification('Task deleted!')
  }

  const getTasksByDate = (date: string) => {
    return tasks.filter(task => 
      task.date.toISOString().split('T')[0] === date
    )
  }

  const getCompletedTasks = (date: string) => {
    return getTasksByDate(date).filter(task => task.completed).length
  }

  const getTotalTasks = (date: string) => {
    return getTasksByDate(date).length
  }

  const getPastDays = (days: number) => {
    const dates = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const getFileCardClassName = (file: FileItem) => {
    return `file-card ${file.type}-card`
  }

  const renderFilePreview = (file: FileItem) => {
    if (hoveredFile !== file.id) return null

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
              {file.content.length > 200 
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
              📄 PDF Document - {file.size}
            </div>
          )}
          {file.type === 'other' && (
            <div className="file-preview-text">
              📁 File - {file.size}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading QuickDrop...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="header">
        <h1>QuickDrop</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'drop' ? 'active' : ''}`}
            onClick={() => setActiveTab('drop')}
          >
            📁 Drop Files
          </button>
          <button 
            className={`tab ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            📋 File List ({files.length})
          </button>
          <button 
            className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            ✅ Tasks
          </button>
        </div>
      </div>

      <div className="content">
        {activeTab === 'drop' && (
          <div className="drop-zone">
            <div 
              className={`file-drop-area ${isDragging ? 'dragging' : ''}`}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="drop-icon">📁</div>
              <h3>Drop files here</h3>
              <p>Drag and drop any files, images, PDFs, or documents</p>
              <div className="drop-hint">
                <span>Supported: Images, PDFs, Text files, URLs</span>
              </div>
              <button 
                className="select-files-btn"
                onClick={handleSelectFiles}
              >
                📁 Select Files
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept="image/*,.pdf,.txt,.md,.doc,.docx"
            />

            <div className="input-sections">
              <div className="input-section">
                <h4>📝 Add Text Note</h4>
                <textarea 
                  placeholder="Enter your text note..."
                  value={textNote}
                  onChange={(e) => setTextNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleTextSubmit()
                    }
                  }}
                />
                <button onClick={handleTextSubmit}>
                  Add Text Note
                </button>
              </div>

              <div className="input-section">
                <h4>🔗 Add URL</h4>
                <input 
                  type="url" 
                  placeholder="Enter URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUrlSubmit()
                    }
                  }}
                />
                <button onClick={handleUrlSubmit}>
                  Add URL
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="files-list">
            <div className="files-header">
              <h3>Your Files ({files.length})</h3>
              {files.length > 0 && (
                <button 
                  className="clear-all-btn"
                  onClick={() => {
                    setFiles([])
                    showNotification('All files cleared!')
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
            {files.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h4>No files uploaded yet</h4>
                <p>Go to the Drop Files tab to add some files!</p>
              </div>
            ) : (
              <div className="files-grid">
                {files.map(file => (
                  <div 
                    key={file.id} 
                    className={getFileCardClassName(file)}
                    onMouseEnter={() => setHoveredFile(file.id)}
                    onMouseLeave={() => setHoveredFile(null)}
                  >
                    {renderFilePreview(file)}
                    <div className="file-icon">
                      {file.type === 'image' && '🖼️'}
                      {file.type === 'pdf' && '📄'}
                      {file.type === 'text' && '📝'}
                      {file.type === 'url' && '🔗'}
                      {file.type === 'other' && '📁'}
                    </div>
                    <div className="file-info">
                      <h4>{file.name}</h4>
                      <p className="file-date">{file.date.toLocaleString()}</p>
                      {file.size && <p className="file-size">{file.size}</p>}
                    </div>
                    <div className="file-actions">
                      <button 
                        onClick={() => copyToClipboard(file.content)}
                        title="Copy to clipboard"
                        className="action-btn copy-btn"
                      >
                        📋
                      </button>
                      {file.type === 'url' && (
                        <button 
                          onClick={() => openUrl(file.url!)}
                          title="Open URL"
                          className="action-btn open-btn"
                        >
                          🔗
                        </button>
                      )}
                      {(file.type === 'image' || file.type === 'pdf') && (
                        <button 
                          onClick={() => downloadFile(file)}
                          title="Download file"
                          className="action-btn download-btn"
                        >
                          ⬇️
                        </button>
                      )}
                      <button 
                        onClick={() => deleteFile(file.id)}
                        title="Delete file"
                        className="action-btn delete-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-section">
            <div className="task-header">
              <h3>Task Tracker</h3>
              <div className="task-controls">
                <div className="date-selector">
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <button 
                  className="history-toggle"
                  onClick={() => setShowTaskHistory(!showTaskHistory)}
                >
                  {showTaskHistory ? '📅 Hide History' : '📅 Show History'}
                </button>
              </div>
            </div>

            {showTaskHistory && (
              <div className="task-history">
                <h4>Recent Days</h4>
                <div className="history-days">
                  {getPastDays(7).map(date => {
                    const dayTasks = getTasksByDate(date)
                    const completed = dayTasks.filter(task => task.completed).length
                    const total = dayTasks.length
                    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
                    
                    return (
                      <div key={date} className="history-day">
                        <div className="history-date">{formatDate(date)}</div>
                        <div className="history-stats">
                          <span>{completed}/{total} completed</span>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="task-stats">
              <div className="stat">
                <span className="stat-label">Total Tasks</span>
                <span className="stat-value">{getTotalTasks(selectedDate)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Completed</span>
                <span className="stat-value">{getCompletedTasks(selectedDate)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Progress</span>
                <span className="stat-value">
                  {getTotalTasks(selectedDate) > 0 
                    ? Math.round((getCompletedTasks(selectedDate) / getTotalTasks(selectedDate)) * 100)
                    : 0}%
                </span>
              </div>
            </div>

            <div className="add-task">
              <input 
                type="text"
                placeholder="What do you need to do today?"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTask()
                  }
                }}
              />
              <button onClick={addTask}>Add Task</button>
            </div>

            <div className="tasks-list">
              {getTasksByDate(selectedDate).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <h4>No tasks for this date</h4>
                  <p>Add some tasks above to get started!</p>
                </div>
              ) : (
                getTasksByDate(selectedDate).map(task => (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <input 
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="task-checkbox"
                    />
                    <span className="task-title">{task.title}</span>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="delete-task"
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
