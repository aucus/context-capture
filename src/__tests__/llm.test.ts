import { LLMService } from '../background/llm';

// Mock fetch
global.fetch = jest.fn();

describe('LLMService', () => {
  let llmService: LLMService;

  beforeEach(() => {
    llmService = new LLMService();
    jest.clearAllMocks();
  });

  describe('generateSummary', () => {
    it('should generate summary using OpenAI API', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is a test summary in three lines.\nSecond line of the summary.\nThird line completes the summary.'
            }
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      llmService.setOpenAIKey('test-openai-key');
      llmService.setService('openai');

      const result = await llmService.generateSummary('This is a test text that needs to be summarized.');

      expect(result.success).toBe(true);
      expect(result.summary).toContain('This is a test summary');
    });

    it('should generate summary using Anthropic API', async () => {
      const mockResponse = {
        content: [
          {
            text: 'This is a test summary in three lines.\nSecond line of the summary.\nThird line completes the summary.'
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      llmService.setAnthropicKey('test-anthropic-key');
      llmService.setService('anthropic');

      const result = await llmService.generateSummary('This is a test text that needs to be summarized.');

      expect(result.success).toBe(true);
      expect(result.summary).toContain('This is a test summary');
    });

    it('should handle API errors', async () => {
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

    it('should handle missing API key', async () => {
      llmService.setService('openai');

      const result = await llmService.generateSummary('Test text');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Summary generation failed, check network and API key');
    });
  });

  describe('testLLM', () => {
    it('should test LLM service successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is a test summary with exactly three lines.\nSecond line of the summary.\nThird line completes the summary.'
            }
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      llmService.setOpenAIKey('test-openai-key');
      llmService.setService('openai');

      const result = await llmService.testLLM();

      expect(result).toBe(true);
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'A'.repeat(10000);
      const result = llmService['truncateText'](longText, 1000);
      
      expect(result.length).toBeLessThanOrEqual(4000); // 1000 tokens * 4 chars
      expect(result).toContain('...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      const result = llmService['truncateText'](shortText, 1000);
      
      expect(result).toBe(shortText);
    });
  });
});
