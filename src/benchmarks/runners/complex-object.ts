#!/usr/bin/env node
import { config } from 'dotenv';
import { resolve } from 'path';
import { BaseBenchmarkRunner } from '../shared/base-runner';
import { orderSchema, orderJsonSchema } from '../shared/schemas';
import { printComparisonResults, saveResults } from '../shared/utils';
import { orderSampleInputs } from '../data/sample-inputs';
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

function validateOrder(result: any): ValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Check required top-level fields
  const requiredFields = [
    'order_id',
    'customer',
    'order_date',
    'status',
    'items',
    'payment',
    'shipping',
    'total_amount',
    'tax_amount',
    'discount_amount',
  ];
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
    if (
      result.customer.address &&
      typeof result.customer.address === 'object'
    ) {
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
      const itemFields = [
        'product_id',
        'name',
        'category',
        'price',
        'quantity',
        'discount_percent',
        'subtotal',
      ];
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
    const shippingFields = [
      'carrier',
      'tracking_number',
      'estimated_delivery',
      'shipping_cost',
    ];
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
    errors,
  };
}

class ComplexObjectRunner extends BaseBenchmarkRunner {
  async run(model: string): Promise<void> {
    const config: BenchmarkConfig = {
      iterations: this.getIterations(model),
      inputTexts: orderSampleInputs,
      model,
    };

    try {
      console.log(`Running complex object benchmark for ${model}...`);
      console.log(
        `${config.iterations} iterations with ${orderSampleInputs.length} input texts\n`
      );

      const results = await this.runComparison(
        config,
        orderJsonSchema,
        orderSchema,
        validateOrder
      );

      printComparisonResults(results);

      const filepath = saveResults(results, 'complex-object');
      console.log(`\nResults saved to: ${filepath}`);
    } catch (error) {
      console.error('Benchmark failed:', error);
      process.exit(1);
    }
  }

  private getIterations(model: string): number {
    const envVar = `${model.toUpperCase()}_BENCHMARK_ITERATIONS`;
    return parseInt(process.env[envVar] || '5');
  }
}

async function createRunner(model: string): Promise<ComplexObjectRunner> {
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
      return new ComplexObjectRunner(client, haikuConfig.modelName);
    }
    case 'llama33': {
      const client = new Llama33Client(
        llama33Config.apiKey,
        llama33Config.baseUrl,
        llama33Config.model
      );
      return new ComplexObjectRunner(client, llama33Config.modelName);
    }
    case 'phi4': {
      const client = new Phi4Client(
        phi4Config.apiKey,
        phi4Config.baseUrl,
        phi4Config.model
      );
      return new ComplexObjectRunner(client, phi4Config.modelName);
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
    console.error('Usage: npm run benchmark:complex <model>');
    console.error('Example: npm run benchmark:complex haiku');
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
