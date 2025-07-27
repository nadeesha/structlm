# Scripts

This directory contains utility scripts for StructLM development and testing.

## Available Scripts

### `integration-test.sh`

A comprehensive integration test script that:

1. **Sets up a new npm project** in `/tmp/structlm-integration-test`
2. **Installs StructLM** and required dependencies
3. **Runs complex object experiments** including:
   - Schema stringification with nested objects and validations
   - Valid data parsing and validation
   - Invalid data rejection testing
   - TypeScript type safety verification
   - Round-trip testing (stringify → parse → stringify)

**Usage:**
```bash
./scripts/integration-test.sh
```

**What it tests:**
- Complex nested schema with multiple validation rules
- E-commerce order schema with customer, items, shipping, payment, and metadata
- Custom validation functions (email format, price validation, etc.)
- Array validation with min/max constraints
- Type inference and TypeScript integration
- Error handling for invalid data
