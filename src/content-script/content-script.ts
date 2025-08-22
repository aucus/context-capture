import { RegionSelector } from './selector';
import { ScreenCapture } from './capture';
import { ResultsUI } from './ui';
import { Region } from '../shared/types';
import { MESSAGE_TYPES } from '../shared/constants';

class ContentScript {
  private regionSelector: RegionSelector;
  private screenCapture: ScreenCapture;
  private resultsUI: ResultsUI;
  private isActive = false;

  constructor() {
    this.regionSelector = new RegionSelector();
    this.screenCapture = ScreenCapture.getInstance();
    this.resultsUI = new ResultsUI();
    
    this.handleCapture = this.handleCapture.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  public init(): void {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(this.handleMessage);
    
    // Listen for extension icon click
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'START_CAPTURE') {
        this.startCapture();
        sendResponse({ success: true });
      }
    });

    console.log('ContextCapture content script initialized');
  }

  private handleMessage(message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): void {
    switch (message.type) {
      case MESSAGE_TYPES.SHOW_RESULTS:
        this.showResults(message.data);
        sendResponse({ success: true });
        break;
      
      case 'START_CAPTURE':
        this.startCapture();
        sendResponse({ success: true });
        break;

      case 'CROP_IMAGE':
        this.cropImage(message.data, sendResponse);
        break;
      
      default:
        sendResponse({ error: 'Unknown message type' });
    }
  }

  private async cropImage(data: { imageData: string; region: Region }, sendResponse: (response?: any) => void): Promise<void> {
    try {
      const croppedImage = await this.screenCapture.captureVisibleTab(data.region);
      sendResponse({ croppedImage });
    } catch (error) {
      console.error('Failed to crop image:', error);
      sendResponse({ error: 'Failed to crop image' });
    }
  }

  private startCapture(): void {
    if (this.isActive) {
      console.log('Capture already active');
      return;
    }

    this.isActive = true;
    this.regionSelector.start(this.handleCapture);
  }

  private async handleCapture(region: Region): Promise<void> {
    try {
      // Stop the selector
      this.regionSelector.stop();
      this.isActive = false;

      // Show loading state
      this.resultsUI.showLoading(region);

      // Capture the region
      await this.screenCapture.captureRegion(region);

      // Results will be shown via message from background script
      
    } catch (error) {
      console.error('Capture failed:', error);
      this.resultsUI.showError('Failed to capture region. Please try again.', region);
      this.isActive = false;
    }
  }

  private showResults(data: { summary: string; region: Region }): void {
    this.resultsUI.showResults(data.summary, data.region);
  }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ContentScript().init();
  });
} else {
  new ContentScript().init();
}
