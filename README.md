# ContextCapture

A Chrome extension that captures screen regions, performs OCR text extraction, and generates AI-powered 3-line summaries.

## Features

- **Screen Region Selection**: Interactive overlay for selecting capture areas on web pages
- **OCR Text Extraction**: Supports OCR.Space API and Tesseract.js (local processing)
- **AI Summarization**: Generates concise 3-line summaries using OpenAI GPT or Anthropic Claude
- **Copy to Clipboard**: One-click copying of summaries
- **macOS-inspired UI**: Clean, modern interface with system-adaptive colors
- **Cross-device Sync**: Settings and API keys sync across devices

## Installation

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/aucus/context-capture.git
cd context-capture
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

### Production Build

```bash
npm run build
npm run package
```

This creates a `dist.zip` file ready for Chrome Web Store submission.

## Configuration

### API Keys Setup

1. **OCR Service**:
   - **OCR.Space**: Get a free API key from [OCR.Space](https://ocr.space/ocrapi) (500 calls/day)
   - **Tesseract.js**: No API key required (local processing)

2. **LLM Service**:
   - **OpenAI**: Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Anthropic**: Get an API key from [Anthropic Console](https://console.anthropic.com/)

### Settings

Open the extension popup and click "Settings" to configure:
- OCR service selection
- LLM service selection
- API keys
- Theme preferences

## Usage

1. **Start Capture**: Click the extension icon or use the popup "Capture Region" button
2. **Select Area**: Drag to select the region containing text
3. **Process**: The extension will automatically:
   - Capture the selected region
   - Extract text via OCR
   - Generate a 3-line AI summary
4. **Copy**: Click "Copy to Clipboard" to copy the summary

## Development

### Project Structure

```
src/
├── manifest.json           # Extension manifest
├── content-script/         # Web page interaction
│   ├── selector.ts        # Region selection logic
│   ├── ui.ts             # Results popup and styling
│   ├── capture.ts        # Screen capture coordination
│   └── content-script.ts # Main content script
├── background/            # Service worker
│   ├── ocr.ts           # OCR API integration
│   ├── llm.ts           # LLM API integration
│   ├── storage.ts       # Settings management
│   └── background.ts    # Main background script
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
    ├── constants.ts     # API endpoints and limits
    └── utils.ts         # Helper functions
```

### Available Scripts

- `npm run build` - Production build
- `npm run dev` - Development build with watch mode
- `npm test` - Run unit tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm run package` - Create distribution zip

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- storage.test.ts
```

## API Integration

### OCR Services

#### OCR.Space API
- **Endpoint**: `https://api.ocr.space/parse/image`
- **Free Tier**: 500 calls/day
- **Features**: Multiple language support, orientation detection

#### Tesseract.js
- **Local Processing**: No API calls required
- **Features**: Offline processing, no rate limits
- **Performance**: Slower than cloud APIs

### LLM Services

#### OpenAI GPT
- **Model**: gpt-3.5-turbo
- **Prompt**: "Summarize the following text in exactly 3 lines, focusing on key points:"
- **Token Limit**: 4096 tokens

#### Anthropic Claude
- **Model**: claude-3-haiku-20240307
- **Features**: Fast, cost-effective summarization
- **Token Limit**: 4096 tokens

## Security

- API keys stored securely in Chrome extension storage
- Content scripts never directly access API keys
- All API calls routed through background service worker
- No sensitive data logged in content script context
- Content Security Policy implemented

## Error Handling

### User-Facing Errors
- **No Selection**: "Please select an area to capture"
- **OCR Failure**: "Text recognition failed, please try again"
- **LLM Failure**: "Summary generation failed, check network and API key"
- **Invalid API Key**: "Please check your API key in settings"

### Developer Error Handling
- Comprehensive API response validation
- Network timeout handling (30 seconds)
- Retry logic with exponential backoff
- Graceful fallback mechanisms

## Performance

### Optimizations
- Image compression for OCR (max 1024px, JPEG 0.8 quality)
- Efficient region cropping using Canvas API
- Minimal DOM modifications
- Proper cleanup of event listeners
- Optimized bundle size

### Resource Management
- Efficient use of Chrome tabs.captureVisibleTab API
- Memory-conscious image processing
- API rate limit handling
- Automatic cleanup of temporary resources

## Browser Support

- Chrome 88+ (Manifest V3)
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Privacy

This extension:
- Only processes images you explicitly select
- Does not store or transmit any personal data
- Uses your configured API keys for OCR and LLM services
- Syncs settings across your devices (optional)

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/aucus/context-capture/issues) page.

## Changelog

### v1.0.0
- Initial release
- Screen region selection
- OCR text extraction (OCR.Space + Tesseract.js)
- AI summarization (OpenAI + Anthropic)
- Settings management
- Cross-device sync
