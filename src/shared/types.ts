// Region selection types
export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CaptureResult {
  imageData: string;
  region: Region;
}

// OCR types
export interface OCRResult {
  text: string;
  confidence: number;
  success: boolean;
  error?: string;
}

// LLM types
export interface SummaryResult {
  summary: string;
  success: boolean;
  error?: string;
}

// Message types for communication between content script and background
export interface Message {
  type: string;
  data?: any;
  error?: string;
}

export interface CaptureRegionMessage extends Message {
  type: 'CAPTURE_REGION';
  data: {
    region: Region;
    tabId: number;
  };
}

export interface OCRRequestMessage extends Message {
  type: 'OCR_REQUEST';
  data: {
    imageData: string;
  };
}

export interface LLMRequestMessage extends Message {
  type: 'LLM_REQUEST';
  data: {
    text: string;
  };
}

export interface ShowResultsMessage extends Message {
  type: 'SHOW_RESULTS';
  data: {
    summary: string;
    region: Region;
  };
}

// Settings types
export interface ExtensionSettings {
  ocrApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  geminiApiKey?: string;
  ocrService: 'ocrspace' | 'tesseract';
  llmService: 'openai' | 'anthropic' | 'gemini';
  theme: 'light' | 'dark' | 'system';
}

// API response types
export interface OCRSpaceResponse {
  ParsedResults?: Array<{
    ParsedText: string;
    TextOverlay: {
      Lines: Array<{
        Words: Array<{
          WordText: string;
          Confidence: number;
        }>;
      }>;
    };
  }>;
  ErrorMessage?: string;
  IsErroredOnProcessing?: boolean;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export interface AnthropicResponse {
  content: Array<{
    text: string;
  }>;
  error?: {
    message: string;
  };
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}
