# QuickDrop Browser Extension

A React-based browser extension built with Vite and TypeScript.

## Development

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load the extension in your browser:

### Chrome/Edge:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

### Firefox:
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from the `dist` folder

## Development Workflow

- Run `npm run dev` for development with hot reload
- Run `npm run build` to build the extension for production
- The extension will be built to the `dist` folder

## Project Structure

- `src/` - React components and application logic
- `public/` - Static assets and manifest.json
- `dist/` - Built extension (created after build)

## Features

- Modern React with TypeScript
- Vite for fast development and building
- Browser extension popup interface
- Responsive design optimized for extension popup<!-- # QuickDrop Browser Extension

A React-based browser extension built with Vite and TypeScript.

## Development

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load the extension in your browser:

### Chrome/Edge:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

### Firefox:
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from the `dist` folder

## Development Workflow

- Run `npm run dev` for development with hot reload
- Run `npm run build` to build the extension for production
- The extension will be built to the `dist` folder

## Project Structure

- `src/` - React components and application logic
- `public/` - Static assets and manifest.json
- `dist/` - Built extension (created after build)

## Features

- Modern React with TypeScript
- Vite for fast development and building
- Browser extension popup interface
- Responsive design optimized for extension popup -->
