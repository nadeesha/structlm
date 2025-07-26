export const llama33Config = {
  modelName: 'llama33',
  displayName: 'Llama 3.3',
  defaultIterations: 10,
  baseUrl: process.env.LLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.LLAMA_MODEL || 'llama3.3',
  maxTokens: 2000,
  requestDelay: 500, // ms between requests (local model, can be faster)
};
