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

declare const chrome: any;

// Listen for messages from background script
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request: any) => {
    if (request.type === 'SHOW_NOTIFICATION') {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed !important;
        bottom: 50px !important;
        left: 50% !important;
        transform: translate(-50%, 50px) !important;
        background: rgba(16, 185, 129, 0.95) !important;
        color: white !important;
        padding: 12px 24px !important;
        border-radius: 30px !important;
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3) !important;
        z-index: 2147483647 !important;
        opacity: 0 !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        pointer-events: none !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        backdrop-filter: blur(10px) !important;
      `;
      notification.innerHTML = `
        <span style="font-size: 15px;">✓</span>
        <span>${request.message}</span>
      `;
      document.body.appendChild(notification);
      
      // Animate in
      setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translate(-50%, 0)';
      }, 10);

      // Remove after 2.2s
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, 50px)';
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 2200);
    }
  });
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