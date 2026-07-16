import './App.css'

const demoScreens = [
  { src: './demo-drop.png', label: 'Drop', text: 'Save a link, file, note, or reminder before you lose your flow.' },
  { src: './demo-feed.png', label: 'Feed', text: 'See everything you saved from your phone and browser in one place.' },
  { src: './demo-notes.png', label: 'Notes', text: 'Keep reusable text ready for applications, forms, research, and messages.' },
  { src: './demo-tasks.png', label: 'Tasks', text: 'Turn important saved items into simple follow-up tasks.' },
  { src: './demo-profile.png', label: 'Profile', text: 'Sign in once and keep your saved workspace with you.' },
]

const features = [
  {
    title: 'Capture anything useful',
    text: 'Save links, notes, images, PDFs, documents, commands, and copied text in seconds.',
  },
  {
    title: 'Use it on phone and Chrome',
    text: 'Save from one device and continue from the other without sending links to yourself.',
  },
  {
    title: 'Stop hunting for files',
    text: 'Keep important documents and images close when filling forms or applying somewhere.',
  },
  {
    title: 'Come back at the right time',
    text: 'Add reminders and tasks so saved things do not quietly disappear from your day.',
  },
]

const steps = [
  'Find something useful on your phone or laptop.',
  'Save it to QuickDrop in seconds.',
  'Open it later from the app or Chrome extension.',
]

const installSteps = [
  'Download the QuickDrop extension ZIP.',
  'Unzip it on your computer.',
  'Open chrome://extensions in Chrome, or edge://extensions / brave://extensions in other Chromium browsers.',
  'Turn on Developer mode.',
  'Click Load unpacked and select the unzipped QuickDrop folder.',
  'Pin QuickDrop from the extensions menu so it is always one click away.',
]

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    note: 'For trying QuickDrop and building a personal save-later habit.',
    features: ['Chrome extension', 'Save links and snippets', 'Basic notes and tasks', 'Manual reminders'],
  },
  {
    name: 'Lifetime',
    price: '$5',
    note: 'One-time payment for people who want the full personal workspace.',
    features: ['Mobile app sync', 'File and PDF saving', 'Unlimited saved items', 'Priority beta access'],
    featured: true,
  },
  {
    name: 'Custom',
    price: 'Talk to us',
    note: 'For teams, founders, researchers, and small groups that save together.',
    features: ['Shared team spaces', 'Shared tasks and reminders', 'Team onboarding', 'Custom integrations'],
  },
]

function App() {
  const repeatedScreens = [...demoScreens, ...demoScreens]
  const buildNumber = import.meta.env.VITE_BUILD_VERSION || 'local'
  const buildSha = (import.meta.env.VITE_BUILD_SHA || 'preview').slice(0, 7)
  const buildLabel = buildNumber === 'local'
    ? 'Local preview'
    : `Build #${buildNumber} • ${buildSha}`

  return (
    <main>
      <header className="site-nav">
        <a className="brand" href="#top" aria-label="QuickDrop home">
          <img src="./quickdrop-logo.png" alt="" />
          <span>QuickDrop</span>
        </a>
        <nav>
          <a href="#demo">Demo</a>
          <a href="#features">Features</a>
          <a href="#install">Install</a>
          <a href="#pricing">Pricing</a>
          <a href="#privacy">Privacy</a>
          <a href="#contact">Contact</a>
          <a className="nav-button" href="./quickdrop.zip" download>Get Extension</a>
        </nav>
      </header>

      <section id="top" className="hero">
        <div className="hero-copy">
          <p className="eyebrow">For tabs, files, notes, and reminders</p>
          <h1>QuickDrop</h1>
          <p className="hero-lede">
            One fast place to save what you find online: job posts, research links,
            PDFs, form text, screenshots, and ideas. Save it now, use it later from
            your phone or Chrome.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="./quickdrop.zip" download>Download Extension</a>
            <a className="secondary-action" href="#demo">See the app</a>
          </div>
          <div className="proof-row" aria-label="QuickDrop highlights">
            <span>Save from phone</span>
            <span>Use in Chrome</span>
            <span>Links, notes, files</span>
          </div>
          <p className="release-pill">Latest landing version: {buildLabel}</p>
        </div>

        <div className="hero-product" aria-label="QuickDrop product preview">
          <div className="phone-shell hero-phone">
            <img src="./demo-drop.png" alt="QuickDrop mobile drop screen" />
          </div>
          <div className="extension-panel">
            <div className="extension-top">
              <img src="./quickdrop-logo.png" alt="" />
              <span>QuickDrop</span>
            </div>
            <div className="extension-tabs">
              <span>Drop</span>
              <span>Feed</span>
              <span>Notes</span>
            </div>
            <div className="extension-item">
              <strong>Resume checklist for tomorrow</strong>
              <small>Saved from phone</small>
            </div>
            <div className="extension-item accent">
              <strong>Intern application list</strong>
              <small>Reminder set for 7 PM</small>
            </div>
            <button>Save Current Tab</button>
          </div>
        </div>
      </section>

      <section className="status-strip" aria-label="Product status">
        <div>
          <strong>Built for beta users</strong>
          <span>Try the extension now and join the mobile app rollout.</span>
        </div>
        <div>
          <strong>Made for real messy work</strong>
          <span>Research, job hunting, forms, docs, snippets, and files.</span>
        </div>
        <div>
          <strong>Organize less at capture time</strong>
          <span>Drop first. Search, edit, group, and summarize later.</span>
        </div>
      </section>

      <section id="demo" className="demo-section">
        <div className="section-heading">
          <p className="eyebrow">Product demo</p>
          <h2>See the flow before you install it.</h2>
          <p>
            The app keeps the daily workspace simple: drop, feed, notes, tasks,
            and account sync. The screenshots below scroll automatically like a product tour.
          </p>
        </div>
        <div className="demo-marquee">
          <div className="demo-track">
            {repeatedScreens.map((screen, index) => (
              <article className="demo-card" key={`${screen.label}-${index}`}>
                <div className="phone-shell">
                  <img src={screen.src} alt={`QuickDrop ${screen.label} screen`} />
                </div>
                <div>
                  <strong>{screen.label}</strong>
                  <span>{screen.text}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="feature-section">
        <div className="section-heading narrow">
          <p className="eyebrow">Why it feels useful</p>
          <h2>Less searching, less sending links to yourself.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-tile" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="install" className="install-section">
        <div className="section-heading narrow">
          <p className="eyebrow">Setup</p>
          <h2>Install QuickDrop in Chrome, Edge, or Brave.</h2>
          <p>
            Until the extension is published in the store, use the unpacked install flow.
            It takes less than a minute and works in most Chromium-based browsers.
          </p>
        </div>
        <div className="install-grid">
          {installSteps.map((step, index) => (
            <article className="install-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section">
        <div className="workflow-copy">
          <p className="eyebrow">How it works</p>
          <h2>Capture first. Organize later.</h2>
          <p>
            QuickDrop is for the messy moment when you cannot stop and organize.
            Save the thing, keep moving, then return from the feed when you have time.
          </p>
        </div>
        <div className="steps">
          {steps.map((step, index) => (
            <div className="step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="privacy" className="privacy-section">
        <div>
          <p className="eyebrow">Simple and clear</p>
          <h2>Your saved workspace stays with your account.</h2>
          <p>
            QuickDrop is for saving the things you choose: links, notes, files,
            reminders, and tasks. Your account keeps them available across the
            app and extension, and you can delete saved items when you no longer need them.
          </p>
        </div>
        <div className="privacy-links">
          <a href="./PRIVACY_POLICY.md">What data is saved</a>
          <a href="./TERMS.md">Beta usage terms</a>
          <a href="./LAUNCH_CHECKLIST.md">Product roadmap notes</a>
        </div>
      </section>

      <section id="pricing" className="pricing-section">
        <div className="section-heading narrow">
          <p className="eyebrow">Simple pricing</p>
          <h2>Start free. Upgrade when QuickDrop becomes part of your flow.</h2>
          <p>
            The goal is simple: make saving and reusing important things painless.
            Personal users can keep it lightweight, and teams can ask for shared workflows.
          </p>
        </div>
        <div className="pricing-grid">
          {pricingPlans.map((plan) => (
            <article className={`pricing-card ${plan.featured ? 'featured' : ''}`} key={plan.name}>
              {plan.featured ? <span className="plan-badge">Best for personal use</span> : null}
              <h3>{plan.name}</h3>
              <strong className="plan-price">{plan.price}</strong>
              <p>{plan.note}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a href={plan.name === 'Custom' ? '#contact' : './quickdrop.zip'} download={plan.name !== 'Custom'}>
                {plan.name === 'Custom' ? 'Contact for teams' : 'Get started'}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>Want to try QuickDrop or talk about a team workflow?</h2>
          <p>
            I am building QuickDrop in public and looking for early users who save a lot of
            links, notes, files, job posts, research, or reusable text.
          </p>
        </div>
        <div className="contact-card">
          <img src="./quickdrop-logo.png" alt="" />
          <h3>Aaryan Meena</h3>
          <a href="mailto:aaryanmeena96@gmail.com">aaryanmeena96@gmail.com</a>
          <a href="https://github.com/aaryan359" target="_blank" rel="noreferrer">github.com/aaryan359</a>
        </div>
      </section>

      <section className="final-cta">
        <img src="./quickdrop-logo.png" alt="" />
        <h2>Start saving without interrupting your work.</h2>
        <p>Try the Chrome extension today. Mobile app beta is being prepared for testers.</p>
        <a className="primary-action" href="./quickdrop.zip" download>Download QuickDrop</a>
      </section>

      <footer>
        <span>QuickDrop</span>
        <span>{buildLabel}</span>
        <span>Save now. Deal with it later.</span>
      </footer>
    </main>
  )
}

export default App
