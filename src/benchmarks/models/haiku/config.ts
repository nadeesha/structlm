export const haikuConfig = {
  modelName: 'haiku',
  displayName: 'Claude 3.5 Haiku',
  defaultIterations: 10,
  apiKeyEnvVar: 'OPENROUTER_API_KEY',
  baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-haiku',
  maxTokens: 2000,
  requestDelay: 500, // ms between requests (Haiku is faster)
};
