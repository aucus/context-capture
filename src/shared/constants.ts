// API Endpoints
export const API_ENDPOINTS = {
  OCR_SPACE: 'https://api.ocr.space/parse/image',
  OPENAI: 'https://api.openai.com/v1/chat/completions',
  ANTHROPIC: 'https://api.anthropic.com/v1/messages',
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
} as const;

// API Limits
export const API_LIMITS = {
  OCR_SPACE_FREE_TIER: 500, // calls per day
  OPENAI_MAX_TOKENS: 4096,
  ANTHROPIC_MAX_TOKENS: 4096,
  GEMINI_MAX_TOKENS: 8192
} as const;

// Chrome Extension Constants
export const EXTENSION_CONSTANTS = {
  MIN_SELECTION_SIZE: 50, // minimum pixels for selection
  MAX_IMAGE_SIZE: 1024 * 1024, // 1MB max image size
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
} as const;

// UI Constants
export const UI_CONSTANTS = {
  POPUP_WIDTH: 400,
  POPUP_HEIGHT: 300,
  BORDER_RADIUS: 8,
  SHADOW: '0 4px 12px rgba(0, 0, 0, 0.15)',
  ANIMATION_DURATION: 200
} as const;

// Message Types
export const MESSAGE_TYPES = {
  CAPTURE_REGION: 'CAPTURE_REGION',
  OCR_REQUEST: 'OCR_REQUEST',
  LLM_REQUEST: 'LLM_REQUEST',
  SHOW_RESULTS: 'SHOW_RESULTS',
  GET_SETTINGS: 'GET_SETTINGS',
  SAVE_SETTINGS: 'SAVE_SETTINGS',
  TEST_API: 'TEST_API'
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  SETTINGS: 'extensionSettings',
  OCR_API_KEY: 'ocrApiKey',
  OPENAI_API_KEY: 'openaiApiKey',
  ANTHROPIC_API_KEY: 'anthropicApiKey',
  GEMINI_API_KEY: 'geminiApiKey',
  OCR_SERVICE: 'ocrService',
  LLM_SERVICE: 'llmService',
  THEME: 'theme'
} as const;

// Default Settings
export const DEFAULT_SETTINGS = {
  ocrService: 'ocrspace' as const,
  llmService: 'openai' as const,
  theme: 'system' as const
} as const;
