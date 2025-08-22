import { OCRService } from './ocr';
import { LLMService } from './llm';
import { StorageManager } from './storage';
import { CaptureRegionMessage, OCRRequestMessage, LLMRequestMessage, ShowResultsMessage } from '../shared/types';
import { MESSAGE_TYPES } from '../shared/constants';

class BackgroundService {
  private ocrService: OCRService;
  private llmService: LLMService;

  constructor() {
    this.ocrService = new OCRService();
    this.llmService = new LLMService();
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    try {
      const settings = await StorageManager.getSettings();
      const apiKeys = await StorageManager.getAllApiKeys();

      // Configure OCR service
      this.ocrService.setService(settings.ocrService);
      if (settings.ocrService === 'ocrspace' && apiKeys.ocrApiKey) {
        this.ocrService.setApiKey(apiKeys.ocrApiKey);
      }

      // Configure LLM service
      this.llmService.setService(settings.llmService);
      if (settings.llmService === 'openai' && apiKeys.openaiApiKey) {
        this.llmService.setOpenAIKey(apiKeys.openaiApiKey);
      } else if (settings.llmService === 'anthropic' && apiKeys.anthropicApiKey) {
        this.llmService.setAnthropicKey(apiKeys.anthropicApiKey);
      } else if (settings.llmService === 'gemini' && apiKeys.geminiApiKey) {
        this.llmService.setGeminiKey(apiKeys.geminiApiKey);
      }

      console.log('Background service initialized');
    } catch (error) {
      console.error('Failed to initialize background service:', error);
    }
  }

  public async handleMessage(
    message: any,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      switch (message.type) {
        case MESSAGE_TYPES.CAPTURE_REGION:
          await this.handleCaptureRegion(message as CaptureRegionMessage, _sender, sendResponse);
          break;

        case MESSAGE_TYPES.OCR_REQUEST:
          await this.handleOCRRequest(message as OCRRequestMessage, _sender, sendResponse);
          break;

        case MESSAGE_TYPES.LLM_REQUEST:
          await this.handleLLMRequest(message as LLMRequestMessage, _sender, sendResponse);
          break;

        case MESSAGE_TYPES.GET_SETTINGS:
          await this.handleGetSettings(sendResponse);
          break;

        case MESSAGE_TYPES.SAVE_SETTINGS:
          await this.handleSaveSettings(message.data, sendResponse);
          break;

        case MESSAGE_TYPES.TEST_API:
          await this.handleTestAPI(message.data, sendResponse);
          break;

        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Message handling error:', error);
      sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleCaptureRegion(
    message: CaptureRegionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      const { region, tabId } = message.data;

      // Capture the visible tab
      const dataUrl = await chrome.tabs.captureVisibleTab(null as any, {
        format: 'png',
        quality: 100
      });

      // Send the captured image to content script for cropping
      const response = await chrome.tabs.sendMessage(tabId, {
        type: 'CROP_IMAGE',
        data: { imageData: dataUrl, region }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const croppedImageData = response.croppedImage;

      // Extract text using OCR
      const ocrResult = await this.ocrService.extractText(croppedImageData);

      if (!ocrResult.success || !ocrResult.text.trim()) {
        throw new Error(ocrResult.error || 'No text found in image');
      }

      // Generate summary using LLM
      const summaryResult = await this.llmService.generateSummary(ocrResult.text);

      if (!summaryResult.success) {
        throw new Error(summaryResult.error || 'Failed to generate summary');
      }

      // Send results back to content script
      await chrome.tabs.sendMessage(tabId, {
        type: MESSAGE_TYPES.SHOW_RESULTS,
        data: {
          summary: summaryResult.summary,
          region
        }
      } as ShowResultsMessage);

      sendResponse({ success: true });

    } catch (error) {
      console.error('Capture region failed:', error);
      sendResponse({ error: error instanceof Error ? error.message : 'Capture failed' });
    }
  }

  private async handleOCRRequest(
    message: OCRRequestMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      const result = await this.ocrService.extractText(message.data.imageData);
      sendResponse(result);
    } catch (error) {
      console.error('OCR request failed:', error);
      sendResponse({ error: error instanceof Error ? error.message : 'OCR failed' });
    }
  }

  private async handleLLMRequest(
    message: LLMRequestMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      const result = await this.llmService.generateSummary(message.data.text);
      sendResponse(result);
    } catch (error) {
      console.error('LLM request failed:', error);
      sendResponse({ error: error instanceof Error ? error.message : 'LLM failed' });
    }
  }

  private async handleGetSettings(sendResponse: (response?: any) => void): Promise<void> {
    try {
      const settings = await StorageManager.getSettings();
      sendResponse({ settings });
    } catch (error) {
      console.error('Get settings failed:', error);
      sendResponse({ error: error instanceof Error ? error.message : 'Failed to get settings' });
    }
  }

  private async handleSaveSettings(
    settings: any,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      await StorageManager.saveSettings(settings);
      
      // Reinitialize services with new settings
      await this.initializeServices();
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('Save settings failed:', error);
      sendResponse({ error: error instanceof Error ? error.message : 'Failed to save settings' });
    }
  }

  private async handleTestAPI(
    data: { service: 'ocr' | 'llm' },
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      let success = false;
      
      if (data.service === 'ocr') {
        success = await this.ocrService.testOCR();
      } else if (data.service === 'llm') {
        success = await this.llmService.testLLM();
      }

      sendResponse({ success });
    } catch (error) {
      console.error('API test failed:', error);
      sendResponse({ success: false, error: error instanceof Error ? error.message : 'Test failed' });
    }
  }
}

// Initialize background service
const backgroundService = new BackgroundService();

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  backgroundService.handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async response
});

// Listen for extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    await chrome.tabs.sendMessage(tab.id, { type: 'START_CAPTURE' });
  }
});

console.log('ContextCapture background service worker started');
