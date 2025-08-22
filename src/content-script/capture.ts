import { Region } from '../shared/types';
import { MESSAGE_TYPES } from '../shared/constants';

export class ScreenCapture {
  private static instance: ScreenCapture | null = null;

  private constructor() {}

  public static getInstance(): ScreenCapture {
    if (!ScreenCapture.instance) {
      ScreenCapture.instance = new ScreenCapture();
    }
    return ScreenCapture.instance;
  }

  /**
   * Captures a region of the screen and sends it to the background script
   */
  public async captureRegion(region: Region): Promise<void> {
    try {
      // Get current tab ID
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      // Send capture request to background script
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.CAPTURE_REGION,
        data: {
          region,
          tabId: tab.id!
        }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Handle the response (OCR and summarization will be done in background)
      console.log('Capture request sent successfully');
      
    } catch (error) {
      console.error('Failed to capture region:', error);
      throw new Error('Failed to capture screen region');
    }
  }

  /**
   * Captures the visible tab and crops it to the specified region
   * This method is called by the background script
   */
  public async captureVisibleTab(region: Region): Promise<string> {
    try {
      // Capture the visible tab
      const dataUrl = await chrome.tabs.captureVisibleTab(null as any, {
        format: 'png',
        quality: 100
      });

      // Create a canvas to crop the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Load the captured image
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load captured image'));
        img.src = dataUrl;
      });

      // Set canvas size to the region size
      canvas.width = region.width;
      canvas.height = region.height;

      // Draw the cropped region
      ctx.drawImage(
        img,
        region.x, region.y, region.width, region.height,
        0, 0, region.width, region.height
      );

      // Convert to base64
      return canvas.toDataURL('image/png');

    } catch (error) {
      console.error('Failed to capture visible tab:', error);
      throw new Error('Failed to capture screen region');
    }
  }

  /**
   * Optimizes image for OCR by reducing size and quality
   */
  public async optimizeImageForOCR(imageDataUrl: string): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Load the image
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageDataUrl;
      });

      // Calculate optimal size for OCR (max 1024px width/height)
      const maxSize = 1024;
      let { width, height } = img;
      
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw the resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG with reduced quality for smaller file size
      return canvas.toDataURL('image/jpeg', 0.8);

    } catch (error) {
      console.error('Failed to optimize image:', error);
      // Return original image if optimization fails
      return imageDataUrl;
    }
  }
}
