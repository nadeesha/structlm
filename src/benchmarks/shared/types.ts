export interface BenchmarkConfig {
  iterations: number;
  inputTexts: string[];
  model: string;
  outputDir?: string;
}

export interface ModelClient {
  generateResponse(
    prompt: string,

    maxTokens?: number
  ): Promise<{
    content: string;
    inputTokens: number;
    outputTokens: number;
  }>;
}

export interface BenchmarkResult {
  model: string;
  method: string;
  totalIterations: number;
  successfulIterations: number;
  failedIterations: number;
  averageInputTokens: number;
  averageOutputTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  accuracyScore: number;
  averageResponseTime: number;
  errors: string[];
  sampleInputs: string[];
}

export interface ComparisonResult {
  model: string;
  jsonSchema: BenchmarkResult;
  structlm: BenchmarkResult;
  tokenSavings: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    percentageSaved: number;
  };
  accuracyDifference: number;
  performanceDifference: number;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
}

export type BenchmarkType =
  | 'simple-object'
  | 'complex-object'
  | 'validation-hints';
