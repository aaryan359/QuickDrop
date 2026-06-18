import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [activeTab, setActiveTab] = useState<'drop' | 'notes' | 'tasks'>('drop')
  const [liveInputText, setLiveInputText] = useState('')
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Take quick notes during the Zoom meeting', done: true },
    { id: 2, text: 'Audit extension source code for security', done: false },
    { id: 3, text: 'Load unpacked build inside Chrome extensions', done: false },
  ])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  return (
    <>
      {/* Site Navigation Header */}
      <header className="site-header">
        <div className="header-container">
          <div className="logo-brand">
            <span className="logo-dot"></span>
            QuickDrop
          </div>
          <nav className="header-nav">
            <a href="#features">Features</a>
            <a href="#compare">Compare</a>
            <a href="#installation">Install</a>
            <a href="#audit">Source</a>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="theme-toggle-btn"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>
            <a href="./quickdrop.zip" download className="nav-cta">Download</a>
          </nav>
        </div>
      </header>      {/* Hero Content Section */}
      <section className="hero-split-section">
        {/* Left Column: Copy & CTA */}
        <div className="hero-copy-column">
          <div className="badge-promo">⚡ Zero-Friction Scratchpad</div>
          <h1 className="title-gradient">QuickDrop</h1>
          <p className="subtitle-description">
            Capture thoughts, drop files, save clipboard links, and check off today's tasks in a lightweight browser sidebar. Zero tab-switching, zero clutter.
          </p>
          <a
            href="./quickdrop.zip"
            download
            className="counter"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Extension (.zip)
          </a>
        </div>

        {/* Right Column: Browser Showcase Mockup */}
        <div className="hero-mockup-column">
          <div className="browser-mockup">
            <div className="browser-header">
              <div className="browser-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="browser-address">
                https://meet.google.com/abc-defg-hij
              </div>
            </div>

            <div className="browser-body">
              {/* Left Page (Simulated Google Meet / Web Workspace) */}
              <div className="mock-webpage">
                <div className="mock-video-meeting">
                  <div className="video-card">
                    <div className="video-avatar">JS</div>
                    <span>John (Presenter)</span>
                  </div>
                  <div className="video-card">
                    <div className="video-avatar">YO</div>
                    <span>You</span>
                  </div>
                </div>
                <div className="mock-meeting-info">
                  <h3>Design Sync & Review</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text)' }}>
                    Discussing final components and local storage schema upgrades.
                  </p>
                </div>
              </div>

              {/* Right Sidebar (QuickDrop Extension Panel) */}
              <div className="mock-sidebar">
                <div className="sidebar-header">
                  <span className="sidebar-title">QuickDrop</span>
                  <span className="sidebar-version">v1.0.0</span>
                </div>

                {/* Sidebar Tabs */}
                <div className="sidebar-tabs">
                  <button
                    className={`sidebar-tab-btn ${activeTab === 'drop' ? 'active' : ''}`}
                    onClick={() => setActiveTab('drop')}
                  >
                    Drop
                  </button>
                  <button
                    className={`sidebar-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                  >
                    Notes
                  </button>
                  <button
                    className={`sidebar-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tasks')}
                  >
                    Tasks
                  </button>
                </div>

                {/* Sidebar Body */}
                <div className="sidebar-body">
                  {activeTab === 'drop' && (
                    <>
                      <div className="sidebar-drop-area">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '4px' }}>
                          <polyline points="16 16 12 12 8 16"></polyline>
                          <line x1="12" y1="12" x2="12" y2="21"></line>
                          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                        </svg>
                        <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Drag files to drop</div>
                        <span style={{ fontSize: '9px', color: 'var(--text)' }}>Or paste links below</span>
                      </div>
                      <div className="sidebar-input-group">
                        <input
                          type="text"
                          placeholder="Paste URL here..."
                          value={liveInputText}
                          onChange={(e) => setLiveInputText(e.target.value)}
                        />
                        <button
                          className="sidebar-btn-sm"
                          onClick={() => {
                            if (liveInputText) {
                              setLiveInputText('')
                            }
                          }}
                        >
                          {liveInputText ? 'Clear' : 'Drop'}
                        </button>
                      </div>
                      <div className="sidebar-list">
                        {liveInputText && (
                          <div className="sidebar-item live-item-pulse">
                            <span className="badge note">Live</span>
                            <div className="item-text">{liveInputText}</div>
                          </div>
                        )}
                        <div className="sidebar-item">
                          <span className="badge url">Link</span>
                          <div className="item-text">https://vite.dev/config</div>
                        </div>
                        <div className="sidebar-item">
                          <span className="badge note">Text</span>
                          <div className="item-text">Storage quotas: use chrome.storage</div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'notes' && (
                    <div className="sidebar-notes-box">
                      <div className="notes-box-header">
                        <span>Untitled Note</span>
                        <div className="notes-box-tools">
                          <span>B</span>
                          <span>I</span>
                          <span>• List</span>
                        </div>
                      </div>
                      <div className="notes-box-body">
                        <p style={{ fontWeight: '600', marginBottom: '4px' }}>Brainstorm:</p>
                        <ul style={{ paddingLeft: '12px', margin: 0 }}>
                          {liveInputText ? (
                            <li>{liveInputText}</li>
                          ) : (
                            <>
                              <li>Inspect manifest default_popup path</li>
                              <li>Clean storage layout</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'tasks' && (
                    <div className="sidebar-tasks">
                      <div className="sidebar-input-group">
                        <input
                          type="text"
                          placeholder="New task..."
                          value={liveInputText}
                          onChange={(e) => setLiveInputText(e.target.value)}
                        />
                        <button
                          className="sidebar-btn-sm"
                          onClick={() => {
                            if (liveInputText) {
                              setTasks([{ id: Date.now(), text: liveInputText, done: false }, ...tasks])
                              setLiveInputText('')
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div className="sidebar-tasks-list">
                        {tasks.map(t => (
                          <div
                            key={t.id}
                            className={`sidebar-task-item ${t.done ? 'done' : ''}`}
                            onClick={() => toggleTask(t.id)}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <input type="checkbox" checked={t.done} onChange={() => { }} />
                            <span>{t.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Ticks Divider */}
      <div className="ticks"></div>

      {/* Core Features */}
      <section className="features-section" id="features">
        <h2 style={{ fontSize: '24px', margin: '0 0 6px 0', color: 'var(--text-h)' }}>Core Features</h2>
        <p style={{ color: 'var(--text)', fontSize: '14px', margin: '0 0 24px 0' }}>
          Designed to stay completely out of your way until you need it.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16"></polyline>
                <line x1="12" y1="12" x2="12" y2="21"></line>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
              </svg>
              Drop Zone File Capture
            </h3>
            <p>
              Drag files directly from any webpage or folder on your desktop straight into the panel. QuickDrop safely stores files in your browser locally, keeping your workspace clean.
            </p>
          </div>

          <div className="feature-card">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Quick Scratchpad Notes
            </h3>
            <p>
              A persistent markdown scratchpad that auto-saves your thoughts. Great for writing sudden meeting notes, phone numbers, or copying layout coordinate values.
            </p>
          </div>

          <div className="feature-card">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              Focus Tasks Checklist
            </h3>
            <p>
              Track your instant to-dos for today. The dashboard filters out tasks from previous days to keep you focused on what is right in front of you.
            </p>
          </div>

          <div className="feature-card">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              100% Private & Offline
            </h3>
            <p>
              No external APIs, databases, tracking scripts, or analytics. Your notes, files, and tasks never leave your local system—making it perfectly safe for corporate environments.
            </p>
          </div>
        </div>
      </section>

      {/* Ticks Divider */}
      <div className="ticks"></div>

      {/* Feature Comparison Matrix */}
      <section className="comparison-section" id="compare">
        <h2 style={{ fontSize: '24px', margin: '0 0 6px 0', color: 'var(--text-h)' }}>How It Compares</h2>
        <p style={{ color: 'var(--text)', fontSize: '14px', margin: '0 0 24px 0' }}>
          Why developers choose QuickDrop over standard bookmarking tools or notepad apps.
        </p>

        <div className="table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th style={{ color: 'var(--accent)' }}>QuickDrop</th>
                <th>Standard Bookmarks</th>
                <th>Notes Apps</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Zero Tab-Switching Access</strong></td>
                <td className="check-yes">✔ Yes (Side Panel)</td>
                <td className="check-no">✖ Requires New Tab</td>
                <td className="check-no">✖ Separate App Window</td>
              </tr>
              <tr>
                <td><strong>Drag-and-Drop Files</strong></td>
                <td className="check-yes">✔ Yes</td>
                <td className="check-no">✖ No</td>
                <td className="check-no">✖ Drag limitations</td>
              </tr>
              <tr>
                <td><strong>Smart URL Parsing</strong></td>
                <td className="check-yes">✔ Yes</td>
                <td className="check-no">✖ Manual bookmarks</td>
                <td className="check-no">✖ Paste raw strings</td>
              </tr>
              <tr>
                <td><strong>Daily Focused Checklist</strong></td>
                <td className="check-yes">✔ Yes (Resets daily)</td>
                <td className="check-no">✖ No</td>
                <td className="check-yes">✔ Yes</td>
              </tr>
              <tr>
                <td><strong>Corporate Safe / 100% Local</strong></td>
                <td className="check-yes">✔ Yes</td>
                <td className="check-yes">✔ Yes</td>
                <td className="check-no">✖ Cloud databases sync</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Ticks Divider */}
      <div className="ticks"></div>

      {/* Horizontal Installation Steps Section */}
      <section className="guide-section" id="installation">
        <h2 style={{ fontSize: '24px', margin: '0 0 6px 0', color: 'var(--text-h)', textAlign: 'center' }}>Installation Guide</h2>
        <p style={{ color: 'var(--text)', fontSize: '14px', margin: '0 0 32px 0', textAlign: 'center' }}>
          Get QuickDrop up and running in Google Chrome in under 30 seconds.
        </p>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number-badge">1</div>
            <h3>Download Installer</h3>
            <p>Click below to download the latest packaged extension release archive.</p>
            <a href="./quickdrop.zip" download className="download-step-btn">
              Download .zip
            </a>
          </div>

          <div className="step-card">
            <div className="step-number-badge">2</div>
            <h3>Open Extensions Tab</h3>
            <p>Type <code>chrome://extensions</code> inside your Chrome browser URL address bar and press Enter.</p>
          </div>

          <div className="step-card">
            <div className="step-number-badge">3</div>
            <h3>Load Unpacked Build</h3>
            <p>Enable <strong>Developer mode</strong> (top-right toggle), click <strong>Load unpacked</strong> (top-left button), and select the unzipped directory.</p>
          </div>
        </div>
      </section>

      {/* Ticks Divider */}
      <div className="ticks"></div>

      {/* Audit & Build Section */}
      <section className="audit-section" id="audit">
        <div className="audit-content">
          <div className="audit-text">
            <h2>Audit & Build from Source</h2>
            <p>
              Your security is paramount. Because QuickDrop stores all data locally in Chrome's sandbox database with <strong>zero cloud sync</strong>, we encourage you to verify the code yourself.
            </p>
            <p>
              To compile the extension manually, clone the repository and run the build scripts to output your own clean, inspected bundle:
            </p>
          </div>

          <div className="terminal-container">
            <div className="terminal-bar">
              <div className="dots">
                <span className="dot-red"></span>
                <span className="dot-yellow"></span>
                <span className="dot-green"></span>
              </div>
              <span className="terminal-title">bash - Compile Extension</span>
            </div>
            <div className="terminal-body">
              <div className="terminal-line"><span className="prompt">$</span> git clone https://github.com/YOUR_USERNAME/QuickDrop.git</div>
              <div className="terminal-line"><span className="prompt">$</span> cd QuickDrop</div>
              <div className="terminal-line"><span className="prompt">$</span> npm install</div>
              <div className="terminal-line"><span className="prompt">$</span> npm run build</div>
              <div className="terminal-comment"># Select the compiled 'dist/' directory in chrome://extensions!</div>
            </div>
          </div>
        </div>
      </section>

      {/* Site Footer */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-dev-info">
            <h3>About the Creator</h3>
            <p>
              QuickDrop was designed and built by <strong>Aaryan</strong>. I love building lightweight, zero-friction tools that solve real developer workflows, eliminate window-switching fatigue, and keep user data fully private and local.
            </p>
            <p className="dev-contact-links" style={{ marginTop: '12px', fontSize: '13px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a href="https://aaryan359.github.io/portfolio/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                Portfolio Website
              </a>
              <a href="mailto:aaryanmeena96@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                aaryanmeena96@gmail.com
              </a>
            </p>
          </div>
          <div className="footer-links">
            <p className="copyright">© 2026 QuickDrop. Built with Vite & React.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
