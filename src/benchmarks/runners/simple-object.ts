#!/usr/bin/env node
import { config } from 'dotenv';
import { resolve } from 'path';
import { BaseBenchmarkRunner } from '../shared/base-runner';
import { bookSchema, bookJsonSchema, BookCatalogType } from '../shared/schemas';
import { printComparisonResults, saveResults } from '../shared/utils';
import { bookSampleInputs } from '../data/sample-inputs';
import type { BenchmarkConfig, ValidationResult } from '../shared/types';

// Model imports
import { HaikuClient } from '../models/haiku/client';
import { haikuConfig } from '../models/haiku/config';
import { Llama33Client } from '../models/llama33/client';
import { llama33Config } from '../models/llama33/config';
import { Phi4Client } from '../models/phi4/client';
import { phi4Config } from '../models/phi4/config';

// Load environment variables
config({ path: resolve(import.meta.dirname, '../../../.env') });

function validateBookCatalog(result: any): ValidationResult {
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
    const requiredFields = [
      'title',
      'author',
      'publication_year',
      'genre',
      'price',
      'in_stock',
    ];
    const fieldPoints = bookScore / requiredFields.length;

    for (const field of requiredFields) {
      if (book[field] !== undefined && book[field] !== null) {
        bookPoints += fieldPoints;
      } else {
        errors.push(`Book ${i + 1}: Missing ${field}`);
      }
    }

    // Type validation
    if (typeof book.title !== 'string')
      errors.push(`Book ${i + 1}: title should be string`);
    if (typeof book.author !== 'string')
      errors.push(`Book ${i + 1}: author should be string`);
    if (typeof book.publication_year !== 'number')
      errors.push(`Book ${i + 1}: publication_year should be number`);
    if (typeof book.genre !== 'string')
      errors.push(`Book ${i + 1}: genre should be string`);
    if (typeof book.price !== 'number')
      errors.push(`Book ${i + 1}: price should be number`);
    if (typeof book.in_stock !== 'boolean')
      errors.push(`Book ${i + 1}: in_stock should be boolean`);

    score += bookPoints;
  }

  return {
    isValid: errors.length === 0,
    score: Math.round(score),
    errors,
  };
}

class SimpleObjectRunner extends BaseBenchmarkRunner {
  async run(model: string): Promise<void> {
    const config: BenchmarkConfig = {
      iterations: this.getIterations(model),
      inputTexts: bookSampleInputs,
      model,
    };

    try {
      console.log(`Running simple object benchmark for ${model}...`);
      console.log(
        `${config.iterations} iterations with ${bookSampleInputs.length} input texts\n`
      );

      const results = await this.runComparison(
        config,
        bookJsonSchema,
        bookSchema,
        validateBookCatalog
      );

      printComparisonResults(results);

      const filepath = saveResults(results, 'simple-object');
      console.log(`\nResults saved to: ${filepath}`);
    } catch (error) {
      console.error('Benchmark failed:', error);
      process.exit(1);
    }
  }

  private getIterations(model: string): number {
    const envVar = `${model.toUpperCase()}_BENCHMARK_ITERATIONS`;
    return parseInt(process.env[envVar] || '10');
  }
}

async function createRunner(model: string): Promise<SimpleObjectRunner> {
  switch (model.toLowerCase()) {
    case 'haiku': {
      const apiKey = process.env[haikuConfig.apiKeyEnvVar];
      if (!apiKey) {
        throw new Error(
          `${haikuConfig.apiKeyEnvVar} environment variable is required`
        );
      }
      const client = new HaikuClient(
        apiKey,
        haikuConfig.baseUrl,
        haikuConfig.model
      );
      return new SimpleObjectRunner(client, haikuConfig.modelName);
    }
    case 'llama33': {
      const client = new Llama33Client(
        llama33Config.apiKey,
        llama33Config.baseUrl,
        llama33Config.model
      );
      return new SimpleObjectRunner(client, llama33Config.modelName);
    }
    case 'phi4': {
      const client = new Phi4Client(
        phi4Config.apiKey,
        phi4Config.baseUrl,
        phi4Config.model
      );
      return new SimpleObjectRunner(client, phi4Config.modelName);
    }
    default:
      throw new Error(
        `Unsupported model: ${model}. Supported: haiku, llama33, phi4`
      );
  }
}

async function main() {
  const model = process.argv[2];
  if (!model) {
    console.error('Usage: npm run benchmark:simple <model>');
    console.error('Example: npm run benchmark:simple haiku');
    console.error('Supported models: haiku, llama33, phi4');
    process.exit(1);
  }

  try {
    const runner = await createRunner(model);
    await runner.run(model);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
