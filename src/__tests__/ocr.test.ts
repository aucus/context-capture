import { OCRService } from '../background/ocr';

// Mock fetch
global.fetch = jest.fn();

describe('OCRService', () => {
  let ocrService: OCRService;

  beforeEach(() => {
    ocrService = new OCRService();
    jest.clearAllMocks();
  });

  describe('extractText', () => {
    it('should extract text using OCR.Space API', async () => {
      const mockResponse = {
        ParsedResults: [
          {
            ParsedText: 'Test OCR text',
            TextOverlay: {
              Lines: [
                {
                  Words: [
                    { WordText: 'Test', Confidence: 95 },
                    { WordText: 'OCR', Confidence: 90 },
                    { WordText: 'text', Confidence: 85 }
                  ]
                }
              ]
            }
          }
        ],
        IsErroredOnProcessing: false
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      ocrService.setApiKey('test-api-key');
      ocrService.setService('ocrspace');

      const result = await ocrService.extractText('data:image/png;base64,test');

      expect(result.success).toBe(true);
      expect(result.text).toBe('Test OCR text');
      expect(result.confidence).toBe(90); // Average confidence
    });

    it('should handle OCR API errors', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400
      });

      ocrService.setApiKey('test-api-key');
      ocrService.setService('ocrspace');

      const result = await ocrService.extractText('data:image/png;base64,test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Text recognition failed, please try again');
    });

    it('should handle missing API key', async () => {
      ocrService.setService('ocrspace');

      const result = await ocrService.extractText('data:image/png;base64,test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Text recognition failed, please try again');
    });
  });

  describe('testOCR', () => {
    it('should test OCR service successfully', async () => {
      // Mock canvas context for testOCR method
      const mockContext = {
        fillStyle: '',
        fillRect: jest.fn(),
        font: '',
        fillText: jest.fn()
      };
      
      const mockCanvas = {
        width: 200,
        height: 50,
        getContext: jest.fn().mockReturnValue(mockContext),
        toDataURL: jest.fn().mockReturnValue('data:image/png;base64,test')
      };
      
      // Mock document.createElement
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockImplementation((tagName) => {
        if (tagName === 'canvas') {
          return mockCanvas as any;
        }
        return originalCreateElement.call(document, tagName);
      });

      const mockResponse = {
        ParsedResults: [
          {
            ParsedText: 'Test OCR',
            TextOverlay: {
              Lines: [
                {
                  Words: [
                    { WordText: 'Test', Confidence: 95 },
                    { WordText: 'OCR', Confidence: 90 }
                  ]
                }
              ]
            }
          }
        ],
        IsErroredOnProcessing: false
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      ocrService.setApiKey('test-api-key');
      ocrService.setService('ocrspace');

      const result = await ocrService.testOCR();

      expect(result).toBe(true);
      
      // Restore original createElement
      document.createElement = originalCreateElement;
    });
  });
});
