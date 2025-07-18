# StructLM vs JSON Schema Benchmark - Claude Sonnet

This benchmark compares the performance of StructLM's proprietary object notation against traditional JSON Schema when used with Claude Sonnet 4. It measures token usage, accuracy, and response time across multiple iterations.

## Overview

The benchmark uses the book catalog example from the [Anthropic Tool Use documentation](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview#json-mode) to extract structured data from natural language text.

## What's Compared

### JSON Schema Approach
- Uses traditional JSON Schema with detailed type definitions
- Requires explicit schema specification in the prompt
- Standard JSON Schema validation

### StructLM Approach  
- Uses StructLM's concise object notation: `{ books: [{ title: string, author: string, publication_year: number, genre: string, price: number, in_stock: boolean }] }`
- Leverages the proprietary notation designed for LLM clarity
- Type-safe TypeScript integration

## Metrics Collected

- **Token Usage**: Input and output token counts for each method
- **Accuracy**: Percentage score based on correct field extraction and types
- **Response Time**: Time taken for each API call
- **Success Rate**: Percentage of successful vs failed requests
- **Error Analysis**: Detailed error reporting for failed requests

## Setup

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Edit the `.env` file in `src/benchmarks/sonnet/.env`:
   ```bash
   # Required: Your Anthropic API key
   ANTHROPIC_API_KEY=your_api_key_here
   
   # Optional: Number of iterations per benchmark (default: 10)
   BENCHMARK_ITERATIONS=20
   ```

3. **Alternative: Use environment variables directly**:
   ```bash
   export ANTHROPIC_API_KEY=your_api_key_here
   export BENCHMARK_ITERATIONS=20  # Optional
   ```

## Running the Benchmark

### Quick Start
```bash
cd src/benchmarks/sonnet
npx tsx example-runner.ts
```

### Custom Configuration
```typescript
import { runComparison, BenchmarkConfig } from './benchmark-runner.js';

const config: BenchmarkConfig = {
  iterations: 25,
  apiKey: 'your-api-key',
  inputTexts: [
    'Your custom book catalog text here...',
    // Add more test cases
  ]
};

const results = await runComparison(config);
```

## Sample Output

```
Running benchmark with 10 iterations per method...
Using 5 different input texts

Running json-schema benchmark with 10 iterations...
  Iteration 1/10 (json-schema)
  Iteration 2/10 (json-schema)
  ...

Running structlm benchmark with 10 iterations...
  Iteration 1/10 (structlm)
  Iteration 2/10 (structlm)
  ...

============================================================
BENCHMARK RESULTS
============================================================

JSON Schema Results:
  Successful: 10/10
  Average Input Tokens: 245
  Average Output Tokens: 156
  Total Tokens: 4010
  Accuracy Score: 92%
  Average Response Time: 1847ms

StructLM Results:
  Successful: 10/10
  Average Input Tokens: 187
  Average Output Tokens: 152
  Total Tokens: 3390
  Accuracy Score: 95%
  Average Response Time: 1632ms

Comparison:
  Token Savings: 620 (15%)
  Input Token Difference: +580
  Output Token Difference: +40
  Accuracy Difference: +3%
  Performance Difference: +215ms
============================================================
```

## Understanding the Results

### Token Savings
- **Positive values**: StructLM uses fewer tokens
- **Input tokens**: Usually saved due to concise schema notation
- **Output tokens**: May vary based on model interpretation

### Accuracy Score
- **0-100%**: Based on correct field extraction and type validation
- **Validation criteria**:
  - Presence of required fields
  - Correct data types
  - Proper array structure
  - Valid JSON format

### Performance
- **Response time**: Milliseconds per API call
- **Success rate**: Percentage of successful completions
- **Error analysis**: Detailed breakdown of failure modes

## Test Data

The benchmark includes 5 different input text formats:
1. Narrative description
2. Structured inventory format
3. Colon-separated values
4. Mixed format with availability status
5. Dash-separated collection format

## Customization

### Adding New Test Cases
```typescript
const customInputTexts = [
  'Your book catalog text here...',
  'Another format...',
];
```

### Modifying Validation
Edit the `validateBookCatalog` function in `benchmark-runner.ts` to adjust accuracy scoring criteria.

### Different Schema Types
Create new comparison files following the pattern:
- `your-schema-example.ts` - Your approach
- `structlm-your-example.ts` - StructLM equivalent
- Update `benchmark-runner.ts` to include your comparison

## Files Structure

```
src/benchmarks/sonnet/
├── README.md                 # This file
├── benchmark-runner.ts       # Core benchmark logic
├── json-schema-example.ts    # JSON Schema implementation
├── structlm-example.ts       # StructLM implementation
└── example-runner.ts         # CLI runner script
```

## Rate Limiting

The benchmark includes a 1-second delay between requests to respect API rate limits. Adjust the delay in `benchmark-runner.ts` if needed.

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Edit the `.env` file and add your API key:
     ```bash
     ANTHROPIC_API_KEY=your_key_here
     ```
   - Or set it as an environment variable:
     ```bash
     export ANTHROPIC_API_KEY=your_key_here
     ```

2. **Rate Limiting**
   - Reduce iterations or increase delay
   - Check your API usage limits

3. **JSON Parsing Errors**
   - The benchmark handles markdown-wrapped JSON
   - Check the validation logic if custom schemas fail

4. **TypeScript Errors**
   - Ensure you're using Node.js with TypeScript support
   - Run `npm run typecheck` to validate

### Debug Mode
Add console logging to `benchmark-runner.ts` to see detailed API responses:

```typescript
console.log('API Response:', content.text);
```

## Contributing

To add new benchmark scenarios:
1. Create new example files following the existing pattern
2. Update the validation logic for your use case
3. Add new test data variations
4. Update this README with your scenario

## Results Storage

Benchmark results are automatically saved to `benchmark-results-[timestamp].json` for later analysis and comparison.