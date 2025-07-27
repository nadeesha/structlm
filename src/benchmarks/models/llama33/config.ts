export const llama33Config = {
  modelName: 'llama33',
  displayName: 'Llama 3.3',
  defaultIterations: 10,
  apiKeyEnvVar: 'OPENROUTER_API_KEY',
  baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  model: process.env.LLAMA_MODEL || 'meta-llama/llama-3.3-70b-instruct',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  maxTokens: 2000,
  requestDelay: 500, // ms between requests
};
