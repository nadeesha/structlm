# StructLM

**Structured output generation and data parsing tool geared towards LLMs.**

StructLM is a TypeScript library that helps you define JSON schemas with a clean, functional API and generate structured output descriptions for Large Language Models (LLMs). It provides a custom object notation format that is more readable and requires less input tokens.

## Why StructLM?

- **Compact schema definition**: StructLM uses a proprietary object notation that is more compact and requires less input tokens than JSON schemas.

- **More expressive validation**: StructLM uses serializable validation functions to validate data. These functions are then used to generate "hints" for LLMs, and to validate the output returned by LLMs.

- **No accuracy loss**: Despite being more compact, StructLM does not lose any accuracy when generating structured output, when compared to JSON schemas. See [BENCHMARKS.md](BENCHMARKS.md) for more details on our benchmarks.

# Benchmarks

This is a benchmark of StructLM vs JSON Schema, using Claude 3.5 Haiku. For the full benchmark, see [BENCHMARKS.md](BENCHMARKS.md).

![StructLM vs JSON Schema](./assets/haiku-bench.png)

### Simple Object
- JSON-Schema: 414 tokens (average)
- StructLM: 222 tokens (average)
- Reduction: 46.4% (average)
- Accuracy: Equal

### Complex Object
- JSON-Schema: 1460 tokens (average)
- StructLM: 610 tokens (average)
- Reduction: 58.2% (average)
- Accuracy: StructLM is slightly better (+0.4% on average)

### Schema with custom validations
- JSON-Schema: 852 tokens (average)
- StructLM: 480 tokens (average)
- Reduction: 43.7% (average)
- Accuracy: Equal

## Installation

```bash
npm install structlm
```

## Quick Start

```typescript
import { s } from 'structlm';

// Define a user schema
const userSchema = s.object({
  name: s.object({
    first: s.string(),
    last: s.string()
  }),
  age: s.number(),
  active: s.boolean(),
  tags: s.array(s.string())
});

// Generate schema description for LLM
console.log(userSchema.stringify());
// Output: "{ name: { first: string, last: string }, age: number, active: boolean, tags: [string] }"

// Parse and validate JSON data
const userData = userSchema.parse('{"name":{"first":"John","last":"Doe"},"age":30,"active":true,"tags":["developer","typescript"]}');
// Returns: { name: { first: "John", last: "Doe" }, age: 30, active: true, tags: ["developer", "typescript"] }
```

## API Reference

### Basic Types

#### `s.string()`
Creates a string schema.

```typescript
const nameSchema = s.string();
console.log(nameSchema.stringify()); // "string"

// Parse and validate a string
const name = nameSchema.parse('"John"'); // "John"
```

#### `s.number()`
Creates a number schema.

```typescript
const ageSchema = s.number();
console.log(ageSchema.stringify()); // "number"

// Parse and validate a number
const age = ageSchema.parse('25'); // 25
```

#### `s.boolean()`
Creates a boolean schema.

```typescript
const activeSchema = s.boolean();
console.log(activeSchema.stringify()); // "boolean"

// Parse and validate a boolean
const isActive = activeSchema.parse('true'); // true
```

### Complex Types

#### `s.array(itemSchema)`
Creates an array schema with specified item type.

```typescript
const numbersSchema = s.array(s.number());
console.log(numbersSchema.stringify()); // "[number]"

// Parse and validate an array
const numbers = numbersSchema.parse('[1, 2, 3, 4]'); // [1, 2, 3, 4]

const usersSchema = s.array(s.object({
  name: s.string(),
  age: s.number()
}));
console.log(usersSchema.stringify()); 
// "[ { name: string, age: number } ]"

// Parse complex array
const users = usersSchema.parse('[{"name":"John","age":30},{"name":"Jane","age":25}]');
// Returns: [{ name: "John", age: 30 }, { name: "Jane", age: 25 }]
```

#### `s.object(shape)`
Creates an object schema with specified properties.

```typescript
const personSchema = s.object({
  name: s.string(),
  age: s.number(),
  address: s.object({
    street: s.string(),
    city: s.string(),
    zipCode: s.string()
  })
});

console.log(personSchema.stringify());
// "{ name: string, age: number, address: { street: string, city: string, zipCode: string } }"

// Parse and validate an object
const person = personSchema.parse(`{
  "name": "John Doe",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "zipCode": "12345"
  }
}`);
// Returns typed object with validation
```

### Validation

#### `.validate(fn)`
Adds custom validation using a JavaScript function. 

```typescript
const emailSchema = s.string().validate(email => email.includes('@'));
const positiveNumberSchema = s.number().validate(n => n > 0);
const adultAgeSchema = s.number().validate(age => age >= 18);

// Chaining validation with schema definition
const userSchema = s.object({
  email: s.string().validate(email => email.includes('@')),
  age: s.number().validate(age => age >= 0),
  username: s.string().validate(name => name.length >= 3)
});
```

## LLM Integration Examples

### OpenAI Function Calling

```typescript
import { s } from 'structlm';

const extractUserInfoSchema = s.object({
  users: s.array(s.object({
    name: s.string(),
    age: s.number(),
    email: s.string().validate(email => email.includes('@')),
    skills: s.array(s.string())
  }))
});

const prompt = `
Extract user information from the following text and return it in this format:
${extractUserInfoSchema.stringify()}

Text: "John Doe is 25 years old, email john@example.com, knows JavaScript and Python. Jane Smith, age 30, jane@test.com, skilled in React and Node.js."
`;
```

### OpenRouter API Integration

```typescript
import { s } from 'structlm';

const analysisSchema = s.object({
  sentiment: s.string().validate(s => ['positive', 'negative', 'neutral'].includes(s)),
  confidence: s.number().validate(n => n >= 0 && n <= 1),
  topics: s.array(s.string()),
  summary: s.string(),
  actionItems: s.array(s.object({
    task: s.string(),
    priority: s.string().validate(p => ['high', 'medium', 'low'].includes(p)),
    assignee: s.string()
  }))
});

const prompt = `
Analyze this meeting transcript and return structured data in this format:
${analysisSchema.stringify()}

Transcript: "..."
`;
```

### Custom AI Model Integration

```typescript
import { s } from 'structlm';

const productSchema = s.object({
  name: s.string(),
  price: s.number().validate(p => p > 0),
  category: s.string(),
  inStock: s.boolean(),
  tags: s.array(s.string()),
  specifications: s.object({
    weight: s.number(),
    dimensions: s.object({
      width: s.number(),
      height: s.number(),
      depth: s.number()
    })
  })
});

// Use in your AI prompt
const systemPrompt = `
You are a product information extractor. Always return data in this exact format:
${productSchema.stringify()}

Ensure all validations are met:
- Price must be positive
- Include all required fields
- Use proper data types
`;
```

## Type Inference

StructLM provides full TypeScript type inference:

```typescript
import { s, Infer } from 'structlm';

const userSchema = s.object({
  name: s.string(),
  age: s.number(),
  active: s.boolean()
});

type User = Infer<typeof userSchema>;
// User = { name: string; age: number; active: boolean; }
```

## Advanced Examples

### Nested Complex Schema

```typescript
const apiResponseSchema = s.object({
  status: s.string().validate(s => ['success', 'error'].includes(s)),
  data: s.object({
    users: s.array(s.object({
      id: s.number(),
      profile: s.object({
        name: s.object({
          first: s.string(),
          last: s.string()
        }),
        contact: s.object({
          email: s.string().validate(email => email.includes('@')),
          phone: s.string()
        })
      }),
      permissions: s.array(s.string()),
      metadata: s.object({
        createdAt: s.string(),
        lastLogin: s.string(),
        loginCount: s.number().validate(n => n >= 0)
      })
    }))
  }),
  pagination: s.object({
    page: s.number().validate(n => n > 0),
    limit: s.number().validate(n => n > 0),
    total: s.number().validate(n => n >= 0)
  })
});

console.log(apiResponseSchema.stringify());
// Outputs clean, readable schema description
```

### Validation Examples

```typescript
// Email validation
const emailSchema = s.string().validate(email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
});

// Age validation
const ageSchema = s.number().validate(age => age >= 0 && age <= 120);

// Username validation
const usernameSchema = s.string().validate(username => {
  return username.length >= 3 && 
         username.length <= 20 && 
         /^[a-zA-Z0-9_]+$/.test(username);
});

// Complex object with multiple validations
const registrationSchema = s.object({
  username: usernameSchema,
  email: emailSchema,
  age: ageSchema,
  password: s.string().validate(pwd => pwd.length >= 8),
  confirmPassword: s.string(),
  acceptTerms: s.boolean().validate(accepted => accepted === true)
});
```

## Why StructLM?

- **LLM-Optimized**: The proprietary object notation is specifically designed to be clear and unambiguous for AI models
- **Lightweight**: Zero dependencies, focused solely on schema definition and output generation
- **Developer-Friendly**: Clean API, full TypeScript support, and comprehensive validation
- **Flexible**: Works with any LLM or AI service. (Reliability may vary)

## Contributing

We welcome contributions! Please open an issue or submit a pull request on GitHub.

## License

MIT License

## Support

- 🐛 [Report Issues](https://github.com/nadeesha/structlm/issues)
- 💡 [Feature Requests](https://github.com/nadeesha/structlm/discussions)
- 📖 [Documentation](https://github.com/nadeesha/structlm)
