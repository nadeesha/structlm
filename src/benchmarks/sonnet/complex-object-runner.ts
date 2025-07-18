import Anthropic from '@anthropic-ai/sdk';
import { s, Infer } from '../../index.js';

export interface BenchmarkConfig {
  iterations: number;
  apiKey: string;
  inputTexts: string[];
}

// Complex e-commerce order schema using StructLM
export const orderSchema = s.object({
  order_id: s.string(),
  customer: s.object({
    name: s.string(),
    email: s.string(),
    address: s.object({
      street: s.string(),
      city: s.string(),
      state: s.string(),
      zip_code: s.string(),
      country: s.string()
    })
  }),
  order_date: s.string(),
  status: s.string(),
  items: s.array(s.object({
    product_id: s.string(),
    name: s.string(),
    category: s.string(),
    price: s.number(),
    quantity: s.number(),
    discount_percent: s.number(),
    subtotal: s.number()
  })),
  payment: s.object({
    method: s.string(),
    transaction_id: s.string(),
    billing_address: s.object({
      street: s.string(),
      city: s.string(),
      state: s.string(),
      zip_code: s.string(),
      country: s.string()
    })
  }),
  shipping: s.object({
    carrier: s.string(),
    tracking_number: s.string(),
    estimated_delivery: s.string(),
    shipping_cost: s.number()
  }),
  total_amount: s.number(),
  tax_amount: s.number(),
  discount_amount: s.number()
});

export type OrderType = Infer<typeof orderSchema>;

// JSON Schema equivalent
export const jsonSchemaDefinition = {
  type: "object",
  properties: {
    order_id: { type: "string" },
    customer: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        address: {
          type: "object",
          properties: {
            street: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            zip_code: { type: "string" },
            country: { type: "string" }
          },
          required: ["street", "city", "state", "zip_code", "country"]
        }
      },
      required: ["name", "email", "address"]
    },
    order_date: { type: "string" },
    status: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          product_id: { type: "string" },
          name: { type: "string" },
          category: { type: "string" },
          price: { type: "number" },
          quantity: { type: "number" },
          discount_percent: { type: "number" },
          subtotal: { type: "number" }
        },
        required: ["product_id", "name", "category", "price", "quantity", "discount_percent", "subtotal"]
      }
    },
    payment: {
      type: "object",
      properties: {
        method: { type: "string" },
        transaction_id: { type: "string" },
        billing_address: {
          type: "object",
          properties: {
            street: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            zip_code: { type: "string" },
            country: { type: "string" }
          },
          required: ["street", "city", "state", "zip_code", "country"]
        }
      },
      required: ["method", "transaction_id", "billing_address"]
    },
    shipping: {
      type: "object",
      properties: {
        carrier: { type: "string" },
        tracking_number: { type: "string" },
        estimated_delivery: { type: "string" },
        shipping_cost: { type: "number" }
      },
      required: ["carrier", "tracking_number", "estimated_delivery", "shipping_cost"]
    },
    total_amount: { type: "number" },
    tax_amount: { type: "number" },
    discount_amount: { type: "number" }
  },
  required: ["order_id", "customer", "order_date", "status", "items", "payment", "shipping", "total_amount", "tax_amount", "discount_amount"]
};

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

function validateOrder(result: any): { isValid: boolean; score: number; errors: string[] } {
  const errors: string[] = [];
  let score = 0;

  // Check required top-level fields
  const requiredFields = ['order_id', 'customer', 'order_date', 'status', 'items', 'payment', 'shipping', 'total_amount', 'tax_amount', 'discount_amount'];
  const fieldPoints = 100 / requiredFields.length;
  
  for (const field of requiredFields) {
    if (result[field] !== undefined && result[field] !== null) {
      score += fieldPoints * 0.5; // 50% for presence
    } else {
      errors.push(`Missing ${field}`);
      continue;
    }
  }

  // Validate customer object
  if (result.customer && typeof result.customer === 'object') {
    const customerFields = ['name', 'email', 'address'];
    for (const field of customerFields) {
      if (result.customer[field] !== undefined) {
        score += fieldPoints * 0.1;
      } else {
        errors.push(`Missing customer.${field}`);
      }
    }
    
    // Validate customer address
    if (result.customer.address && typeof result.customer.address === 'object') {
      const addressFields = ['street', 'city', 'state', 'zip_code', 'country'];
      for (const field of addressFields) {
        if (result.customer.address[field] !== undefined) {
          score += fieldPoints * 0.02;
        } else {
          errors.push(`Missing customer.address.${field}`);
        }
      }
    }
  }

  // Validate items array
  if (result.items && Array.isArray(result.items)) {
    if (result.items.length > 0) {
      score += fieldPoints * 0.2;
      
      // Check first item structure
      const item = result.items[0];
      const itemFields = ['product_id', 'name', 'category', 'price', 'quantity', 'discount_percent', 'subtotal'];
      for (const field of itemFields) {
        if (item[field] !== undefined) {
          score += fieldPoints * 0.02;
        } else {
          errors.push(`Missing items[0].${field}`);
        }
      }
    } else {
      errors.push('Empty items array');
    }
  }

  // Validate payment object
  if (result.payment && typeof result.payment === 'object') {
    const paymentFields = ['method', 'transaction_id', 'billing_address'];
    for (const field of paymentFields) {
      if (result.payment[field] !== undefined) {
        score += fieldPoints * 0.05;
      } else {
        errors.push(`Missing payment.${field}`);
      }
    }
  }

  // Validate shipping object
  if (result.shipping && typeof result.shipping === 'object') {
    const shippingFields = ['carrier', 'tracking_number', 'estimated_delivery', 'shipping_cost'];
    for (const field of shippingFields) {
      if (result.shipping[field] !== undefined) {
        score += fieldPoints * 0.05;
      } else {
        errors.push(`Missing shipping.${field}`);
      }
    }
  }

  // Type validation for numeric fields
  if (typeof result.total_amount === 'number') score += fieldPoints * 0.1;
  if (typeof result.tax_amount === 'number') score += fieldPoints * 0.1;
  if (typeof result.discount_amount === 'number') score += fieldPoints * 0.1;

  return { 
    isValid: errors.length === 0, 
    score: Math.round(Math.min(score, 100)), 
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
        content: `Extract order information from the following text and format it according to the JSON schema.

Input text: ${inputText}

Please respond with a JSON object that matches this schema:
${JSON.stringify(jsonSchemaDefinition, null, 2)}`
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

async function runStructLMMethod(
  client: Anthropic,
  inputText: string
): Promise<{
  result: OrderType;
  inputTokens: number;
  outputTokens: number;
}> {
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Extract order information from the following text and format it according to the schema.

Input text: ${inputText}

Please respond with a JSON object that matches this structure:
${orderSchema.toString()}

Return only the JSON object, no additional text.`
      }
    ]
  });

  const content = response.content[0];
  if (!content || content.type !== 'text') {
    throw new Error('Expected text response');
  }

  let result: OrderType;
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
      const result = await runJsonSchemaMethod(client, inputText);
      const validation = validateOrder(result.result);
      
      return {
        success: true,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        responseTime: Date.now() - startTime,
        accuracyScore: validation.score
      };
    } else {
      const result = await runStructLMMethod(client, inputText);
      const validation = validateOrder(result.result);
      
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