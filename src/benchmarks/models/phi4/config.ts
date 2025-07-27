export const phi4Config = {
  modelName: 'phi4',
  displayName: 'Phi-4',
  defaultIterations: 10,
  apiKeyEnvVar: 'OPENROUTER_API_KEY',
  baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  model: process.env.PHI4_MODEL || 'microsoft/phi-4',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  maxTokens: 2000,
  requestDelay: 500, // ms between requests
};
