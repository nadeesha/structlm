import type {
  BenchmarkConfig,
  BenchmarkResult,
  ComparisonResult,
  ModelClient,
  ValidationResult,
} from './types';
import { calculateTokenSavings, extractJsonFromResponse } from './utils';

// Type definitions for schema parameters
interface JsonSchemaDefinition {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  [key: string]: unknown;
}

interface StructLMSchema {
  stringify(): string;
}

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
    jsonSchemaDefinition: JsonSchemaDefinition,
    structlmSchema: StructLMSchema,

    validateFn: (_result: unknown) => ValidationResult
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
    jsonSchemaDefinition: JsonSchemaDefinition,
    structlmSchema: StructLMSchema,

    validateFn: (_result: unknown) => ValidationResult
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
      sampleInputs: [],
    };

    const inputTokens: number[] = [];
    const outputTokens: number[] = [];
    const accuracyScores: number[] = [];
    const responseTimes: number[] = [];

    console.log(
      `Running ${method} benchmark with ${config.iterations} iterations in parallel...`
    );

    // Store sample inputs
    results.sampleInputs = config.inputTexts.slice();

    // Create all benchmark tasks
    const benchmarkTasks = Array.from({ length: config.iterations }, (_, i) => {
      const inputText = config.inputTexts[i % config.inputTexts.length];
      if (!inputText) {
        throw new Error('No input text available');
      }

      return this.runSingleBenchmark(
        method,
        inputText,
        jsonSchemaDefinition,
        structlmSchema,
        validateFn
      ).then(result => ({ iteration: i + 1, result, inputText }));
    });

    // Run all benchmarks in parallel with concurrency limit
    const batchSize = 5; // Limit concurrent requests

    for (
      let batchStart = 0;
      batchStart < benchmarkTasks.length;
      batchStart += batchSize
    ) {
      const batchEnd = Math.min(batchStart + batchSize, benchmarkTasks.length);
      const batch = benchmarkTasks.slice(batchStart, batchEnd);
      const batchIndex = Math.floor(batchStart / batchSize) + 1;
      const totalBatches = Math.ceil(benchmarkTasks.length / batchSize);

      console.log(
        `  Processing batch ${batchIndex}/${totalBatches} (${method})`
      );

      const batchResults = await Promise.all(batch);

      for (const { iteration, result } of batchResults) {
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
            results.errors.push(`Iteration ${iteration}: ${result.error}`);
          }
        }
      }

      // Small delay between batches to avoid rate limiting
      if (batchStart + batchSize < benchmarkTasks.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
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
    jsonSchemaDefinition: JsonSchemaDefinition,
    structlmSchema: StructLMSchema,

    validateFn: (_result: unknown) => ValidationResult
  ): Promise<ComparisonResult> {
    console.log(`Starting benchmark comparison for ${this.modelName}...\n`);

    // Run both methods in parallel
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
