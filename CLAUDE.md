# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Context Capture is a Chrome extension (Manifest V3) that captures screen regions, performs OCR text extraction, and generates 3-line summaries using LLM APIs. The extension enables users to select areas on web pages, extract text via OCR, and get AI-powered summaries with copy-to-clipboard functionality.

## Architecture

### Chrome Extension Structure
- **manifest.json**: Manifest V3 configuration with required permissions
- **content-script/**: Handles screen region selection and UI injection into web pages
- **background/**: Service worker for OCR and LLM API calls, manages API keys
- **popup/**: Extension popup for quick access and status
- **options/**: Settings page for API key configuration and testing

### Key Components
- **Region Selector**: Interactive overlay for selecting capture areas on web pages
- **OCR Service**: Integrates with OCR.Space API (free tier: 500 calls/day) or Tesseract.js
- **LLM Service**: Connects to OpenAI/Anthropic APIs for text summarization
- **Results UI**: macOS-style card popup with summary and copy functionality

### Data Flow
1. Content script creates selection overlay on web page
2. User selects region → screen capture via Chrome APIs
3. Background script processes image through OCR API
4. Extracted text sent to LLM API for 3-line summary
5. Results displayed in styled popup with copy-to-clipboard

## Development Commands

### Setup
```bash
npm install                    # Install dependencies
npm run build                 # Build extension for production
npm run dev                   # Build with watch mode for development
```

### Testing
```bash
npm test                      # Run unit tests
npm run test:watch           # Run tests in watch mode
npm run lint                 # Run ESLint
npm run type-check           # Run TypeScript checks
```

### Chrome Extension Development
```bash
npm run build:dev            # Build development version
npm run package              # Create distribution zip
```

Load extension in Chrome:
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked" and select `dist/` folder

## API Integration

### OCR Services
- **Primary**: OCR.Space API (requires API key in options page)
- **Fallback**: Tesseract.js (local processing, no API key needed)

### LLM Services
- **Supported**: OpenAI GPT, Anthropic Claude
- **Configuration**: API keys stored in Chrome extension storage
- **Prompt**: "Summarize the following text in exactly 3 lines, focusing on key points:"

## Security Considerations

- API keys stored only in Chrome extension storage (background script access)
- Content scripts never directly access API keys
- All API calls routed through background service worker
- No sensitive data logged or exposed in content script context

## UI/UX Guidelines

### Design System
- **Style**: macOS-inspired design with rounded corners and clean typography
- **Icons**: Feather/Lucide icon set for consistency
- **Colors**: System-adaptive with light/dark mode support
- **Positioning**: Results popup appears near selected region (top-right preferred)

### User Interactions
- **Selection**: Click and drag to select capture region
- **Feedback**: Loading states during OCR and summarization
- **Error Handling**: User-friendly messages for common failure scenarios

## Error Scenarios

### Handled Errors
- No selection made: "Please select an area to capture"
- OCR failure: "Text recognition failed, please try again"
- LLM API failure: "Summary generation failed, check network and API key"
- Invalid API key: "Please check your API key in settings"

### Testing Error Flows
- Test with invalid regions (too small, off-screen)
- Test API failures (network issues, rate limits)
- Test with images containing no text
- Test with non-English text if OCR supports it

## File Structure Expectations

```
src/
├── manifest.json           # Extension manifest
├── content-script/         # Web page interaction
│   ├── selector.ts        # Region selection logic
│   ├── ui.ts             # Results popup and styling
│   └── capture.ts        # Screen capture coordination
├── background/            # Service worker
│   ├── ocr.ts           # OCR API integration
│   ├── llm.ts           # LLM API integration
│   └── storage.ts       # Settings and API key management
├── popup/               # Extension popup
│   ├── popup.html
│   ├── popup.ts
│   └── popup.css
├── options/             # Settings page
│   ├── options.html
│   ├── options.ts
│   └── options.css
└── shared/              # Common utilities
    ├── types.ts         # TypeScript interfaces
    ├── constants.ts     # API endpoints, limits
    └── utils.ts         # Helper functions
```

## Development Workflow

1. **Content Script Development**: Test region selection and UI overlay
2. **Background Script Development**: Test API integrations independently
3. **Integration Testing**: End-to-end capture → OCR → summarization flow
4. **Extension Testing**: Load unpacked extension and test in various websites
5. **Error Testing**: Simulate API failures and edge cases

## Common Development Patterns

- Use Chrome extension APIs through background script message passing
- Implement retry logic for API calls with exponential backoff
- Store user preferences in Chrome storage.sync for cross-device sync
- Use content script injection only when necessary to minimize page impact
- Implement proper cleanup for event listeners and DOM modifications