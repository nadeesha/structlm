# StructLM

**Structured output generation and data parsing tool geared towards LLMs.**

StructLM is a TypeScript library that helps you define JSON schemas with a clean, functional API and generate structured output descriptions for Large Language Models (LLMs). It provides a proprietary object notation format that's perfect for prompt engineering and data validation.

## Features

- 🎯 **LLM-focused**: Designed specifically for structured output generation with AI models
- 🔧 **Simple API**: Clean, functional interface for defining schemas  
- 📝 **Proprietary Notation**: Custom object notation format for clear AI communication
- ✅ **Custom Validation**: JavaScript function-based validation system
- 🚀 **TypeScript First**: Full type safety and inference
- 📦 **Zero Dependencies**: Lightweight and focused

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
console.log(userSchema.toString());
// Output: "{ name: { first: string, last: string }, age: number, active: boolean, tags: [string] }"
```

## API Reference

### Basic Types

#### `s.string()`
Creates a string schema.

```typescript
const nameSchema = s.string();
console.log(nameSchema.toString()); // "string"
```

#### `s.number()`
Creates a number schema.

```typescript
const ageSchema = s.number();
console.log(ageSchema.toString()); // "number"
```

#### `s.boolean()`
Creates a boolean schema.

```typescript
const activeSchema = s.boolean();
console.log(activeSchema.toString()); // "boolean"
```

### Complex Types

#### `s.array(itemSchema)`
Creates an array schema with specified item type.

```typescript
const numbersSchema = s.array(s.number());
console.log(numbersSchema.toString()); // "[number]"

const usersSchema = s.array(s.object({
  name: s.string(),
  age: s.number()
}));
console.log(usersSchema.toString()); 
// "[ { name: string, age: number } ]"
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

console.log(personSchema.toString());
// "{ name: string, age: number, address: { street: string, city: string, zipCode: string } }"
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
${extractUserInfoSchema.toString()}

Text: "John Doe is 25 years old, email john@example.com, knows JavaScript and Python. Jane Smith, age 30, jane@test.com, skilled in React and Node.js."
`;
```

### Anthropic Claude Structured Output

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
${analysisSchema.toString()}

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
${productSchema.toString()}

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

console.log(apiResponseSchema.toString());
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
- **Flexible**: Works with any LLM or AI service that accepts structured prompts

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 🐛 [Report Issues](https://github.com/your-org/structlm/issues)
- 💡 [Feature Requests](https://github.com/your-org/structlm/discussions)
- 📖 [Documentation](https://github.com/your-org/structlm/wiki)

---

Built with ❤️ for the AI development community.