# StructLM Benchmarks

This document describes the benchmarking methodology and results for comparing JSON Schema and StructLM approaches for structured output generation with Large Language Models.

- Source code: [./src/benchmarks](./src/benchmarks)
- Latest results: [./benchmark-results](./benchmark-results)

## Overview

StructLM is a library for structured output generation and data parsing, designed specifically for LLMs. These benchmarks compare two approaches:

1. **JSON Schema**: Traditional approach using verbose JSON Schema definitions
2. **StructLM**: Compact TypeScript-like syntax with embedded validation hints

## Benchmark Types

### 1. Simple Object (`simple-object`) 

Tests basic object extraction with [simple data types](./src/benchmarks/runners/simple-object.ts).

**Test Schema**: Book catalog extraction
- Fields: title, author, publication_year, genre, price, in_stock
- Complexity: Low - simple flat object structure
- Iterations: 500 per method

### 2. Complex Object (`complex-object`) 

Tests complex nested object extraction with [multiple levels of nesting](./src/benchmarks/runners/complex-object.ts).

**Test Schema**: E-commerce order processing
- Fields: Nested customer, payment, shipping, and item details
- Complexity: High - deeply nested objects with arrays
- Iterations: 500 per method

### 3. Validation Hints (`validation-hints`)

Tests validation-enhanced schemas with [type constraints](./src/benchmarks/runners/validation-hints.ts).

**Test Schema**: User profile with validation rules
- Fields: User data with embedded validation constraints
- Complexity: Medium - validation rules like email format, age ranges, string lengths
- Iterations: 500 per method

## Methodology

### Test Process
1. **Dual Method Testing**: Each benchmark runs both JSON Schema and StructLM approaches
2. **Parallel Execution**: Tests run in batches of 10 concurrent requests
3. **Rate Limiting**: 500ms delay between batches to avoid API throttling
4. **Random Cache Busting**: Each request includes a unique ID to prevent caching
5. **Validation Scoring**: Custom validation functions assess output accuracy

### Prompt Structure
Both methods use similar prompt templates:

**JSON Schema**:
```
Extract information from the following text and format it according to the JSON schema.

Input text: {input_text}

Please respond with a JSON object that matches this schema:
{full_json_schema}

Return only the JSON object, no additional text.
```

**StructLM**:
```
Extract information from the following text and format it according to the schema.

Input text: {input_text}

Please respond with a JSON object that matches this structure:
{compact_structlm_schema}

Return only the JSON object, no additional text.
```

### Metrics Collected
- **Success Rate**: Percentage of valid JSON responses
- **Accuracy Score**: Custom validation score (0-100)
- **Token Usage**: Input and output tokens consumed
- **Response Time**: API response latency in milliseconds
- **Error Analysis**: Detailed error categorization

## Models Tested

### Claude 3.5 Haiku (`haiku`)
- **Provider**: Anthropic via OpenRouter
- **Model ID**: `anthropic/claude-3.5-haiku`

### Llama 3.3 70B (`llama33`)
- **Provider**: Meta via OpenRouter  
- **Model ID**: `meta-llama/llama-3.3-70b-instruct`

### Microsoft Phi-4 (`phi4`)
- **Provider**: Microsoft via OpenRouter
- **Model ID**: `microsoft/phi-4`

## Results Summary

### Simple Object Benchmark

| Model | Method | Success Rate | Accuracy | Token Savings | Avg Response Time |
|-------|--------|-------------|----------|---------------|------------------|
| **Haiku** | JSON Schema | 99.8% | 100% | - | 5,164ms |
| **Haiku** | StructLM | 100% | 100% | **29%** | 6,636ms |
| **Llama 3.3** | JSON Schema | 98.8% | 99% | - | 12,440ms |
| **Llama 3.3** | StructLM | 99.0% | 99% | **27%** | 13,762ms |
| **Phi-4** | JSON Schema | 100% | 100% | - | 9,841ms |
| **Phi-4** | StructLM | 100% | 100% | **27%** | 10,933ms |

### Complex Object Benchmark

| Model | Method | Success Rate | Accuracy | Token Savings | Avg Response Time |
|-------|--------|-------------|----------|---------------|------------------|
| **Haiku** | JSON Schema | 99.2% | 63% | - | 9,205ms |
| **Haiku** | StructLM | 99.4% | 64% | **42%** | 9,274ms |
| **Llama 3.3** | JSON Schema | 98.6% | 63% | - | 21,218ms |
| **Llama 3.3** | StructLM | 99.8% | 64% | **39%** | 22,870ms |
| **Phi-4** | JSON Schema | 99.4% | 64% | - | 21,932ms |
| **Phi-4** | StructLM | 98.8% | 63% | **40%** | 17,078ms |

### Validation Hints Benchmark

| Model | Method | Success Rate | Accuracy | Token Savings | Avg Response Time |
|-------|--------|-------------|----------|---------------|------------------|
| **Haiku** | JSON Schema | 100% | 100% | - | 4,627ms |
| **Haiku** | StructLM | 99.8% | 100% | **36%** | 5,618ms |
| **Llama 3.3** | JSON Schema | 99.8% | 100% | - | 10,781ms |
| **Llama 3.3** | StructLM | 100% | 100% | **34%** | 11,191ms |
| **Phi-4** | JSON Schema | 100% | 100% | - | 6,186ms |
| **Phi-4** | StructLM | 100% | 100% | **34%** | 6,378ms |

## Performance Comparison Summary

| Benchmark | Metric | JSON Schema | StructLM | StructLM Advantage |
|-----------|--------|-------------|----------|-------------------|
| **Simple Object** | Avg Success Rate | 99.5% | 99.7% | +0.2% |
| **Simple Object** | Avg Accuracy | 99.7% | 99.7% | Equal |
| **Simple Object** | Avg Token Savings | - | 27.7% | **-27.7%** |
| **Simple Object** | Avg Response Time | 9.1s | 10.4s | -1.3s |
| **Complex Object** | Avg Success Rate | 98.7% | 99.3% | +0.6% |
| **Complex Object** | Avg Accuracy | 63.3% | 63.7% | +0.4% |
| **Complex Object** | Avg Token Savings | - | 40.3% | **-40.3%** |
| **Complex Object** | Avg Response Time | 17.5s | 16.4s | **+1.1s** |
| **Validation Hints** | Avg Success Rate | 99.9% | 99.9% | Equal |
| **Validation Hints** | Avg Accuracy | 100% | 100% | Equal |
| **Validation Hints** | Avg Token Savings | - | 34.7% | **-34.7%** |
| **Validation Hints** | Avg Response Time | 7.2s | 7.7s | -0.5s |

## Conclusion

Based on comprehensive benchmarking across three models and three complexity levels, **StructLM demonstrates clear advantages as a viable alternative to JSON Schema** for LLM-based structured output generation.

1. **Significant Cost Reduction**: StructLM consistently achieves **27-42% token savings** across all models and task complexities, directly translating to reduced API costs.

2. **Maintained or Improved Accuracy**: StructLM matches or exceeds JSON Schema accuracy in most scenarios:
   - Simple tasks: Equal performance (99.7% accuracy)
   - Complex tasks: Slight improvement (+0.4% accuracy)
   - Validation tasks: Perfect parity (100% accuracy)

3. **Better Success Rates**: StructLM shows marginally higher success rates, particularly on complex objects (+0.6%).

4. **Improved Performance on Complex Tasks**: StructLM actually performs faster on complex object extraction (+1.1s improvement).

## Running Benchmarks

### Prerequisites
```bash
npm install
```

Set environment variables:
```bash
OPENROUTER_API_KEY=your_api_key_here
```

### Available Commands
```bash
# Simple object benchmark
npm run benchmark:simple haiku
npm run benchmark:simple llama33
npm run benchmark:simple phi4

# Complex object benchmark  
npm run benchmark:complex haiku
npm run benchmark:complex llama33
npm run benchmark:complex phi4

# Validation hints benchmark
npm run benchmark:validation haiku
npm run benchmark:validation llama33
npm run benchmark:validation phi4
```

### Output
Results are saved to `benchmark-results/` directory with timestamps:
- `{benchmark-type}-{model}-results-{timestamp}.json`

## Data Structure

### Benchmark Result Format
```typescript
interface ComparisonResult {
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
```

### Individual Benchmark Metrics
```typescript
interface BenchmarkResult {
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
```

## Contributing

To add new benchmark types:

1. Create new runner in `src/benchmarks/runners/`
2. Extend `BaseBenchmarkRunner` class
3. Implement validation function for your schema
4. Add npm script in `package.json`
5. Update this documentation
