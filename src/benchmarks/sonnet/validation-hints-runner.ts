import Anthropic from '@anthropic-ai/sdk';
import { s, Infer } from '../../index.js';

export interface BenchmarkConfig {
  iterations: number;
  apiKey: string;
  inputTexts: string[];
}

// User profile schema with JSON Schema compatible validations
export const userProfileSchemaWithValidation = s.object({
  id: s.string().validate(value => value.length >= 3),
  username: s.string().validate(value => value.length >= 2 && value.length <= 20),
  email: s.string().validate(value => value.includes('@') && value.includes('.')),
  age: s.number().validate(value => value >= 13 && value <= 120),
  isActive: s.boolean().validate(value => value === true || value === false),
  roles: s.array(s.string()).validate(arr => arr.length >= 1),
  profile: s.object({
    firstName: s.string().validate(value => value.length >= 1),
    lastName: s.string().validate(value => value.length >= 1),
    bio: s.string().validate(value => value.length <= 500),
    website: s.string().validate(value => value.startsWith('https://') || value.startsWith('http://'))
  }),
  preferences: s.object({
    theme: s.string().validate(value => ['light', 'dark', 'auto'].includes(value)),
    language: s.string().validate(value => value.length === 2),
    notifications: s.boolean()
  }),
  createdAt: s.string().validate(value => value.includes('-')),
  lastLogin: s.string().validate(value => value.includes('-'))
});


export type UserProfileType = Infer<typeof userProfileSchemaWithValidation>;

// JSON Schema equivalent for comparison
export const jsonSchemaDefinition = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 3 },
    username: { type: "string", minLength: 2, maxLength: 20 },
    email: { type: "string", format: "email" },
    age: { type: "number", minimum: 13, maximum: 120 },
    isActive: { type: "boolean" },
    roles: { 
      type: "array", 
      items: { type: "string" },
      minItems: 1
    },
    profile: {
      type: "object",
      properties: {
        firstName: { type: "string", minLength: 1 },
        lastName: { type: "string", minLength: 1 },
        bio: { type: "string", maxLength: 500 },
        website: { type: "string", format: "uri" }
      },
      required: ["firstName", "lastName", "bio", "website"]
    },
    preferences: {
      type: "object",
      properties: {
        theme: { type: "string", enum: ["light", "dark", "auto"] },
        language: { type: "string", minLength: 2, maxLength: 2 },
        notifications: { type: "boolean" }
      },
      required: ["theme", "language", "notifications"]
    },
    createdAt: { type: "string", format: "date-time" },
    lastLogin: { type: "string", format: "date-time" }
  },
  required: ["id", "username", "email", "age", "isActive", "roles", "profile", "preferences", "createdAt", "lastLogin"]
};

export interface BenchmarkResult {
  method: 'json-schema' | 'structlm-with-validation';
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
  structlmWithValidation: BenchmarkResult;
  tokenSavings: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    percentageSaved: number;
  };
  accuracyDifference: number;
  performanceDifference: number;
}

function validateUserProfile(result: any): { isValid: boolean; score: number; errors: string[] } {
  const errors: string[] = [];
  let score = 0;
  const maxScore = 100;

  // Required top-level fields
  const requiredFields = ['id', 'username', 'email', 'age', 'isActive', 'roles', 'profile', 'preferences', 'createdAt', 'lastLogin'];
  const baseScore = 60; // 60% for having all required fields
  
  let presentFields = 0;
  for (const field of requiredFields) {
    if (result[field] !== undefined && result[field] !== null) {
      presentFields++;
    } else {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  score += (presentFields / requiredFields.length) * baseScore;

  // Validate specific field types and constraints
  if (result.id && typeof result.id === 'string' && result.id.length >= 3) {
    score += 4;
  } else if (result.id) {
    errors.push('Invalid id: must be string with length >= 3');
  }

  if (result.username && typeof result.username === 'string' && result.username.length >= 2 && result.username.length <= 20) {
    score += 4;
  } else if (result.username) {
    errors.push('Invalid username: must be string with length 2-20');
  }

  if (result.email && typeof result.email === 'string' && result.email.includes('@')) {
    score += 4;
  } else if (result.email) {
    errors.push('Invalid email: must contain @');
  }

  if (result.age && typeof result.age === 'number' && result.age >= 13 && result.age <= 120) {
    score += 4;
  } else if (result.age) {
    errors.push('Invalid age: must be number between 13 and 120');
  }

  if (typeof result.isActive === 'boolean') {
    score += 4;
  } else if (result.isActive !== undefined) {
    errors.push('Invalid isActive: must be boolean');
  }

  if (Array.isArray(result.roles) && result.roles.length >= 1) {
    score += 4;
  } else if (result.roles) {
    errors.push('Invalid roles: must be non-empty array');
  }

  // Validate nested profile object
  if (result.profile && typeof result.profile === 'object') {
    const profileFields = ['firstName', 'lastName', 'bio', 'website'];
    let validProfileFields = 0;
    
    for (const field of profileFields) {
      if (result.profile[field] && typeof result.profile[field] === 'string') {
        validProfileFields++;
      } else {
        errors.push(`Invalid profile.${field}: must be string`);
      }
    }
    
    score += (validProfileFields / profileFields.length) * 8;
  }

  // Validate preferences object
  if (result.preferences && typeof result.preferences === 'object') {
    if (result.preferences.theme && ['light', 'dark', 'auto'].includes(result.preferences.theme)) {
      score += 4;
    } else {
      errors.push('Invalid preferences.theme: must be light, dark, or auto');
    }
    
    if (result.preferences.language && typeof result.preferences.language === 'string') {
      score += 2;
    } else {
      errors.push('Invalid preferences.language: must be string');
    }
    
    if (typeof result.preferences.notifications === 'boolean') {
      score += 2;
    } else {
      errors.push('Invalid preferences.notifications: must be boolean');
    }
  }

  // Validate date fields
  if (result.createdAt && typeof result.createdAt === 'string' && result.createdAt.includes('-')) {
    score += 2;
  } else if (result.createdAt) {
    errors.push('Invalid createdAt: must be date string');
  }

  if (result.lastLogin && typeof result.lastLogin === 'string' && result.lastLogin.includes('-')) {
    score += 2;
  } else if (result.lastLogin) {
    errors.push('Invalid lastLogin: must be date string');
  }

  return { 
    isValid: errors.length === 0, 
    score: Math.min(Math.round(score), maxScore), 
    errors 
  };
}

async function runJsonSchemaMethod(
  client: Anthropic,
  inputText: string
): Promise<{
  result: any;
  inputTokens: number;
  outputTokens: number;
}> {
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Extract user profile information from the following text and format it according to the JSON schema.

Input text: ${inputText}

Please respond with a JSON object that matches this schema:
${JSON.stringify(jsonSchemaDefinition, null, 2)}

Return only the JSON object, no additional text.`
      }
    ]
  });

  const content = response.content[0];
  if (!content || content.type !== 'text') {
    throw new Error('Expected text response');
  }

  let result: any;
  try {
    // Extract JSON from the response (in case it's wrapped in markdown)
    const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/) || 
                     content.text.match(/```\n([\s\S]*?)\n```/) ||
                     [null, content.text];
    
    const jsonText = jsonMatch[1] || content.text;
    result = JSON.parse(jsonText.trim());
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error}`);
  }

  return {
    result,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens
  };
}

async function runStructLMMethodWithValidation(
  client: Anthropic,
  inputText: string
): Promise<{
  result: UserProfileType;
  inputTokens: number;
  outputTokens: number;
}> {
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Extract user profile information from the following text and format it according to the schema.

Input text: ${inputText}

Please respond with a JSON object that matches this structure:
${userProfileSchemaWithValidation.toString()}

Return only the JSON object, no additional text.`
      }
    ]
  });

  const content = response.content[0];
  if (!content || content.type !== 'text') {
    throw new Error('Expected text response');
  }

  let result: UserProfileType;
  try {
    // Extract JSON from the response (in case it's wrapped in markdown)
    const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/) || 
                     content.text.match(/```\n([\s\S]*?)\n```/) ||
                     [null, content.text];
    
    const jsonText = jsonMatch[1] || content.text;
    result = JSON.parse(jsonText.trim());
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error}`);
  }

  return {
    result,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens
  };
}


async function runSingleBenchmark(
  client: Anthropic,
  method: 'json-schema' | 'structlm-with-validation',
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
    let result: any;
    
    if (method === 'json-schema') {
      const response = await runJsonSchemaMethod(client, inputText);
      result = response;
    } else {
      const response = await runStructLMMethodWithValidation(client, inputText);
      result = response;
    }
    
    const validation = validateUserProfile(result.result);
    
    return {
      success: true,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      responseTime: Date.now() - startTime,
      accuracyScore: validation.score
    };
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
  method: 'json-schema' | 'structlm-with-validation',
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
  console.log('Starting validation hints benchmark comparison...\n');
  
  const [jsonSchemaResult, structlmWithValidationResult] = await Promise.all([
    runBenchmark('json-schema', config),
    runBenchmark('structlm-with-validation', config)
  ]);

  const totalJsonTokens = jsonSchemaResult.totalInputTokens + jsonSchemaResult.totalOutputTokens;
  const totalStructLMTokens = structlmWithValidationResult.totalInputTokens + structlmWithValidationResult.totalOutputTokens;
  
  const tokenSavings = {
    inputTokens: jsonSchemaResult.totalInputTokens - structlmWithValidationResult.totalInputTokens,
    outputTokens: jsonSchemaResult.totalOutputTokens - structlmWithValidationResult.totalOutputTokens,
    totalTokens: totalJsonTokens - totalStructLMTokens,
    percentageSaved: totalJsonTokens > 0 ? Math.round(((totalJsonTokens - totalStructLMTokens) / totalJsonTokens) * 100) : 0
  };

  const accuracyDifference = structlmWithValidationResult.accuracyScore - jsonSchemaResult.accuracyScore;
  const performanceDifference = jsonSchemaResult.averageResponseTime - structlmWithValidationResult.averageResponseTime;

  return {
    jsonSchema: jsonSchemaResult,
    structlmWithValidation: structlmWithValidationResult,
    tokenSavings,
    accuracyDifference,
    performanceDifference
  };
}

export function printResults(comparison: ComparisonResult): void {
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION HINTS BENCHMARK RESULTS');
  console.log('='.repeat(80));
  
  console.log('\n📊 JSON Schema Results:');
  console.log(`  Successful: ${comparison.jsonSchema.successfulIterations}/${comparison.jsonSchema.totalIterations}`);
  console.log(`  Average Input Tokens: ${comparison.jsonSchema.averageInputTokens}`);
  console.log(`  Average Output Tokens: ${comparison.jsonSchema.averageOutputTokens}`);
  console.log(`  Total Tokens: ${comparison.jsonSchema.totalInputTokens + comparison.jsonSchema.totalOutputTokens}`);
  console.log(`  Accuracy Score: ${comparison.jsonSchema.accuracyScore}%`);
  console.log(`  Average Response Time: ${comparison.jsonSchema.averageResponseTime}ms`);
  
  console.log('\n🔍 StructLM with Validation Hints Results:');
  console.log(`  Successful: ${comparison.structlmWithValidation.successfulIterations}/${comparison.structlmWithValidation.totalIterations}`);
  console.log(`  Average Input Tokens: ${comparison.structlmWithValidation.averageInputTokens}`);
  console.log(`  Average Output Tokens: ${comparison.structlmWithValidation.averageOutputTokens}`);
  console.log(`  Total Tokens: ${comparison.structlmWithValidation.totalInputTokens + comparison.structlmWithValidation.totalOutputTokens}`);
  console.log(`  Accuracy Score: ${comparison.structlmWithValidation.accuracyScore}%`);
  console.log(`  Average Response Time: ${comparison.structlmWithValidation.averageResponseTime}ms`);
  
  console.log('\n🔄 Comparison:');
  console.log(`  Token Savings: ${comparison.tokenSavings.totalTokens} (${comparison.tokenSavings.percentageSaved}%)`);
  console.log(`  Input Token Difference: ${comparison.tokenSavings.inputTokens > 0 ? '+' : ''}${comparison.tokenSavings.inputTokens}`);
  console.log(`  Output Token Difference: ${comparison.tokenSavings.outputTokens > 0 ? '+' : ''}${comparison.tokenSavings.outputTokens}`);
  console.log(`  Accuracy Difference: ${comparison.accuracyDifference > 0 ? '+' : ''}${comparison.accuracyDifference}%`);
  console.log(`  Performance Difference: ${comparison.performanceDifference > 0 ? '+' : ''}${comparison.performanceDifference}ms`);
  
  // Show any errors
  if (comparison.jsonSchema.errors.length > 0) {
    console.log('\n❌ JSON Schema Errors:');
    comparison.jsonSchema.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (comparison.structlmWithValidation.errors.length > 0) {
    console.log('\n❌ StructLM with Validation Errors:');
    comparison.structlmWithValidation.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('💡 Key Insights:');
  console.log(`  • StructLM with validation hints saves ${comparison.tokenSavings.percentageSaved}% tokens vs JSON Schema`);
  console.log(`  • Validation hints provide clear constraints while maintaining efficiency`);
  console.log(`  • Accuracy difference: ${comparison.accuracyDifference > 0 ? '+' : ''}${comparison.accuracyDifference}% compared to JSON Schema`);
  console.log('='.repeat(80));
}