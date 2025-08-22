import { StorageManager } from '../background/storage';
import { ExtensionSettings } from '../shared/types';

describe('StorageManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveSettings', () => {
    it('should save settings to Chrome storage', async () => {
      const mockSet = chrome.storage.sync.set as jest.Mock;
      mockSet.mockResolvedValue(undefined);

      const settings: Partial<ExtensionSettings> = {
        ocrService: 'ocrspace',
        llmService: 'openai',
        theme: 'light'
      };

      await StorageManager.saveSettings(settings);

      expect(mockSet).toHaveBeenCalledWith({
        extensionSettings: expect.objectContaining(settings)
      });
    });

    it('should handle storage errors', async () => {
      const mockSet = chrome.storage.sync.set as jest.Mock;
      mockSet.mockRejectedValue(new Error('Storage error'));

      await expect(StorageManager.saveSettings({})).rejects.toThrow('Failed to save settings');
    });
  });

  describe('getSettings', () => {
    it('should return default settings when no settings are stored', async () => {
      const mockGet = chrome.storage.sync.get as jest.Mock;
      mockGet.mockResolvedValue({});

      const settings = await StorageManager.getSettings();

      expect(settings).toEqual({
        ocrService: 'ocrspace',
        llmService: 'openai',
        theme: 'system'
      });
    });

    it('should return merged settings when partial settings are stored', async () => {
      const mockGet = chrome.storage.sync.get as jest.Mock;
      mockGet.mockResolvedValue({
        extensionSettings: {
          ocrService: 'tesseract',
          theme: 'dark'
        }
      });

      const settings = await StorageManager.getSettings();

      expect(settings).toEqual({
        ocrService: 'tesseract',
        llmService: 'openai', // default
        theme: 'dark'
      });
    });

    it('should handle storage errors gracefully', async () => {
      const mockGet = chrome.storage.sync.get as jest.Mock;
      mockGet.mockRejectedValue(new Error('Storage error'));

      const settings = await StorageManager.getSettings();

      expect(settings).toEqual({
        ocrService: 'ocrspace',
        llmService: 'openai',
        theme: 'system'
      });
    });
  });

  describe('hasValidApiKeys', () => {
    it('should return true for valid OCR and LLM keys', async () => {
      const mockGet = chrome.storage.sync.get as jest.Mock;
      mockGet.mockResolvedValue({
        extensionSettings: {
          ocrService: 'ocrspace',
          llmService: 'openai',
          ocrApiKey: 'test-ocr-key',
          openaiApiKey: 'test-openai-key'
        }
      });

      const result = await StorageManager.hasValidApiKeys();

      expect(result).toEqual({ ocr: true, llm: true });
    });

    it('should return true for Tesseract OCR (no API key needed)', async () => {
      const mockGet = chrome.storage.sync.get as jest.Mock;
      mockGet.mockResolvedValue({
        extensionSettings: {
          ocrService: 'tesseract',
          llmService: 'openai',
          openaiApiKey: 'test-openai-key'
        }
      });

      const result = await StorageManager.hasValidApiKeys();

      expect(result).toEqual({ ocr: true, llm: true });
    });

    it('should return false for missing API keys', async () => {
      const mockGet = chrome.storage.sync.get as jest.Mock;
      mockGet.mockResolvedValue({
        extensionSettings: {
          ocrService: 'ocrspace',
          llmService: 'openai'
        }
      });

      const result = await StorageManager.hasValidApiKeys();

      expect(result).toEqual({ ocr: false, llm: false });
    });
  });
});
