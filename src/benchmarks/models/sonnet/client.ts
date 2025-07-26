import Anthropic from '@anthropic-ai/sdk';
import type { ModelClient } from '../../shared/types';

export class SonnetClient implements ModelClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateResponse(
    prompt: string,
    maxTokens = 2000
  ): Promise<{
    content: string;
    inputTokens: number;
    outputTokens: number;
  }> {
    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('Expected text response from Sonnet');
    }

    return {
      content: content.text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }
}
