import { SummaryResult, OpenAIResponse, AnthropicResponse, GeminiResponse } from '../shared/types';
import { API_ENDPOINTS, API_LIMITS } from '../shared/constants';

export class LLMService {
  private openaiApiKey: string | null = null;
  private anthropicApiKey: string | null = null;
  private geminiApiKey: string | null = null;
  private service: 'openai' | 'anthropic' | 'gemini' = 'openai';

  constructor() {}

  public setOpenAIKey(apiKey: string): void {
    this.openaiApiKey = apiKey;
    console.log(`LLMService: OpenAI API key set`);
  }

  public setAnthropicKey(apiKey: string): void {
    this.anthropicApiKey = apiKey;
    console.log(`LLMService: Anthropic API key set`);
  }

  public setGeminiKey(apiKey: string): void {
    this.geminiApiKey = apiKey;
    console.log(`LLMService: Gemini API key set`);
  }

  public setService(service: 'openai' | 'anthropic' | 'gemini'): void {
    this.service = service;
    console.log(`LLMService: Service set to ${service}`);
  }

  /**
   * Generate 3-line summary from text using LLM
   */
  public async generateSummary(text: string): Promise<SummaryResult> {
    try {
      console.log(`LLMService: Starting summary generation with service: ${this.service}`);
      console.log(`LLMService: API keys configured:`, {
        openai: !!this.openaiApiKey,
        anthropic: !!this.anthropicApiKey,
        gemini: !!this.geminiApiKey
      });
      
      if (this.service === 'openai') {
        return await this.generateSummaryWithOpenAI(text);
      } else if (this.service === 'anthropic') {
        return await this.generateSummaryWithAnthropic(text);
      } else {
        return await this.generateSummaryWithGemini(text);
      }
    } catch (error) {
      console.error('LLM summarization failed:', error);
      return {
        summary: '',
        success: false,
        error: 'Summary generation failed, check network and API key'
      };
    }
  }

  /**
   * Generate summary using OpenAI GPT
   */
  private async generateSummaryWithOpenAI(text: string): Promise<SummaryResult> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('OpenAI API: Starting API call');
    console.log(`OpenAI API: API key length: ${this.openaiApiKey.length}`);

    // Truncate text if too long
    const truncatedText = this.truncateText(text, API_LIMITS.OPENAI_MAX_TOKENS * 3);

    console.log(`OpenAI API: Making request to: ${API_ENDPOINTS.OPENAI}`);

    const response = await fetch(API_ENDPOINTS.OPENAI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes text in exactly 3 lines, focusing on key points.'
          },
          {
            role: 'user',
            content: `Summarize the following text in exactly 3 lines, focusing on key points:\n\n${truncatedText}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: OpenAIResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenAI');
    }

    const summary = data.choices[0]?.message?.content?.trim() || '';

    return {
      summary,
      success: true
    };
  }

  /**
   * Generate summary using Anthropic Claude
   */
  private async generateSummaryWithAnthropic(text: string): Promise<SummaryResult> {
    if (!this.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    console.log('Anthropic API: Starting API call');
    console.log(`Anthropic API: API key length: ${this.anthropicApiKey.length}`);

    // Truncate text if too long
    const truncatedText = this.truncateText(text, API_LIMITS.ANTHROPIC_MAX_TOKENS * 3);

    console.log(`Anthropic API: Making request to: ${API_ENDPOINTS.ANTHROPIC}`);

    const response = await fetch(API_ENDPOINTS.ANTHROPIC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `Summarize the following text in exactly 3 lines, focusing on key points:\n\n${truncatedText}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: AnthropicResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.content || data.content.length === 0) {
      throw new Error('No response from Anthropic');
    }

    const summary = data.content[0]?.text?.trim() || '';

    return {
      summary,
      success: true
    };
  }

  /**
   * Generate summary using Google Gemini
   */
  private async generateSummaryWithGemini(text: string): Promise<SummaryResult> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Gemini API: Starting API call');
    console.log(`Gemini API: API key length: ${this.geminiApiKey.length}`);

    // Truncate text if too long
    const truncatedText = this.truncateText(text, API_LIMITS.GEMINI_MAX_TOKENS * 3);

    const url = `${API_ENDPOINTS.GEMINI}?key=${this.geminiApiKey}`;
    console.log(`Gemini API: Making request to: ${url.substring(0, 50)}...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Summarize the following text in exactly 3 lines, focusing on key points:\n\n${truncatedText}`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.3
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini');
    }

    const summary = data.candidates[0]?.content?.parts?.[0]?.text?.trim() || '';

    return {
      summary,
      success: true
    };
  }

  /**
   * Truncate text to fit within token limits
   */
  private truncateText(text: string, maxTokens: number): string {
    // Rough estimation: 1 token ≈ 4 characters
    const maxChars = maxTokens * 4;
    
    if (text.length <= maxChars) {
      return text;
    }

    // Truncate and add ellipsis
    return text.substring(0, maxChars - 3) + '...';
  }

  /**
   * Test LLM service with sample text
   */
  public async testLLM(): Promise<boolean> {
    try {
      const testText = 'This is a test text for LLM summarization. It contains multiple sentences to test the summarization capabilities. The summary should be generated in exactly 3 lines.';
      
      const result = await this.generateSummary(testText);
      
      return result.success && result.summary.split('\n').length <= 3;
    } catch (error) {
      console.error('LLM test failed:', error);
      return false;
    }
  }
}
