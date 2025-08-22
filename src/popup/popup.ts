import { MESSAGE_TYPES } from '../shared/constants';

class Popup {
  private ocrStatus: HTMLElement;
  private llmStatus: HTMLElement;
  private captureBtn: HTMLButtonElement;
  private settingsBtn: HTMLButtonElement;

  constructor() {
    this.ocrStatus = document.getElementById('ocrStatus') as HTMLElement;
    this.llmStatus = document.getElementById('llmStatus') as HTMLElement;
    this.captureBtn = document.getElementById('captureBtn') as HTMLButtonElement;
    this.settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement;

    this.initializeEventListeners();
    this.checkServicesStatus();
  }

  private initializeEventListeners(): void {
    // Capture button
    this.captureBtn.addEventListener('click', () => {
      this.startCapture();
    });

    // Settings button
    this.settingsBtn.addEventListener('click', () => {
      this.openSettings();
    });
  }

  private async checkServicesStatus(): Promise<void> {
    try {
      // Get current tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (!tab?.id) {
        this.updateOCRStatus('error');
        this.updateLLMStatus('error');
        return;
      }

      // Check OCR service
      this.updateOCRStatus('checking');
      const ocrResponse = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.TEST_API,
        data: { service: 'ocr' }
      });

      if (ocrResponse.success) {
        this.updateOCRStatus('ready');
      } else {
        this.updateOCRStatus('error');
      }

      // Check LLM service
      this.updateLLMStatus('checking');
      const llmResponse = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.TEST_API,
        data: { service: 'llm' }
      });

      if (llmResponse.success) {
        this.updateLLMStatus('ready');
      } else {
        this.updateLLMStatus('error');
      }

    } catch (error) {
      console.error('Failed to check services status:', error);
      this.updateOCRStatus('error');
      this.updateLLMStatus('error');
    }
  }

  private updateOCRStatus(status: 'ready' | 'error' | 'checking'): void {
    this.ocrStatus.textContent = this.getStatusText(status);
    this.ocrStatus.className = `status-value ${status}`;
  }

  private updateLLMStatus(status: 'ready' | 'error' | 'checking'): void {
    this.llmStatus.textContent = this.getStatusText(status);
    this.llmStatus.className = `status-value ${status}`;
  }

  private getStatusText(status: 'ready' | 'error' | 'checking'): string {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'error':
        return 'Error';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  }

  private async startCapture(): Promise<void> {
    try {
      // Get current tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (!tab?.id) {
        console.error('No active tab found');
        return;
      }

      // Send message to content script to start capture
      await chrome.tabs.sendMessage(tab.id!, { type: 'START_CAPTURE' });
      
      // Close popup
      window.close();
    } catch (error) {
      console.error('Failed to start capture:', error);
    }
  }

  private openSettings(): void {
    chrome.runtime.openOptionsPage();
  }
}

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Popup();
  });
} else {
  new Popup();
}
