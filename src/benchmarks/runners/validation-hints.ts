#!/usr/bin/env node
import { config } from 'dotenv';
import { resolve } from 'path';
import { BaseBenchmarkRunner } from '../shared/base-runner';
import { userProfileSchema, userProfileJsonSchema } from '../shared/schemas';
import { saveResults } from '../shared/utils';
import { userProfileSampleInputs } from '../data/sample-inputs';
import type { BenchmarkConfig, ValidationResult } from '../shared/types';

// Model imports
import { HaikuClient } from '../models/haiku/client';
import { haikuConfig } from '../models/haiku/config';
import { Llama33Client } from '../models/llama33/client';
import { llama33Config } from '../models/llama33/config';
import { Phi4Client } from '../models/phi4/client';
import { phi4Config } from '../models/phi4/config';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

function validateUserProfile(result: unknown): ValidationResult {
  const errors: string[] = [];
  let score = 0;
  const maxScore = 100;

  // Check if result is an object
  if (!result || typeof result !== 'object') {
    errors.push('Result must be an object');
    return { isValid: false, score: 0, errors };
  }

  const resultObj = result as Record<string, unknown>;

  // Required top-level fields
  const requiredFields = [
    'id',
    'username',
    'email',
    'age',
    'isActive',
    'roles',
    'profile',
    'preferences',
    'createdAt',
    'lastLogin',
  ];
  const baseScore = 60; // 60% for having all required fields

  let presentFields = 0;
  for (const field of requiredFields) {
    if (resultObj[field] !== undefined && resultObj[field] !== null) {
      presentFields++;
    } else {
      errors.push(`Missing required field: ${field}`);
    }
  }

  score += (presentFields / requiredFields.length) * baseScore;

  // Validate specific field types and constraints
  if (
    resultObj.id &&
    typeof resultObj.id === 'string' &&
    resultObj.id.length >= 3
  ) {
    score += 4;
  } else if (resultObj.id) {
    errors.push('Invalid id: must be string with length >= 3');
  }

  if (
    resultObj.username &&
    typeof resultObj.username === 'string' &&
    resultObj.username.length >= 2 &&
    resultObj.username.length <= 20
  ) {
    score += 4;
  } else if (resultObj.username) {
    errors.push('Invalid username: must be string with length 2-20');
  }

  if (
    resultObj.email &&
    typeof resultObj.email === 'string' &&
    resultObj.email.includes('@')
  ) {
    score += 4;
  } else if (resultObj.email) {
    errors.push('Invalid email: must contain @');
  }

  if (
    resultObj.age &&
    typeof resultObj.age === 'number' &&
    resultObj.age >= 13 &&
    resultObj.age <= 120
  ) {
    score += 4;
  } else if (resultObj.age) {
    errors.push('Invalid age: must be number between 13 and 120');
  }

  if (typeof resultObj.isActive === 'boolean') {
    score += 4;
  } else if (resultObj.isActive !== undefined) {
    errors.push('Invalid isActive: must be boolean');
  }

  if (
    resultObj.roles &&
    Array.isArray(resultObj.roles) &&
    resultObj.roles.length >= 1
  ) {
    score += 4;
  } else if (resultObj.roles) {
    errors.push('Invalid roles: must be non-empty array');
  }

  // Validate nested profile object
  if (resultObj.profile && typeof resultObj.profile === 'object') {
    const profileFields = ['firstName', 'lastName', 'bio', 'website'];
    let validProfileFields = 0;
    const profile = resultObj.profile as Record<string, unknown>;

    for (const field of profileFields) {
      if (profile[field] && typeof profile[field] === 'string') {
        validProfileFields++;
      } else {
        errors.push(`Invalid profile.${field}: must be string`);
      }
    }

    score += (validProfileFields / profileFields.length) * 8;
  }

  // Validate preferences object
  if (resultObj.preferences && typeof resultObj.preferences === 'object') {
    const preferences = resultObj.preferences as Record<string, unknown>;

    if (
      preferences.theme &&
      ['light', 'dark', 'auto'].includes(preferences.theme as string)
    ) {
      score += 4;
    } else {
      errors.push('Invalid preferences.theme: must be light, dark, or auto');
    }

    if (preferences.language && typeof preferences.language === 'string') {
      score += 2;
    } else {
      errors.push('Invalid preferences.language: must be string');
    }

    if (typeof preferences.notifications === 'boolean') {
      score += 2;
    } else {
      errors.push('Invalid preferences.notifications: must be boolean');
    }
  }

  // Validate date fields
  if (
    resultObj.createdAt &&
    typeof resultObj.createdAt === 'string' &&
    resultObj.createdAt.includes('-')
  ) {
    score += 2;
  } else if (resultObj.createdAt) {
    errors.push('Invalid createdAt: must be date string');
  }

  if (
    resultObj.lastLogin &&
    typeof resultObj.lastLogin === 'string' &&
    resultObj.lastLogin.includes('-')
  ) {
    score += 2;
  } else if (resultObj.lastLogin) {
    errors.push('Invalid lastLogin: must be date string');
  }

  return {
    isValid: errors.length === 0,
    score: Math.min(Math.round(score), maxScore),
    errors,
  };
}

class ValidationHintsRunner extends BaseBenchmarkRunner {
  async run(model: string): Promise<void> {
    const config: BenchmarkConfig = {
      iterations: this.getIterations(model),
      inputTexts: userProfileSampleInputs,
      model,
    };

    try {
      console.log(`🚀 Running validation hints benchmark for ${model}...`);
      console.log(
        `📝 ${config.iterations} iterations with ${userProfileSampleInputs.length} input texts\n`
      );

      const results = await this.runComparison(
        config,
        userProfileJsonSchema,
        userProfileSchema,
        validateUserProfile
      );

      // Enhanced results display for validation hints
      console.log(`\n${'='.repeat(80)}`);
      console.log('VALIDATION HINTS BENCHMARK RESULTS');
      console.log('='.repeat(80));

      console.log(`\n📊 JSON Schema Results (${results.model}):`);
      console.log(
        `  Successful: ${results.jsonSchema.successfulIterations}/${results.jsonSchema.totalIterations}`
      );
      console.log(
        `  Average Input Tokens: ${results.jsonSchema.averageInputTokens}`
      );
      console.log(
        `  Average Output Tokens: ${results.jsonSchema.averageOutputTokens}`
      );
      console.log(
        `  Total Tokens: ${results.jsonSchema.totalInputTokens + results.jsonSchema.totalOutputTokens}`
      );
      console.log(`  Accuracy Score: ${results.jsonSchema.accuracyScore}%`);
      console.log(
        `  Average Response Time: ${results.jsonSchema.averageResponseTime}ms`
      );

      console.log(
        `\n🔍 StructLM with Validation Hints Results (${results.model}):`
      );
      console.log(
        `  Successful: ${results.structlm.successfulIterations}/${results.structlm.totalIterations}`
      );
      console.log(
        `  Average Input Tokens: ${results.structlm.averageInputTokens}`
      );
      console.log(
        `  Average Output Tokens: ${results.structlm.averageOutputTokens}`
      );
      console.log(
        `  Total Tokens: ${results.structlm.totalInputTokens + results.structlm.totalOutputTokens}`
      );
      console.log(`  Accuracy Score: ${results.structlm.accuracyScore}%`);
      console.log(
        `  Average Response Time: ${results.structlm.averageResponseTime}ms`
      );

      console.log('\n🔄 Comparison:');
      console.log(
        `  Token Savings: ${results.tokenSavings.totalTokens} (${results.tokenSavings.percentageSaved}%)`
      );
      console.log(
        `  Input Token Difference: ${results.tokenSavings.inputTokens > 0 ? '+' : ''}${results.tokenSavings.inputTokens}`
      );
      console.log(
        `  Output Token Difference: ${results.tokenSavings.outputTokens > 0 ? '+' : ''}${results.tokenSavings.outputTokens}`
      );
      console.log(
        `  Accuracy Difference: ${results.accuracyDifference > 0 ? '+' : ''}${results.accuracyDifference}%`
      );
      console.log(
        `  Performance Difference: ${results.performanceDifference > 0 ? '+' : ''}${results.performanceDifference}ms`
      );

      console.log(`\n${'='.repeat(80)}`);
      console.log('💡 Key Insights:');
      console.log(
        `  • StructLM with validation hints saves ${results.tokenSavings.percentageSaved}% tokens vs JSON Schema`
      );
      console.log(
        `  • Validation hints provide clear constraints while maintaining efficiency`
      );
      console.log(
        `  • Accuracy difference: ${results.accuracyDifference > 0 ? '+' : ''}${results.accuracyDifference}% compared to JSON Schema`
      );
      console.log('='.repeat(80));

      const filepath = saveResults(results, 'validation-hints');
      console.log(`\n💾 Results saved to: ${filepath}`);
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

async function createRunner(model: string): Promise<ValidationHintsRunner> {
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
      return new ValidationHintsRunner(client, haikuConfig.modelName);
    }
    case 'llama33': {
      const client = new Llama33Client(
        llama33Config.baseUrl,
        llama33Config.model
      );
      return new ValidationHintsRunner(client, llama33Config.modelName);
    }
    case 'phi4': {
      const client = new Phi4Client(phi4Config.baseUrl, phi4Config.model);
      return new ValidationHintsRunner(client, phi4Config.modelName);
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
    console.error('Usage: npm run benchmark:validation <model>');
    console.error('Example: npm run benchmark:validation haiku');
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
