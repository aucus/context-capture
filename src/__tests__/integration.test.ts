import { OCRService } from '../background/ocr';
import { LLMService } from '../background/llm';
import { StorageManager } from '../background/storage';

// Mock fetch
global.fetch = jest.fn();

describe('ContextCapture Integration Tests', () => {
  let ocrService: OCRService;
  let llmService: LLMService;

  beforeEach(() => {
    ocrService = new OCRService();
    llmService = new LLMService();
    jest.clearAllMocks();
  });

  describe('Complete Workflow Tests', () => {
    it('should complete full workflow: OCR → LLM → Summary', async () => {
      // Mock OCR response
      const mockOCRResponse = {
        ParsedResults: [
          {
            ParsedText: 'This is a sample text that needs to be summarized. It contains multiple sentences with important information that should be captured in a concise summary.',
            TextOverlay: {
              Lines: [
                {
                  Words: [
                    { WordText: 'This', Confidence: 95 },
                    { WordText: 'is', Confidence: 98 },
                    { WordText: 'a', Confidence: 99 },
                    { WordText: 'sample', Confidence: 92 },
                    { WordText: 'text', Confidence: 94 }
                  ]
                }
              ]
            }
          }
        ],
        IsErroredOnProcessing: false
      };

      // Mock LLM response
      const mockLLMResponse = {
        choices: [
          {
            message: {
              content: 'This is a sample text that needs summarization.\nIt contains multiple sentences with important information.\nThe summary captures key points concisely.'
            }
          }
        ]
      };

      // Setup mocks
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockOCRResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLLMResponse)
        });

      // Configure services
      ocrService.setApiKey('test-ocr-key');
      ocrService.setService('ocrspace');
      llmService.setOpenAIKey('test-openai-key');
      llmService.setService('openai');

      // Test OCR
      const ocrResult = await ocrService.extractText('data:image/png;base64,test-image-data');
      expect(ocrResult.success).toBe(true);
      expect(ocrResult.text).toContain('This is a sample text');

      // Test LLM
      const llmResult = await llmService.generateSummary(ocrResult.text);
      expect(llmResult.success).toBe(true);
      expect(llmResult.summary).toContain('This is a sample text');
      expect(llmResult.summary.split('\n').length).toBeLessThanOrEqual(3);
    });

    it('should handle OCR failure gracefully', async () => {
      // Mock OCR failure
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid API key' })
      });

      ocrService.setApiKey('invalid-key');
      ocrService.setService('ocrspace');

      const result = await ocrService.extractText('data:image/png;base64,test');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Text recognition failed, please try again');
    });

    it('should handle LLM failure gracefully', async () => {
      // Mock LLM failure
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
      });

      llmService.setOpenAIKey('invalid-key');
      llmService.setService('openai');

      const result = await llmService.generateSummary('Test text');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Summary generation failed, check network and API key');
    });
  });

  describe('Different Text Types Tests', () => {
    it('should handle short text', async () => {
      const shortText = 'Short text for testing.';
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Short text for testing.\nContains minimal content.\nSuitable for quick summary.'
            }
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      llmService.setOpenAIKey('test-key');
      llmService.setService('openai');

      const result = await llmService.generateSummary(shortText);
      expect(result.success).toBe(true);
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('should handle long text with truncation', async () => {
      const longText = 'A'.repeat(10000) + 'This is the end of a very long text.';
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Long text has been truncated.\nContains repetitive content.\nEnds with meaningful information.'
            }
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      llmService.setOpenAIKey('test-key');
      llmService.setService('openai');

      const result = await llmService.generateSummary(longText);
      expect(result.success).toBe(true);
      expect(result.summary.split('\n').length).toBeLessThanOrEqual(3);
    });

    it('should handle text with special characters', async () => {
      const specialText = 'Text with special chars: @#$%^&*()_+-=[]{}|;:,.<>?';
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Text contains special characters.\nIncludes symbols and punctuation.\nProperly processed by the system.'
            }
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      llmService.setOpenAIKey('test-key');
      llmService.setService('openai');

      const result = await llmService.generateSummary(specialText);
      expect(result.success).toBe(true);
      expect(result.summary).toContain('special characters');
    });
  });

  describe('API Service Switching Tests', () => {
    it('should switch between different LLM services', async () => {
      // Test OpenAI
      const openaiResponse = {
        choices: [{ message: { content: 'OpenAI summary' } }]
      };

      // Test Anthropic
      const anthropicResponse = {
        content: [{ text: 'Anthropic summary' }]
      };

      // Test Gemini
      const geminiResponse = {
        candidates: [{
          content: {
            parts: [{ text: 'Gemini summary' }]
          }
        }]
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(openaiResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(anthropicResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(geminiResponse)
        });

      // Test OpenAI
      llmService.setOpenAIKey('test-openai');
      llmService.setService('openai');
      let result = await llmService.generateSummary('Test text');
      expect(result.summary).toBe('OpenAI summary');

      // Test Anthropic
      llmService.setAnthropicKey('test-anthropic');
      llmService.setService('anthropic');
      result = await llmService.generateSummary('Test text');
      expect(result.summary).toBe('Anthropic summary');

      // Test Gemini
      llmService.setGeminiKey('test-gemini');
      llmService.setService('gemini');
      result = await llmService.generateSummary('Test text');
      expect(result.summary).toBe('Gemini summary');
    });

    it('should switch between OCR services', async () => {
      // Test Google Vision
      const googleVisionResponse = {
        responses: [
          {
            fullTextAnnotation: {
              text: 'Google Vision result',
              pages: [
                {
                  blocks: [
                    {
                      paragraphs: [
                        {
                          words: [{ confidence: 0.95, symbols: [{ confidence: 0.95 }] }]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(googleVisionResponse)
      });

      ocrService.setApiKey('test-google-vision');
      ocrService.setService('googlevision');
      let result = await ocrService.extractText('data:image/png;base64,test');
      expect(result.text).toBe('Google Vision result');

      // Test OCR.Space
      const ocrSpaceResponse = {
        ParsedResults: [{ ParsedText: 'OCR.Space result' }],
        IsErroredOnProcessing: false
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(ocrSpaceResponse)
      });

      ocrService.setApiKey('test-ocr');
      ocrService.setService('ocrspace');
      result = await ocrService.extractText('data:image/png;base64,test');
      expect(result.text).toBe('OCR.Space result');

      // Test Tesseract.js (local)
      ocrService.setService('tesseract');
      result = await ocrService.extractText('data:image/png;base64,test');
      // Tesseract.js will fail in test environment due to canvas limitations
      // but we can verify the service switching works
      expect(result.success).toBe(false);
    });
  });

  describe('Settings Management Tests', () => {
    it('should save and load settings correctly', async () => {
      const testSettings = {
        ocrService: 'ocrspace' as const,
        llmService: 'openai' as const,
        theme: 'dark' as const,
        ocrApiKey: 'test-ocr-key',
        openaiApiKey: 'test-openai-key'
      };

      // Mock chrome.storage.sync
      const mockStorage = {
        set: jest.fn().mockResolvedValue(undefined),
        get: jest.fn().mockResolvedValue({ extensionSettings: testSettings })
      };

      (global as any).chrome = {
        storage: {
          sync: mockStorage
        }
      };

      // Test save
      await StorageManager.saveSettings(testSettings);
      expect(mockStorage.set).toHaveBeenCalled();

      // Test load
      const loadedSettings = await StorageManager.getSettings();
      expect(loadedSettings.ocrService).toBe('ocrspace');
      expect(loadedSettings.llmService).toBe('openai');
      expect(loadedSettings.theme).toBe('dark');
    });

    it('should validate API keys correctly', async () => {
      const mockStorage = {
        get: jest.fn().mockResolvedValue({
          extensionSettings: {
            ocrService: 'ocrspace',
            llmService: 'openai',
            ocrApiKey: 'valid-ocr-key',
            openaiApiKey: 'valid-openai-key'
          }
        })
      };

      (global as any).chrome = {
        storage: {
          sync: mockStorage
        }
      };

      const validation = await StorageManager.hasValidApiKeys();
      expect(validation.ocr).toBe(true);
      expect(validation.llm).toBe(true);
    });
  });

  describe('Error Recovery Tests', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network failure
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      llmService.setOpenAIKey('test-key');
      llmService.setService('openai');

      const result = await llmService.generateSummary('Test text');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Summary generation failed');
    });

    it('should handle rate limiting', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } })
      });

      llmService.setOpenAIKey('test-key');
      llmService.setService('openai');

      const result = await llmService.generateSummary('Test text');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Summary generation failed');
    });
  });
});
