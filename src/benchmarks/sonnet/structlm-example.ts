import Anthropic from '@anthropic-ai/sdk';
import { s, Infer } from '../../index.js';

export const bookCatalogSchema = s.object({
  books: s.array(s.object({
    title: s.string(),
    author: s.string(),
    publication_year: s.number(),
    genre: s.string(),
    price: s.number(),
    in_stock: s.boolean()
  }))
});

export type BookCatalogType = Infer<typeof bookCatalogSchema>;

export async function runStructLMExample(
  client: Anthropic,
  inputText: string
): Promise<{
  result: BookCatalogType;
  inputTokens: number;
  outputTokens: number;
}> {
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `Extract book information from the following text and format it according to the schema.

Input text: ${inputText}

Please respond with a JSON object that matches this structure:
${bookCatalogSchema.toString()}

Return only the JSON object, no additional text.`
      }
    ]
  });

  const content = response.content[0];
  if (!content || content.type !== 'text') {
    throw new Error('Expected text response');
  }

  let result: BookCatalogType;
  try {
    // Extract JSON from the response (in case it's wrapped in markdown)
    const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/) || 
                     content.text.match(/```\n([\s\S]*?)\n```/) ||
                     [null, content.text];
    
    const jsonText = jsonMatch[1] || content.text;
    result = JSON.parse(jsonText.trim());
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error}`);
  }

  return {
    result,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens
  };
}