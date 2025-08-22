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
      
      await chrome.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: updatedSettings
      });
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
      
      return {
        ...DEFAULT_SETTINGS,
        ...savedSettings
      };
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
                      (settings.ocrService === 'ocrspace' && !!settings.ocrApiKey);
      
      const llmValid = (settings.llmService === 'openai' && !!settings.openaiApiKey) ||
                      (settings.llmService === 'anthropic' && !!settings.anthropicApiKey);
      
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
    openaiApiKey?: string;
    anthropicApiKey?: string;
  }> {
    try {
      const result = await chrome.storage.sync.get([
        STORAGE_KEYS.OCR_API_KEY,
        STORAGE_KEYS.OPENAI_API_KEY,
        STORAGE_KEYS.ANTHROPIC_API_KEY
      ]);
      
      return {
        ocrApiKey: result[STORAGE_KEYS.OCR_API_KEY] || undefined,
        openaiApiKey: result[STORAGE_KEYS.OPENAI_API_KEY] || undefined,
        anthropicApiKey: result[STORAGE_KEYS.ANTHROPIC_API_KEY] || undefined
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
        callback(changes[STORAGE_KEYS.SETTINGS]);
      }
    });
  }
}
