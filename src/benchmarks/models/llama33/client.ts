import type { ModelClient } from '../../shared/types';

export class Llama33Client implements ModelClient {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = 'http://localhost:11434', model = 'llama3.3') {
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
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        options: {
          num_predict: maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Llama 3.3 API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as { response: string };

    // Ollama doesn't provide token counts in the same way, so we estimate
    const inputTokens = Math.ceil(prompt.length / 4); // Rough estimate: 4 chars per token
    const outputTokens = Math.ceil(data.response.length / 4);

    return {
      content: data.response,
      inputTokens,
      outputTokens,
    };
  }
}
