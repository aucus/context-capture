import { OCRResult, OCRSpaceResponse, GoogleVisionResponse } from '../shared/types';
import { API_ENDPOINTS } from '../shared/constants';

export class OCRService {
  private apiKey: string | null = null;
  private service: 'googlevision' | 'ocrspace' | 'tesseract' = 'googlevision';

  constructor() {}

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  public setService(service: 'googlevision' | 'ocrspace' | 'tesseract'): void {
    this.service = service;
  }

  /**
   * Extract text from image using OCR
   */
  public async extractText(imageDataUrl: string): Promise<OCRResult> {
    try {
      if (this.service === 'googlevision') {
        return await this.extractTextWithGoogleVision(imageDataUrl);
      } else if (this.service === 'ocrspace') {
        return await this.extractTextWithOCRSpace(imageDataUrl);
      } else {
        return await this.extractTextWithTesseract(imageDataUrl);
      }
    } catch (error) {
      console.error('OCR extraction failed:', error);
      return {
        text: '',
        confidence: 0,
        success: false,
        error: 'Text recognition failed, please try again'
      };
    }
  }

  /**
   * Extract text using Google Vision API
   */
  private async extractTextWithGoogleVision(imageDataUrl: string): Promise<OCRResult> {
    if (!this.apiKey) {
      throw new Error('Google Vision API key not configured');
    }

    // Convert data URL to base64
    const base64Data = imageDataUrl.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid image data');
    }

    const url = `${API_ENDPOINTS.GOOGLE_VISION}?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Data
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google Vision API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: GoogleVisionResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.responses || data.responses.length === 0) {
      return {
        text: '',
        confidence: 0,
        success: true,
        error: 'No text found in image'
      };
    }

    const response_data = data.responses[0];
    if (!response_data) {
      return {
        text: '',
        confidence: 0,
        success: true,
        error: 'No text found in image'
      };
    }

    // Use fullTextAnnotation if available (more accurate)
    if (response_data.fullTextAnnotation?.text) {
      const text = response_data.fullTextAnnotation.text.trim();
      
      // Calculate average confidence from full text annotation
      let totalConfidence = 0;
      let confidenceCount = 0;
      
      response_data.fullTextAnnotation.pages.forEach(page => {
        page.blocks.forEach(block => {
          block.paragraphs.forEach(paragraph => {
            paragraph.words.forEach(word => {
              totalConfidence += word.confidence;
              confidenceCount++;
            });
          });
        });
      });

      const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

      return {
        text,
        confidence: Math.round(averageConfidence * 100), // Convert to percentage
        success: true
      };
    }

    // Fallback to textAnnotations if fullTextAnnotation is not available
    if (response_data.textAnnotations && response_data.textAnnotations.length > 0) {
      // Skip the first annotation as it contains the entire text
      const text = response_data.textAnnotations[0]?.description || '';
      
      return {
        text: text.trim(),
        confidence: 85, // Default confidence for textAnnotations
        success: true
      };
    }

    return {
      text: '',
      confidence: 0,
      success: true,
      error: 'No text found in image'
    };
  }

  /**
   * Extract text using OCR.Space API
   */
  private async extractTextWithOCRSpace(imageDataUrl: string): Promise<OCRResult> {
    if (!this.apiKey) {
      throw new Error('OCR API key not configured');
    }

    // Convert data URL to base64
    const base64Data = imageDataUrl.split(',')[1];
    
    const formData = new FormData();
    formData.append('apikey', this.apiKey);
    if (base64Data) {
      formData.append('base64Image', base64Data);
    }
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', 'png');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    const response = await fetch(API_ENDPOINTS.OCR_SPACE, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`OCR API request failed: ${response.status}`);
    }

    const data: OCRSpaceResponse = await response.json();

    if (data.IsErroredOnProcessing) {
      throw new Error(data.ErrorMessage || 'OCR processing failed');
    }

    if (!data.ParsedResults || data.ParsedResults.length === 0) {
      return {
        text: '',
        confidence: 0,
        success: true,
        error: 'No text found in image'
      };
    }

    // Combine all parsed text
    const text = data.ParsedResults
      .map(result => result.ParsedText)
      .join('\n')
      .trim();

    // Calculate average confidence
    const confidence = data.ParsedResults.reduce((sum, result) => {
      const words = result.TextOverlay?.Lines?.flatMap(line => line.Words) || [];
      const avgConfidence = words.reduce((wordSum, word) => wordSum + word.Confidence, 0) / Math.max(words.length, 1);
      return sum + avgConfidence;
    }, 0) / data.ParsedResults.length;

    return {
      text,
      confidence: Math.round(confidence),
      success: true
    };
  }

  /**
   * Extract text using Tesseract.js (local processing)
   */
  private async extractTextWithTesseract(imageDataUrl: string): Promise<OCRResult> {
    try {
      // Dynamic import to avoid bundling Tesseract in production if not needed
      const { createWorker } = await import('tesseract.js');
      
      const worker = await createWorker('eng');
      
      const { data } = await worker.recognize(imageDataUrl);
      
      await worker.terminate();

      return {
        text: data.text.trim(),
        confidence: Math.round(data.confidence),
        success: true
      };
    } catch (error) {
      console.error('Tesseract OCR failed:', error);
      throw new Error('Local OCR processing failed');
    }
  }

  /**
   * Test OCR service with a sample image
   */
  public async testOCR(): Promise<boolean> {
    try {
      // Create a simple test image with text
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to create canvas context');
      }

      canvas.width = 200;
      canvas.height = 50;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 200, 50);
      
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText('Test OCR', 10, 30);

      const testImageData = canvas.toDataURL('image/png');
      const result = await this.extractText(testImageData);

      return result.success && result.text.toLowerCase().includes('test');
    } catch (error) {
      console.error('OCR test failed:', error);
      return false;
    }
  }
}
