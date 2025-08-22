import { EXTENSION_CONSTANTS } from '../shared/constants';

// Mock utility functions that would be in a utils file
class Utils {
  /**
   * Validate region selection
   */
  static validateRegion(x: number, y: number, width: number, height: number): boolean {
    return width >= EXTENSION_CONSTANTS.MIN_SELECTION_SIZE && 
           height >= EXTENSION_CONSTANTS.MIN_SELECTION_SIZE &&
           x >= 0 && y >= 0 && width > 0 && height > 0;
  }

  /**
   * Truncate text to fit within token limits
   */
  static truncateText(text: string, maxTokens: number): string {
    // Rough estimation: 1 token ≈ 4 characters
    const maxChars = maxTokens * 4;
    
    if (text.length <= maxChars) {
      return text;
    }

    // Truncate and add ellipsis
    const truncatedLength = Math.max(1, maxChars - 3);
    return text.substring(0, truncatedLength) + '...';
  }

  /**
   * Calculate average confidence from OCR results
   */
  static calculateAverageConfidence(words: Array<{ Confidence: number }>): number {
    if (!words || words.length === 0) {
      return 0;
    }

    const totalConfidence = words.reduce((sum, word) => sum + word.Confidence, 0);
    return Math.round(totalConfidence / words.length);
  }

  /**
   * Validate API key format (basic validation)
   */
  static validateApiKey(apiKey: string, service: 'openai' | 'anthropic' | 'gemini' | 'ocrspace'): boolean {
    if (!apiKey || apiKey.trim().length === 0) {
      return false;
    }

    switch (service) {
      case 'openai':
        return apiKey.startsWith('sk-') && apiKey.length > 20;
      case 'anthropic':
        return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
      case 'gemini':
        return apiKey.length > 20; // Gemini keys don't have specific prefix
      case 'ocrspace':
        return apiKey.length > 10; // OCR.Space keys are shorter
      default:
        return false;
    }
  }

  /**
   * Format error message for user display
   */
  static formatErrorMessage(error: any, service: string): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.message) {
      return `${service} error: ${error.message}`;
    }

    return `${service} error: Unknown error occurred`;
  }

  /**
   * Check if image data is valid base64
   */
  static isValidBase64Image(dataUrl: string): boolean {
    if (!dataUrl || typeof dataUrl !== 'string') {
      return false;
    }

    // Check if it's a valid data URL
    const dataUrlRegex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
    if (!dataUrlRegex.test(dataUrl)) {
      return false;
    }

    // Extract base64 part
    const base64 = dataUrl.split(',')[1];
    if (!base64) {
      return false;
    }

    // Check if base64 is valid
    try {
      atob(base64);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate unique ID for tracking requests
   */
  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Debounce function for performance optimization
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
}

describe('Utility Functions', () => {
  describe('validateRegion', () => {
    it('should validate correct region dimensions', () => {
      expect(Utils.validateRegion(100, 100, 100, 100)).toBe(true);
      expect(Utils.validateRegion(0, 0, 50, 50)).toBe(true);
      expect(Utils.validateRegion(10, 20, 200, 150)).toBe(true);
    });

    it('should reject invalid region dimensions', () => {
      expect(Utils.validateRegion(100, 100, 30, 100)).toBe(false); // width too small
      expect(Utils.validateRegion(100, 100, 100, 30)).toBe(false); // height too small
      expect(Utils.validateRegion(-10, 100, 100, 100)).toBe(false); // negative x
      expect(Utils.validateRegion(100, -10, 100, 100)).toBe(false); // negative y
      expect(Utils.validateRegion(100, 100, 0, 100)).toBe(false); // zero width
      expect(Utils.validateRegion(100, 100, 100, 0)).toBe(false); // zero height
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      const shortText = 'Short text';
      const result = Utils.truncateText(shortText, 1000);
      expect(result).toBe(shortText);
    });

    it('should truncate long text', () => {
      const longText = 'A'.repeat(10000);
      const result = Utils.truncateText(longText, 1000);
      
      expect(result.length).toBeLessThanOrEqual(4000); // 1000 tokens * 4 chars
      expect(result).toContain('...');
      expect(result.length).toBe(4000); // 4000 chars including ellipsis
    });

    it('should handle edge cases', () => {
      expect(Utils.truncateText('', 1000)).toBe('');
      // For 1 token (4 chars), text is short enough to not truncate
      expect(Utils.truncateText('Test', 1)).toBe('Test');
      // For 2 tokens (8 chars), text is short enough to not truncate
      expect(Utils.truncateText('Short', 2)).toBe('Short');
    });
  });

  describe('calculateAverageConfidence', () => {
    it('should calculate average confidence correctly', () => {
      const words = [
        { Confidence: 90 },
        { Confidence: 85 },
        { Confidence: 95 }
      ];
      
      const result = Utils.calculateAverageConfidence(words);
      expect(result).toBe(90); // (90 + 85 + 95) / 3 = 90
    });

    it('should handle empty array', () => {
      expect(Utils.calculateAverageConfidence([])).toBe(0);
    });

    it('should handle single word', () => {
      const words = [{ Confidence: 87 }];
      expect(Utils.calculateAverageConfidence(words)).toBe(87);
    });

    it('should round to nearest integer', () => {
      const words = [
        { Confidence: 90 },
        { Confidence: 85 }
      ];
      
      const result = Utils.calculateAverageConfidence(words);
      expect(result).toBe(88); // (90 + 85) / 2 = 87.5 → 88
    });
  });

  describe('validateApiKey', () => {
    it('should validate OpenAI API key', () => {
      expect(Utils.validateApiKey('sk-1234567890abcdef1234567890abcdef', 'openai')).toBe(true);
      expect(Utils.validateApiKey('invalid-key', 'openai')).toBe(false);
      expect(Utils.validateApiKey('', 'openai')).toBe(false);
    });

    it('should validate Anthropic API key', () => {
      expect(Utils.validateApiKey('sk-ant-1234567890abcdef1234567890abcdef', 'anthropic')).toBe(true);
      expect(Utils.validateApiKey('invalid-key', 'anthropic')).toBe(false);
      expect(Utils.validateApiKey('', 'anthropic')).toBe(false);
    });

    it('should validate Gemini API key', () => {
      expect(Utils.validateApiKey('AIzaSyC1234567890abcdef1234567890abcdef', 'gemini')).toBe(true);
      expect(Utils.validateApiKey('short', 'gemini')).toBe(false);
      expect(Utils.validateApiKey('', 'gemini')).toBe(false);
    });

    it('should validate OCR.Space API key', () => {
      expect(Utils.validateApiKey('K1234567890', 'ocrspace')).toBe(true);
      expect(Utils.validateApiKey('short', 'ocrspace')).toBe(false);
      expect(Utils.validateApiKey('', 'ocrspace')).toBe(false);
    });
  });

  describe('formatErrorMessage', () => {
    it('should format string errors', () => {
      const result = Utils.formatErrorMessage('Network error', 'OCR');
      expect(result).toBe('Network error');
    });

    it('should format Error objects', () => {
      const error = new Error('API key invalid');
      const result = Utils.formatErrorMessage(error, 'LLM');
      expect(result).toBe('LLM error: API key invalid');
    });

    it('should format objects with message property', () => {
      const error = { message: 'Rate limit exceeded' };
      const result = Utils.formatErrorMessage(error, 'API');
      expect(result).toBe('API error: Rate limit exceeded');
    });

    it('should handle unknown errors', () => {
      const error = { someOtherProperty: 'value' };
      const result = Utils.formatErrorMessage(error, 'Service');
      expect(result).toBe('Service error: Unknown error occurred');
    });
  });

  describe('isValidBase64Image', () => {
    it('should validate correct base64 image data', () => {
      const validDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      expect(Utils.isValidBase64Image(validDataUrl)).toBe(true);
    });

    it('should reject invalid data URLs', () => {
      expect(Utils.isValidBase64Image('not-a-data-url')).toBe(false);
      expect(Utils.isValidBase64Image('data:text/plain;base64,test')).toBe(false);
      expect(Utils.isValidBase64Image('data:image/png;base64,')).toBe(false);
      expect(Utils.isValidBase64Image('')).toBe(false);
      expect(Utils.isValidBase64Image(null as any)).toBe(false);
    });

    it('should reject invalid base64 data', () => {
      const invalidDataUrl = 'data:image/png;base64,invalid-base64-data!@#';
      expect(Utils.isValidBase64Image(invalidDataUrl)).toBe(false);
    });
  });

  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = Utils.generateRequestId();
      const id2 = Utils.generateRequestId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^req_\d+_[a-z0-9]{9}$/);
      expect(id2).toMatch(/^req_\d+_[a-z0-9]{9}$/);
    });

    it('should include timestamp and random string', () => {
      const id = Utils.generateRequestId();
      const parts = id.split('_');
      
      expect(parts.length).toBe(3);
      expect(parts[0]).toBe('req');
      expect(parseInt(parts[1] || '0')).toBeGreaterThan(0);
      expect(parts[2]?.length).toBe(9);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0;
      const debouncedFn = Utils.debounce(() => {
        callCount++;
      }, 100);

      // Call multiple times quickly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should only execute once after delay
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });

    it('should pass arguments correctly', (done) => {
      let receivedArgs: any[] = [];
      const debouncedFn = Utils.debounce((...args: any[]) => {
        receivedArgs = args;
      }, 100);

      debouncedFn('test', 123, { key: 'value' });

      setTimeout(() => {
        expect(receivedArgs).toEqual(['test', 123, { key: 'value' }]);
        done();
      }, 150);
    });
  });
});
