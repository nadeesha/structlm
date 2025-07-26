import { writeFileSync } from 'fs';
import { resolve } from 'path';
import type {
  BenchmarkResult,
  ComparisonResult,
  ValidationResult,
} from './types';

export function saveResults(
  results: ComparisonResult,
  benchmarkType: string,
  outputDir = 'benchmark-results'
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${benchmarkType}-${results.model}-results-${timestamp}.json`;
  const filepath = resolve(outputDir, filename);

  writeFileSync(filepath, JSON.stringify(results, null, 2));
  return filepath;
}

export function extractJsonFromResponse(content: string): any {
  // Extract JSON from the response (in case it's wrapped in markdown)
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
    content.match(/```\n([\s\S]*?)\n```/) || [null, content];

  const jsonText = jsonMatch[1] || content;
  return JSON.parse(jsonText.trim());
}

export function calculateTokenSavings(
  jsonSchemaResult: BenchmarkResult,
  structlmResult: BenchmarkResult
) {
  const totalJsonTokens =
    jsonSchemaResult.totalInputTokens + jsonSchemaResult.totalOutputTokens;
  const totalStructLMTokens =
    structlmResult.totalInputTokens + structlmResult.totalOutputTokens;

  return {
    inputTokens:
      jsonSchemaResult.totalInputTokens - structlmResult.totalInputTokens,
    outputTokens:
      jsonSchemaResult.totalOutputTokens - structlmResult.totalOutputTokens,
    totalTokens: totalJsonTokens - totalStructLMTokens,
    percentageSaved:
      totalJsonTokens > 0
        ? Math.round(
            ((totalJsonTokens - totalStructLMTokens) / totalJsonTokens) * 100
          )
        : 0,
  };
}

export function printComparisonResults(comparison: ComparisonResult): void {
  console.log('\n' + '='.repeat(60));
  console.log(`BENCHMARK RESULTS - ${comparison.model.toUpperCase()}`);
  console.log('='.repeat(60));

  console.log('\nJSON Schema Results:');
  console.log(
    `  Successful: ${comparison.jsonSchema.successfulIterations}/${comparison.jsonSchema.totalIterations}`
  );
  console.log(
    `  Average Input Tokens: ${comparison.jsonSchema.averageInputTokens}`
  );
  console.log(
    `  Average Output Tokens: ${comparison.jsonSchema.averageOutputTokens}`
  );
  console.log(
    `  Total Tokens: ${comparison.jsonSchema.totalInputTokens + comparison.jsonSchema.totalOutputTokens}`
  );
  console.log(`  Accuracy Score: ${comparison.jsonSchema.accuracyScore}%`);
  console.log(
    `  Average Response Time: ${comparison.jsonSchema.averageResponseTime}ms`
  );

  console.log('\nStructLM Results:');
  console.log(
    `  Successful: ${comparison.structlm.successfulIterations}/${comparison.structlm.totalIterations}`
  );
  console.log(
    `  Average Input Tokens: ${comparison.structlm.averageInputTokens}`
  );
  console.log(
    `  Average Output Tokens: ${comparison.structlm.averageOutputTokens}`
  );
  console.log(
    `  Total Tokens: ${comparison.structlm.totalInputTokens + comparison.structlm.totalOutputTokens}`
  );
  console.log(`  Accuracy Score: ${comparison.structlm.accuracyScore}%`);
  console.log(
    `  Average Response Time: ${comparison.structlm.averageResponseTime}ms`
  );

  console.log('\nComparison:');
  console.log(
    `  Token Savings: ${comparison.tokenSavings.totalTokens} (${comparison.tokenSavings.percentageSaved}%)`
  );
  console.log(
    `  Input Token Difference: ${comparison.tokenSavings.inputTokens > 0 ? '+' : ''}${comparison.tokenSavings.inputTokens}`
  );
  console.log(
    `  Output Token Difference: ${comparison.tokenSavings.outputTokens > 0 ? '+' : ''}${comparison.tokenSavings.outputTokens}`
  );
  console.log(
    `  Accuracy Difference: ${comparison.accuracyDifference > 0 ? '+' : ''}${comparison.accuracyDifference}%`
  );
  console.log(
    `  Performance Difference: ${comparison.performanceDifference > 0 ? '+' : ''}${comparison.performanceDifference}ms`
  );

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
