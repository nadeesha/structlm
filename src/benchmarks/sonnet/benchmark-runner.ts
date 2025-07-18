import Anthropic from '@anthropic-ai/sdk';
import { runJsonSchemaExample } from './json-schema-example.js';
import { runStructLMExample } from './structlm-example.js';

export interface BenchmarkConfig {
  iterations: number;
  apiKey: string;
  inputTexts: string[];
}

export interface BenchmarkResult {
  method: 'json-schema' | 'structlm';
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
}

export interface ComparisonResult {
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

function validateBookCatalog(result: any): { isValid: boolean; score: number; errors: string[] } {
  const errors: string[] = [];
  let score = 0;

  // Check if result has books array
  if (!result.books || !Array.isArray(result.books)) {
    errors.push('Missing or invalid books array');
    return { isValid: false, score: 0, errors };
  }

  if (result.books.length === 0) {
    errors.push('Empty books array');
    return { isValid: false, score: 10, errors };
  }

  score += 20; // Base score for having books array

  // Check each book
  const bookScore = 80 / result.books.length; // Remaining points divided by number of books
  
  for (let i = 0; i < result.books.length; i++) {
    const book = result.books[i];
    let bookPoints = 0;
    
    // Required fields check
    const requiredFields = ['title', 'author', 'publication_year', 'genre', 'price', 'in_stock'];
    const fieldPoints = bookScore / requiredFields.length;
    
    for (const field of requiredFields) {
      if (book[field] !== undefined && book[field] !== null) {
        bookPoints += fieldPoints;
      } else {
        errors.push(`Book ${i + 1}: Missing ${field}`);
      }
    }
    
    // Type validation
    if (typeof book.title !== 'string') errors.push(`Book ${i + 1}: title should be string`);
    if (typeof book.author !== 'string') errors.push(`Book ${i + 1}: author should be string`);
    if (typeof book.publication_year !== 'number') errors.push(`Book ${i + 1}: publication_year should be number`);
    if (typeof book.genre !== 'string') errors.push(`Book ${i + 1}: genre should be string`);
    if (typeof book.price !== 'number') errors.push(`Book ${i + 1}: price should be number`);
    if (typeof book.in_stock !== 'boolean') errors.push(`Book ${i + 1}: in_stock should be boolean`);
    
    score += bookPoints;
  }

  return { 
    isValid: errors.length === 0, 
    score: Math.round(score), 
    errors 
  };
}

async function runSingleBenchmark(
  client: Anthropic,
  method: 'json-schema' | 'structlm',
  inputText: string
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
    if (method === 'json-schema') {
      const result = await runJsonSchemaExample(client, inputText);
      const validation = validateBookCatalog(result.result);
      
      return {
        success: true,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        responseTime: Date.now() - startTime,
        accuracyScore: validation.score
      };
    } else {
      const result = await runStructLMExample(client, inputText);
      const validation = validateBookCatalog(result.result);
      
      return {
        success: true,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        responseTime: Date.now() - startTime,
        accuracyScore: validation.score
      };
    }
  } catch (error) {
    return {
      success: false,
      inputTokens: 0,
      outputTokens: 0,
      responseTime: Date.now() - startTime,
      accuracyScore: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function runBenchmark(
  method: 'json-schema' | 'structlm',
  config: BenchmarkConfig
): Promise<BenchmarkResult> {
  const client = new Anthropic({
    apiKey: config.apiKey
  });

  const results: BenchmarkResult = {
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
    errors: []
  };

  const inputTokens: number[] = [];
  const outputTokens: number[] = [];
  const accuracyScores: number[] = [];
  const responseTimes: number[] = [];

  console.log(`Running ${method} benchmark with ${config.iterations} iterations...`);

  for (let i = 0; i < config.iterations; i++) {
    const inputText = config.inputTexts[i % config.inputTexts.length];
    if (!inputText) {
      throw new Error('No input text available');
    }
    console.log(`  Iteration ${i + 1}/${config.iterations} (${method})`);
    
    const result = await runSingleBenchmark(client, method, inputText);
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
    results.totalInputTokens = inputTokens.reduce((sum, tokens) => sum + tokens, 0);
    results.totalOutputTokens = outputTokens.reduce((sum, tokens) => sum + tokens, 0);
    results.averageInputTokens = Math.round(results.totalInputTokens / inputTokens.length);
    results.averageOutputTokens = Math.round(results.totalOutputTokens / outputTokens.length);
    results.accuracyScore = Math.round(accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length);
    results.averageResponseTime = Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length);
  }

  return results;
}

export async function runComparison(config: BenchmarkConfig): Promise<ComparisonResult> {
  console.log('Starting benchmark comparison...\n');
  
  const [jsonSchemaResult, structlmResult] = await Promise.all([
    runBenchmark('json-schema', config),
    runBenchmark('structlm', config)
  ]);

  const totalJsonTokens = jsonSchemaResult.totalInputTokens + jsonSchemaResult.totalOutputTokens;
  const totalStructLMTokens = structlmResult.totalInputTokens + structlmResult.totalOutputTokens;
  
  const tokenSavings = {
    inputTokens: jsonSchemaResult.totalInputTokens - structlmResult.totalInputTokens,
    outputTokens: jsonSchemaResult.totalOutputTokens - structlmResult.totalOutputTokens,
    totalTokens: totalJsonTokens - totalStructLMTokens,
    percentageSaved: totalJsonTokens > 0 ? Math.round(((totalJsonTokens - totalStructLMTokens) / totalJsonTokens) * 100) : 0
  };

  const accuracyDifference = structlmResult.accuracyScore - jsonSchemaResult.accuracyScore;
  const performanceDifference = jsonSchemaResult.averageResponseTime - structlmResult.averageResponseTime;

  return {
    jsonSchema: jsonSchemaResult,
    structlm: structlmResult,
    tokenSavings,
    accuracyDifference,
    performanceDifference
  };
}

export function printResults(comparison: ComparisonResult): void {
  console.log('\n' + '='.repeat(60));
  console.log('BENCHMARK RESULTS');
  console.log('='.repeat(60));
  
  console.log('\nJSON Schema Results:');
  console.log(`  Successful: ${comparison.jsonSchema.successfulIterations}/${comparison.jsonSchema.totalIterations}`);
  console.log(`  Average Input Tokens: ${comparison.jsonSchema.averageInputTokens}`);
  console.log(`  Average Output Tokens: ${comparison.jsonSchema.averageOutputTokens}`);
  console.log(`  Total Tokens: ${comparison.jsonSchema.totalInputTokens + comparison.jsonSchema.totalOutputTokens}`);
  console.log(`  Accuracy Score: ${comparison.jsonSchema.accuracyScore}%`);
  console.log(`  Average Response Time: ${comparison.jsonSchema.averageResponseTime}ms`);
  
  console.log('\nStructLM Results:');
  console.log(`  Successful: ${comparison.structlm.successfulIterations}/${comparison.structlm.totalIterations}`);
  console.log(`  Average Input Tokens: ${comparison.structlm.averageInputTokens}`);
  console.log(`  Average Output Tokens: ${comparison.structlm.averageOutputTokens}`);
  console.log(`  Total Tokens: ${comparison.structlm.totalInputTokens + comparison.structlm.totalOutputTokens}`);
  console.log(`  Accuracy Score: ${comparison.structlm.accuracyScore}%`);
  console.log(`  Average Response Time: ${comparison.structlm.averageResponseTime}ms`);
  
  console.log('\nComparison:');
  console.log(`  Token Savings: ${comparison.tokenSavings.totalTokens} (${comparison.tokenSavings.percentageSaved}%)`);
  console.log(`  Input Token Difference: ${comparison.tokenSavings.inputTokens > 0 ? '+' : ''}${comparison.tokenSavings.inputTokens}`);
  console.log(`  Output Token Difference: ${comparison.tokenSavings.outputTokens > 0 ? '+' : ''}${comparison.tokenSavings.outputTokens}`);
  console.log(`  Accuracy Difference: ${comparison.accuracyDifference > 0 ? '+' : ''}${comparison.accuracyDifference}%`);
  console.log(`  Performance Difference: ${comparison.performanceDifference > 0 ? '+' : ''}${comparison.performanceDifference}ms`);
  
  if (comparison.jsonSchema.errors.length > 0) {
    console.log('\nJSON Schema Errors:');
    comparison.jsonSchema.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (comparison.structlm.errors.length > 0) {
    console.log('\nStructLM Errors:');
    comparison.structlm.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log('\n' + '='.repeat(60));
}