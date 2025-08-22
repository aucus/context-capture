import { ExtensionSettings } from '../shared/types';
import { MESSAGE_TYPES } from '../shared/constants';

class OptionsPage {
  private form: HTMLFormElement;
  private status: HTMLDivElement;
  private ocrServiceSelect: HTMLSelectElement;
  private llmServiceSelect: HTMLSelectElement;
  private ocrApiKeyGroup: HTMLDivElement;
  private openaiApiKeyGroup: HTMLDivElement;
  private anthropicApiKeyGroup: HTMLDivElement;
  private geminiApiKeyGroup: HTMLDivElement;

  constructor() {
    this.form = document.getElementById('settingsForm') as HTMLFormElement;
    this.status = document.getElementById('status') as HTMLDivElement;
    this.ocrServiceSelect = document.getElementById('ocrService') as HTMLSelectElement;
    this.llmServiceSelect = document.getElementById('llmService') as HTMLSelectElement;
    this.ocrApiKeyGroup = document.getElementById('ocrApiKeyGroup') as HTMLDivElement;
    this.openaiApiKeyGroup = document.getElementById('openaiApiKeyGroup') as HTMLDivElement;
    this.anthropicApiKeyGroup = document.getElementById('anthropicApiKeyGroup') as HTMLDivElement;
    this.geminiApiKeyGroup = document.getElementById('geminiApiKeyGroup') as HTMLDivElement;

    this.initializeEventListeners();
    this.loadSettings();
  }

  private initializeEventListeners(): void {
    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSettings();
    });

    // Service selection changes
    this.ocrServiceSelect.addEventListener('change', () => {
      this.toggleApiKeyFields();
    });

    this.llmServiceSelect.addEventListener('change', () => {
      this.toggleApiKeyFields();
    });

    // Test buttons
    document.getElementById('testOcrBtn')?.addEventListener('click', () => {
      this.testOCRService();
    });

    document.getElementById('testLlmBtn')?.addEventListener('click', () => {
      this.testLLMService();
    });

    // Clear settings
    document.getElementById('clearBtn')?.addEventListener('click', () => {
      this.clearSettings();
    });
  }

  private async loadSettings(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.GET_SETTINGS
      });

      if (response.error) {
        this.showStatus('Failed to load settings: ' + response.error, 'error');
        return;
      }

      const settings: ExtensionSettings = response.settings;
      this.populateForm(settings);
      this.toggleApiKeyFields();
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.showStatus('Failed to load settings', 'error');
    }
  }

  private populateForm(settings: ExtensionSettings): void {
    // OCR settings
    this.ocrServiceSelect.value = settings.ocrService;
    (document.getElementById('ocrApiKey') as HTMLInputElement).value = settings.ocrApiKey || '';

    // LLM settings
    this.llmServiceSelect.value = settings.llmService;
    (document.getElementById('openaiApiKey') as HTMLInputElement).value = settings.openaiApiKey || '';
    (document.getElementById('anthropicApiKey') as HTMLInputElement).value = settings.anthropicApiKey || '';
    (document.getElementById('geminiApiKey') as HTMLInputElement).value = settings.geminiApiKey || '';

    // Theme
    (document.getElementById('theme') as HTMLSelectElement).value = settings.theme;
  }

  private toggleApiKeyFields(): void {
    const ocrService = this.ocrServiceSelect.value;
    const llmService = this.llmServiceSelect.value;

    // Show/hide OCR API key field
    if (ocrService === 'ocrspace') {
      this.ocrApiKeyGroup.style.display = 'block';
    } else {
      this.ocrApiKeyGroup.style.display = 'none';
    }

    // Show/hide LLM API key fields
    if (llmService === 'openai') {
      this.openaiApiKeyGroup.style.display = 'block';
      this.anthropicApiKeyGroup.style.display = 'none';
      this.geminiApiKeyGroup.style.display = 'none';
    } else if (llmService === 'anthropic') {
      this.openaiApiKeyGroup.style.display = 'none';
      this.anthropicApiKeyGroup.style.display = 'block';
      this.geminiApiKeyGroup.style.display = 'none';
    } else if (llmService === 'gemini') {
      this.openaiApiKeyGroup.style.display = 'none';
      this.anthropicApiKeyGroup.style.display = 'none';
      this.geminiApiKeyGroup.style.display = 'block';
    } else {
      this.openaiApiKeyGroup.style.display = 'none';
      this.anthropicApiKeyGroup.style.display = 'none';
      this.geminiApiKeyGroup.style.display = 'none';
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      const formData = new FormData(this.form);
      const settings: Partial<ExtensionSettings> = {
        ocrService: formData.get('ocrService') as 'ocrspace' | 'tesseract',
        llmService: formData.get('llmService') as 'openai' | 'anthropic' | 'gemini',
        theme: formData.get('theme') as 'light' | 'dark' | 'system'
      };

      // Add API keys based on selected services
      if (settings.ocrService === 'ocrspace') {
        settings.ocrApiKey = formData.get('ocrApiKey') as string;
      }

      if (settings.llmService === 'openai') {
        settings.openaiApiKey = formData.get('openaiApiKey') as string;
      } else if (settings.llmService === 'anthropic') {
        settings.anthropicApiKey = formData.get('anthropicApiKey') as string;
      } else if (settings.llmService === 'gemini') {
        settings.geminiApiKey = formData.get('geminiApiKey') as string;
      }

      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.SAVE_SETTINGS,
        data: settings
      });

      if (response.error) {
        this.showStatus('Failed to save settings: ' + response.error, 'error');
        return;
      }

      this.showStatus('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showStatus('Failed to save settings', 'error');
    }
  }

  private async testOCRService(): Promise<void> {
    const button = document.getElementById('testOcrBtn') as HTMLButtonElement;
    const originalText = button.textContent;

    try {
      button.textContent = 'Testing...';
      button.disabled = true;

      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.TEST_API,
        data: { service: 'ocr' }
      });

      if (response.error) {
        this.showStatus('OCR test failed: ' + response.error, 'error');
        return;
      }

      if (response.success) {
        this.showStatus('OCR service test successful!', 'success');
      } else {
        this.showStatus('OCR service test failed', 'error');
      }
    } catch (error) {
      console.error('OCR test failed:', error);
      this.showStatus('OCR test failed', 'error');
    } finally {
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  private async testLLMService(): Promise<void> {
    const button = document.getElementById('testLlmBtn') as HTMLButtonElement;
    const originalText = button.textContent;

    try {
      button.textContent = 'Testing...';
      button.disabled = true;

      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.TEST_API,
        data: { service: 'llm' }
      });

      if (response.error) {
        this.showStatus('LLM test failed: ' + response.error, 'error');
        return;
      }

      if (response.success) {
        this.showStatus('LLM service test successful!', 'success');
      } else {
        this.showStatus('LLM service test failed', 'error');
      }
    } catch (error) {
      console.error('LLM test failed:', error);
      this.showStatus('LLM test failed', 'error');
    } finally {
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  private async clearSettings(): Promise<void> {
    if (!confirm('Are you sure you want to clear all settings? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.SAVE_SETTINGS,
        data: {
          ocrApiKey: '',
          openaiApiKey: '',
          anthropicApiKey: '',
          geminiApiKey: '',
          ocrService: 'tesseract',
          llmService: 'openai',
          theme: 'system'
        }
      });

      if (response.error) {
        this.showStatus('Failed to clear settings: ' + response.error, 'error');
        return;
      }

      this.showStatus('Settings cleared successfully!', 'success');
      this.loadSettings(); // Reload to update form
    } catch (error) {
      console.error('Failed to clear settings:', error);
      this.showStatus('Failed to clear settings', 'error');
    }
  }

  private showStatus(message: string, type: 'success' | 'error' | 'info'): void {
    this.status.textContent = message;
    this.status.className = `status ${type}`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        this.status.style.display = 'none';
      }, 3000);
    }
  }
}

// Initialize options page when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new OptionsPage();
  });
} else {
  new OptionsPage();
}
