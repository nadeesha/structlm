import type {
  BenchmarkConfig,
  BenchmarkResult,
  ComparisonResult,
  ModelClient,
  ValidationResult,
} from './types';
import { calculateTokenSavings, extractJsonFromResponse } from './utils';

export abstract class BaseBenchmarkRunner {
  protected client: ModelClient;
  protected modelName: string;

  constructor(client: ModelClient, modelName: string) {
    this.client = client;
    this.modelName = modelName;
  }

  protected async runSingleBenchmark(
    method: 'json-schema' | 'structlm',
    inputText: string,
    jsonSchemaDefinition: any,
    structlmSchema: any,
    validateFn: (result: any) => ValidationResult
  ): Promise<{
    success: boolean;
    inputTokens: number;
    outputTokens: number;
    responseTime: number;
    accuracyScore: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      let prompt: string;

      if (method === 'json-schema') {
        prompt = `Extract information from the following text and format it according to the JSON schema.

Input text: ${inputText}

Please respond with a JSON object that matches this schema:
${JSON.stringify(jsonSchemaDefinition, null, 2)}

Return only the JSON object, no additional text.`;
      } else {
        prompt = `Extract information from the following text and format it according to the schema.

Input text: ${inputText}

Please respond with a JSON object that matches this structure:
${structlmSchema.stringify()}

Return only the JSON object, no additional text.`;
      }

      const response = await this.client.generateResponse(prompt, 2000);
      const result = extractJsonFromResponse(response.content);
      const validation = validateFn(result);

      return {
        success: true,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        responseTime: Date.now() - startTime,
        accuracyScore: validation.score,
      };
    } catch (error) {
      return {
        success: false,
        inputTokens: 0,
        outputTokens: 0,
        responseTime: Date.now() - startTime,
        accuracyScore: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  protected async runBenchmark(
    method: 'json-schema' | 'structlm',
    config: BenchmarkConfig,
    jsonSchemaDefinition: any,
    structlmSchema: any,
    validateFn: (result: any) => ValidationResult
  ): Promise<BenchmarkResult> {
    const results: BenchmarkResult = {
      model: this.modelName,
      method,
      totalIterations: 0,
      successfulIterations: 0,
      failedIterations: 0,
      averageInputTokens: 0,
      averageOutputTokens: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      accuracyScore: 0,
      averageResponseTime: 0,
      errors: [],
    };

    const inputTokens: number[] = [];
    const outputTokens: number[] = [];
    const accuracyScores: number[] = [];
    const responseTimes: number[] = [];

    console.log(
      `Running ${method} benchmark with ${config.iterations} iterations...`
    );

    for (let i = 0; i < config.iterations; i++) {
      const inputText = config.inputTexts[i % config.inputTexts.length];
      if (!inputText) {
        throw new Error('No input text available');
      }
      console.log(`  Iteration ${i + 1}/${config.iterations} (${method})`);

      const result = await this.runSingleBenchmark(
        method,
        inputText,
        jsonSchemaDefinition,
        structlmSchema,
        validateFn
      );
      results.totalIterations++;

      if (result.success) {
        results.successfulIterations++;
        inputTokens.push(result.inputTokens);
        outputTokens.push(result.outputTokens);
        accuracyScores.push(result.accuracyScore);
        responseTimes.push(result.responseTime);
      } else {
        results.failedIterations++;
        if (result.error) {
          results.errors.push(`Iteration ${i + 1}: ${result.error}`);
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Calculate averages
    if (inputTokens.length > 0) {
      results.totalInputTokens = inputTokens.reduce(
        (sum, tokens) => sum + tokens,
        0
      );
      results.totalOutputTokens = outputTokens.reduce(
        (sum, tokens) => sum + tokens,
        0
      );
      results.averageInputTokens = Math.round(
        results.totalInputTokens / inputTokens.length
      );
      results.averageOutputTokens = Math.round(
        results.totalOutputTokens / outputTokens.length
      );
      results.accuracyScore = Math.round(
        accuracyScores.reduce((sum, score) => sum + score, 0) /
          accuracyScores.length
      );
      results.averageResponseTime = Math.round(
        responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
      );
    }

    return results;
  }

  public async runComparison(
    config: BenchmarkConfig,
    jsonSchemaDefinition: any,
    structlmSchema: any,
    validateFn: (result: any) => ValidationResult
  ): Promise<ComparisonResult> {
    console.log(`Starting benchmark comparison for ${this.modelName}...\n`);

    const [jsonSchemaResult, structlmResult] = await Promise.all([
      this.runBenchmark(
        'json-schema',
        config,
        jsonSchemaDefinition,
        structlmSchema,
        validateFn
      ),
      this.runBenchmark(
        'structlm',
        config,
        jsonSchemaDefinition,
        structlmSchema,
        validateFn
      ),
    ]);

    const tokenSavings = calculateTokenSavings(
      jsonSchemaResult,
      structlmResult
    );
    const accuracyDifference =
      structlmResult.accuracyScore - jsonSchemaResult.accuracyScore;
    const performanceDifference =
      jsonSchemaResult.averageResponseTime - structlmResult.averageResponseTime;

    return {
      model: this.modelName,
      jsonSchema: jsonSchemaResult,
      structlm: structlmResult,
      tokenSavings,
      accuracyDifference,
      performanceDifference,
    };
  }
}
