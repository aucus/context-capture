import { Region } from '../shared/types';
import { UI_CONSTANTS } from '../shared/constants';

export class ResultsUI {
  private popup: HTMLDivElement | null = null;
  private loadingPopup: HTMLDivElement | null = null;

  constructor() {}

  /**
   * Show loading state
   */
  public showLoading(region: Region): void {
    this.hideResults();
    this.createLoadingPopup(region);
  }

  /**
   * Show results with summary
   */
  public showResults(summary: string, region: Region): void {
    this.hideLoading();
    this.hideResults();
    this.createResultsPopup(summary, region);
  }

  /**
   * Show error message
   */
  public showError(message: string, region: Region): void {
    this.hideLoading();
    this.hideResults();
    this.createErrorPopup(message, region);
  }

  /**
   * Hide all popups
   */
  public hideAll(): void {
    this.hideLoading();
    this.hideResults();
  }

  private createLoadingPopup(region: Region): void {
    this.loadingPopup = document.createElement('div');
    this.loadingPopup.style.cssText = `
      position: fixed;
      top: ${region.y + region.height + 10}px;
      left: ${region.x}px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: ${UI_CONSTANTS.BORDER_RADIUS}px;
      padding: 16px 20px;
      box-shadow: ${UI_CONSTANTS.SHADOW};
      z-index: 1000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: #333;
      border: 1px solid rgba(0, 0, 0, 0.1);
      min-width: 200px;
      display: flex;
      align-items: center;
      gap: 12px;
    `;

    // Loading spinner
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 16px;
      height: 16px;
      border: 2px solid #e0e0e0;
      border-top: 2px solid #007AFF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    const text = document.createElement('span');
    text.textContent = 'Processing...';

    this.loadingPopup.appendChild(spinner);
    this.loadingPopup.appendChild(text);
    document.body.appendChild(this.loadingPopup);
  }

  private createResultsPopup(summary: string, region: Region): void {
    this.popup = document.createElement('div');
    this.popup.style.cssText = `
      position: fixed;
      top: ${region.y + region.height + 10}px;
      left: ${region.x}px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: ${UI_CONSTANTS.BORDER_RADIUS}px;
      padding: 20px;
      box-shadow: ${UI_CONSTANTS.SHADOW};
      z-index: 1000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: #333;
      border: 1px solid rgba(0, 0, 0, 0.1);
      max-width: 400px;
      min-width: 300px;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    `;

    const title = document.createElement('h3');
    title.textContent = 'Summary';
    title.style.cssText = `
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 20px;
      color: #666;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s;
    `;
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'transparent';
    });
    closeButton.addEventListener('click', () => {
      this.hideResults();
    });

    header.appendChild(title);
    header.appendChild(closeButton);

    // Summary content
    const content = document.createElement('div');
    content.style.cssText = `
      margin-bottom: 16px;
      line-height: 1.5;
      white-space: pre-line;
    `;
    content.textContent = summary;

    // Copy button
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy to Clipboard';
    copyButton.style.cssText = `
      background: #007AFF;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      width: 100%;
      transition: background-color 0.2s;
    `;
    copyButton.addEventListener('mouseenter', () => {
      copyButton.style.backgroundColor = '#0056CC';
    });
    copyButton.addEventListener('mouseleave', () => {
      copyButton.style.backgroundColor = '#007AFF';
    });
    copyButton.addEventListener('click', () => {
      this.copyToClipboard(summary);
      copyButton.textContent = 'Copied!';
      copyButton.style.backgroundColor = '#34C759';
      setTimeout(() => {
        copyButton.textContent = 'Copy to Clipboard';
        copyButton.style.backgroundColor = '#007AFF';
      }, 2000);
    });

    this.popup.appendChild(header);
    this.popup.appendChild(content);
    this.popup.appendChild(copyButton);
    document.body.appendChild(this.popup);

    // Auto-hide after 30 seconds
    setTimeout(() => {
      this.hideResults();
    }, 30000);
  }

  private createErrorPopup(message: string, region: Region): void {
    this.popup = document.createElement('div');
    this.popup.style.cssText = `
      position: fixed;
      top: ${region.y + region.height + 10}px;
      left: ${region.x}px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: ${UI_CONSTANTS.BORDER_RADIUS}px;
      padding: 20px;
      box-shadow: ${UI_CONSTANTS.SHADOW};
      z-index: 1000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: #333;
      border: 1px solid rgba(255, 59, 48, 0.3);
      max-width: 400px;
      min-width: 300px;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    `;

    const title = document.createElement('h3');
    title.textContent = 'Error';
    title.style.cssText = `
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #FF3B30;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 20px;
      color: #666;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s;
    `;
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'transparent';
    });
    closeButton.addEventListener('click', () => {
      this.hideResults();
    });

    header.appendChild(title);
    header.appendChild(closeButton);

    // Error message
    const content = document.createElement('div');
    content.style.cssText = `
      margin-bottom: 16px;
      line-height: 1.5;
      color: #FF3B30;
    `;
    content.textContent = message;

    // Retry button
    const retryButton = document.createElement('button');
    retryButton.textContent = 'Try Again';
    retryButton.style.cssText = `
      background: #007AFF;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      width: 100%;
      transition: background-color 0.2s;
    `;
    retryButton.addEventListener('mouseenter', () => {
      retryButton.style.backgroundColor = '#0056CC';
    });
    retryButton.addEventListener('mouseleave', () => {
      retryButton.style.backgroundColor = '#007AFF';
    });
    retryButton.addEventListener('click', () => {
      this.hideResults();
      // Trigger a new capture
      chrome.runtime.sendMessage({ type: 'START_CAPTURE' });
    });

    this.popup.appendChild(header);
    this.popup.appendChild(content);
    this.popup.appendChild(retryButton);
    document.body.appendChild(this.popup);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      this.hideResults();
    }, 10000);
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  private hideLoading(): void {
    if (this.loadingPopup) {
      document.body.removeChild(this.loadingPopup);
      this.loadingPopup = null;
    }
  }

  private hideResults(): void {
    if (this.popup) {
      document.body.removeChild(this.popup);
      this.popup = null;
    }
  }
}
