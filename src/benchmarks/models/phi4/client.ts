import type { ModelClient } from '../../shared/types';

export class Phi4Client implements ModelClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(
    apiKey: string,
    baseUrl = 'https://openrouter.ai/api/v1',
    model = 'microsoft/phi-4'
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generateResponse(
    prompt: string,
    maxTokens = 2000
  ): Promise<{
    content: string;
    inputTokens: number;
    outputTokens: number;
  }> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/nadeesha/structlm',
        'X-Title': 'StructLM Benchmarks',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
      };
    };

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Expected text response from Phi-4');
    }

    return {
      content,
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens,
    };
  }
}
