export const phi4Config = {
  modelName: 'phi4',
  displayName: 'Phi-4',
  defaultIterations: 10,
  baseUrl: process.env.PHI4_BASE_URL || 'http://localhost:11434',
  model: process.env.PHI4_MODEL || 'phi4',
  maxTokens: 2000,
  requestDelay: 500, // ms between requests (local model, can be faster)
};
