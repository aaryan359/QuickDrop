# QuickDrop

Capture thoughts, drop files, save clipboard links, and check off today's tasks in a lightweight browser sidebar. **Zero tab-switching, zero clutter.**

QuickDrop is a premium, high-utility browser extension designed to sit quietly in your browser sidebar, ready whenever you need to store temporary text, scratch notes, code snippets, links, or files without interrupting your active workflow.

---

## ✨ Features

- **Drop Zone File Capture**: Drag files directly from your workspace, desktop, or webpage and drop them into the sidebar to store them locally.
- **Scratchpad Notes**: A persistent notes pad that auto-saves your thoughts. Great for copying meeting notes, quick ideas, or scratch text.
- **Link & Text Drop**: Quick-submit URLs, clipboard text, and configuration code blocks.
- **Tasks Checklist**: A zero-friction, minimal checklist to manage and complete tasks for your current session.
- **Light & Dark Mode**: A premium HSL-curated visual theme with smooth light/dark toggling.
- **100% Offline & Private**: Zero cloud telemetry, zero sync APIs. All data remains locked in Google Chrome's local sandboxed extension storage.

---

## Repository Structure

The repository is organized into two primary applications:

```
QuickDrop/
├── landing-page/       # Landing page web application (Vite + React)
│   ├── src/            # Theme, interactive components, mockups
│   └── public/         # Static assets and pre-packaged extension installer (.zip)
├── src/                # Chrome Extension React components & logic
├── public/             # Static extension assets (manifest.json, icons)
└── package.json        # Main extension build configurations
```

---

## Installation & Setup

Installing QuickDrop takes under 30 seconds and is completely secure:

### Option 1: Pre-packaged Extension
1. Download `quickdrop.zip` from the landing page.
2. Extract the ZIP file to a folder on your local drive.
3. Open Google Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** using the toggle in the top-right corner.
5. Click **Load unpacked** in the top-left and select the extracted folder.

### Option 2: Build from Source
If you wish to audit the code and build the extension package yourself:

1. Clone the repository:
   ```bash
   git clone https://github.com/aaryan359/QuickDrop.git
   cd QuickDrop
   ```
2. Install dependencies & compile:
   ```bash
   npm install
   npm run build
   ```
3. Load the output `dist/` directory as an unpacked extension in `chrome://extensions/`.

---

## Landing Page & CI/CD Deployment

The QuickDrop landing page is located in the `landing-page/` folder.

### Run Website Locally
```bash
cd landing-page
npm install
npm run dev
```

### GitHub Pages Deployment
A GitHub Actions workflow is set up at `.github/workflows/deploy.yml` to automatically build and deploy the landing page website to GitHub Pages:

- **Target URL**: `https://aaryan359.github.io/QuickDrop/`
- **Trigger**: Every push to the `main` or `master` branch builds the production Vite bundles and deploys them to the `github-pages` environment.

---

## Creator

Designed and built with passion by **Aaryan**:
- [Portfolio Website](https://aaryan359.github.io/portfolio/)
- [aaryanmeena96@gmail.com](mailto:aaryanmeena96@gmail.com)
