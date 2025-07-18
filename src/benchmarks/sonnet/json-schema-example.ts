import Anthropic from '@anthropic-ai/sdk';

export interface BookCatalogSchema {
  books: Array<{
    title: string;
    author: string;
    publication_year: number;
    genre: string;
    price: number;
    in_stock: boolean;
  }>;
}

export const jsonSchemaDefinition = {
  type: "object",
  properties: {
    books: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          author: { type: "string" },
          publication_year: { type: "integer" },
          genre: { type: "string" },
          price: { type: "number" },
          in_stock: { type: "boolean" }
        },
        required: ["title", "author", "publication_year", "genre", "price", "in_stock"]
      }
    }
  },
  required: ["books"]
};

export async function runJsonSchemaExample(
  client: Anthropic,
  inputText: string
): Promise<{
  result: BookCatalogSchema;
  inputTokens: number;
  outputTokens: number;
}> {
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `Extract book information from the following text and format it according to the JSON schema.

Input text: ${inputText}

Please respond with a JSON object that matches this schema:
${JSON.stringify(jsonSchemaDefinition, null, 2)}`
      }
    ]
  });

  const content = response.content[0];
  if (!content || content.type !== 'text') {
    throw new Error('Expected text response');
  }

  let result: BookCatalogSchema;
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