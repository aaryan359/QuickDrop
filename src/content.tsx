import React from 'react'
import ReactDOM from 'react-dom/client'
import './content.css'

// Create a floating button that appears on every website
const QuickDropButton: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="quickdrop-container">
      <button 
        className="quickdrop-button"
        onClick={handleClick}
        title="QuickDrop"
      >
        QD
      </button>
      
      {isOpen && (
        <div className="quickdrop-panel">
          <div className="quickdrop-header">
            <h3>QuickDrop</h3>
            <button 
              className="quickdrop-close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="quickdrop-content">
            <p>This extension is now working on this website!</p>
            <p>Current URL: {window.location.href}</p>
            <button 
              className="quickdrop-action-btn"
              onClick={() => {
                // Example action - you can add your functionality here
                alert('QuickDrop action triggered!')
              }}
            >
              Take Action
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Inject the component into the page
const injectQuickDrop = () => {
  // Create container for our React app
  const container = document.createElement('div')
  container.id = 'quickdrop-root'
  document.body.appendChild(container)

  // Render React component
  const root = ReactDOM.createRoot(container)
  root.render(<QuickDropButton />)
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectQuickDrop)
} else {
  injectQuickDrop()
} 