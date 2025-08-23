import { ExtensionSettings } from '../shared/types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../shared/constants';

export class StorageManager {
  /**
   * Save settings to Chrome storage
   */
  public static async saveSettings(settings: Partial<ExtensionSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      
      console.log('StorageManager: Saving settings with API keys:', {
        ocrService: updatedSettings.ocrService,
        llmService: updatedSettings.llmService,
        hasOcrApiKey: !!updatedSettings.ocrApiKey,
        hasGoogleVisionApiKey: !!updatedSettings.googleVisionApiKey,
        hasOpenaiApiKey: !!updatedSettings.openaiApiKey,
        hasAnthropicApiKey: !!updatedSettings.anthropicApiKey,
        hasGeminiApiKey: !!updatedSettings.geminiApiKey
      });
      
      // Save settings object
      await chrome.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: updatedSettings
      });
      
      // Also save individual API keys for backward compatibility
      const apiKeysToSave: { [key: string]: string } = {};
      
      if (updatedSettings.googleVisionApiKey) {
        apiKeysToSave[STORAGE_KEYS.GOOGLE_VISION_API_KEY] = updatedSettings.googleVisionApiKey;
      }
      if (updatedSettings.ocrApiKey) {
        apiKeysToSave[STORAGE_KEYS.OCR_API_KEY] = updatedSettings.ocrApiKey;
      }
      if (updatedSettings.openaiApiKey) {
        apiKeysToSave[STORAGE_KEYS.OPENAI_API_KEY] = updatedSettings.openaiApiKey;
      }
      if (updatedSettings.anthropicApiKey) {
        apiKeysToSave[STORAGE_KEYS.ANTHROPIC_API_KEY] = updatedSettings.anthropicApiKey;
      }
      if (updatedSettings.geminiApiKey) {
        apiKeysToSave[STORAGE_KEYS.GEMINI_API_KEY] = updatedSettings.geminiApiKey;
      }
      
      if (Object.keys(apiKeysToSave).length > 0) {
        await chrome.storage.sync.set(apiKeysToSave);
        console.log('StorageManager: Individual API keys saved:', Object.keys(apiKeysToSave));
      }
      
      // Verify storage was successful
      const verification = await this.getAllApiKeys();
      console.log('StorageManager: Verification - API keys after save:', {
        ocrApiKey: verification.ocrApiKey ? `${verification.ocrApiKey.substring(0, 8)}...` : 'not found',
        googleVisionApiKey: verification.googleVisionApiKey ? `${verification.googleVisionApiKey.substring(0, 8)}...` : 'not found',
        openaiApiKey: verification.openaiApiKey ? `${verification.openaiApiKey.substring(0, 8)}...` : 'not found',
        anthropicApiKey: verification.anthropicApiKey ? `${verification.anthropicApiKey.substring(0, 8)}...` : 'not found',
        geminiApiKey: verification.geminiApiKey ? `${verification.geminiApiKey.substring(0, 8)}...` : 'not found'
      });
      
      console.log('StorageManager: Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * Get settings from Chrome storage
   */
  public static async getSettings(): Promise<ExtensionSettings> {
    try {
      const result = await chrome.storage.sync.get([STORAGE_KEYS.SETTINGS]);
      const savedSettings = result[STORAGE_KEYS.SETTINGS] as Partial<ExtensionSettings> | undefined;
      
      const finalSettings = {
        ...DEFAULT_SETTINGS,
        ...savedSettings
      };
      
      console.log('StorageManager: Retrieved settings:', finalSettings);
      return finalSettings;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save individual API key
   */
  public static async saveApiKey(key: string, value: string): Promise<void> {
    try {
      await chrome.storage.sync.set({
        [key]: value
      });
    } catch (error) {
      console.error('Failed to save API key:', error);
      throw new Error('Failed to save API key');
    }
  }

  /**
   * Get individual API key
   */
  public static async getApiKey(key: string): Promise<string | null> {
    try {
      const result = await chrome.storage.sync.get([key]);
      return result[key] || null;
    } catch (error) {
      console.error('Failed to get API key:', error);
      return null;
    }
  }

  /**
   * Clear all settings
   */
  public static async clearSettings(): Promise<void> {
    try {
      await chrome.storage.sync.clear();
    } catch (error) {
      console.error('Failed to clear settings:', error);
      throw new Error('Failed to clear settings');
    }
  }

  /**
   * Check if API keys are configured
   */
  public static async hasValidApiKeys(): Promise<{ ocr: boolean; llm: boolean }> {
    try {
      const settings = await this.getSettings();
      
      const ocrValid = settings.ocrService === 'tesseract' || 
                      (settings.ocrService === 'ocrspace' && !!settings.ocrApiKey) ||
                      (settings.ocrService === 'googlevision' && !!settings.googleVisionApiKey);
      
      const llmValid = (settings.llmService === 'openai' && !!settings.openaiApiKey) ||
                      (settings.llmService === 'anthropic' && !!settings.anthropicApiKey) ||
                      (settings.llmService === 'gemini' && !!settings.geminiApiKey);
      
      return { ocr: ocrValid, llm: llmValid };
    } catch (error) {
      console.error('Failed to check API keys:', error);
      return { ocr: false, llm: false };
    }
  }

  /**
   * Get all API keys
   */
  public static async getAllApiKeys(): Promise<{
    ocrApiKey?: string;
    googleVisionApiKey?: string;
    openaiApiKey?: string;
    anthropicApiKey?: string;
    geminiApiKey?: string;
  }> {
    try {
      // First try to get from individual API key storage
      const result = await chrome.storage.sync.get([
        STORAGE_KEYS.OCR_API_KEY,
        STORAGE_KEYS.GOOGLE_VISION_API_KEY,
        STORAGE_KEYS.OPENAI_API_KEY,
        STORAGE_KEYS.ANTHROPIC_API_KEY,
        STORAGE_KEYS.GEMINI_API_KEY
      ]);
      
      // Also get from settings object
      const settings = await this.getSettings();
      
      return {
        ocrApiKey: result[STORAGE_KEYS.OCR_API_KEY] || settings.ocrApiKey || undefined,
        googleVisionApiKey: result[STORAGE_KEYS.GOOGLE_VISION_API_KEY] || settings.googleVisionApiKey || undefined,
        openaiApiKey: result[STORAGE_KEYS.OPENAI_API_KEY] || settings.openaiApiKey || undefined,
        anthropicApiKey: result[STORAGE_KEYS.ANTHROPIC_API_KEY] || settings.anthropicApiKey || undefined,
        geminiApiKey: result[STORAGE_KEYS.GEMINI_API_KEY] || settings.geminiApiKey || undefined
      };
    } catch (error) {
      console.error('Failed to get API keys:', error);
      return {};
    }
  }

  /**
   * Listen for storage changes
   */
  public static onSettingsChanged(callback: (changes: chrome.storage.StorageChange) => void): void {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes[STORAGE_KEYS.SETTINGS]) {
        const settingsChange = changes[STORAGE_KEYS.SETTINGS];
        if (settingsChange) {
          callback(settingsChange);
        }
      }
    });
  }
}
