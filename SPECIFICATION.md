# StructLM Serialization Specification

This document specifies how StructLM serializes JSON schema definitions into compact string representations.

## Overview

StructLM transforms schema definitions into TypeScript-like syntax with embedded validation hints. The serialization produces compact strings optimized for LLM consumption.

## Serialization Rules

### Primitive Types

#### String Type
- **Basic**: `string`
- **With validation**: `string /* validationFunction */`

```typescript
s.string().stringify()
// Output: "string"

s.string().validate(value => value.length > 0).stringify()
// Output: "string /* value=>value.length>0 */"
```

#### Number Type
- **Basic**: `number`
- **With validation**: `number /* validationFunction */`

```typescript
s.number().stringify()
// Output: "number"

s.number().validate(n => n > 0).stringify()
// Output: "number /* n=>n>0 */"
```

#### Boolean Type
- **Basic**: `boolean`  
- **With validation**: `boolean /* validationFunction */`

```typescript
s.boolean().stringify()
// Output: "boolean"

s.boolean().validate(b => b === true).stringify()
// Output: "boolean /* b=>b===true */"
```

### Complex Types

#### Array Type
- **Format**: `[itemType]`
- **With validation**: `[itemType] /* validationFunction */`

```typescript
s.array(s.string()).stringify()
// Output: "[string]"

s.array(s.number()).stringify()
// Output: "[number]"

s.array(s.string()).validate(arr => arr.length > 0).stringify()
// Output: "[string] /* arr=>arr.length>0 */"

// Nested arrays
s.array(s.array(s.number())).stringify()
// Output: "[[number]]"
```

#### Object Type
- **Format**: `{ key1: type1, key2: type2, ... }`
- **With validation**: `{ key1: type1, key2: type2, ... } /* validationFunction */`

```typescript
s.object({
  name: s.string(),
  age: s.number()
}).stringify()
// Output: "{ name: string, age: number }"

s.object({
  user: s.object({
    name: s.string(),
    email: s.string()
  }),
  active: s.boolean()
}).stringify()
// Output: "{ user: { name: string, email: string }, active: boolean }"
```

### Validation Function Serialization

Validation functions are serialized using `Function.prototype.toString()` within `/* */` comments:

```typescript
// Input function
(value) => value.length >= 3 && value.length <= 20

// Serialized output
"value=>value.length>=3&&value.length<=20"
```

#### Common Validation Patterns

```typescript
// String length
s.string().validate(value => value.length >= 3).stringify()
// "string /* value=>value.length>=3 */"

// Email pattern
s.string().validate(value => value.includes('@') && value.includes('.')).stringify()
// "string /* value=>value.includes("@")&&value.includes(".") */"

// Number range
s.number().validate(value => value >= 0 && value <= 100).stringify()
// "number /* value=>value>=0&&value<=100 */"

// Array length
s.array(s.string()).validate(arr => arr.length > 0).stringify()
// "[string] /* arr=>arr.length>0 */"

// Enum validation
s.string().validate(value => ['red', 'green', 'blue'].includes(value)).stringify()
// "string /* value=>["red","green","blue"].includes(value) */"
```

### Optional Fields

Optional fields are marked with the `optional` keyword in validation comments, alongside any validation functions:

#### Basic Optional Fields
```typescript
s.string().optional().stringify()
// Output: "string /* optional */"

s.number().optional().stringify()
// Output: "number /* optional */"

s.boolean().optional().stringify()
// Output: "boolean /* optional */"

s.array(s.string()).optional().stringify()
// Output: "[string] /* optional */"
```

#### Optional Fields with Validation
When both validation and optional are present, they are combined with comma separation:

```typescript
s.string().validate(value => value.length > 0).optional().stringify()
// Output: "string /* value=>value.length>0, optional */"

s.string().optional().validate(value => value.includes('@')).stringify()
// Output: "string /* value=>value.includes("@"), optional */"

s.number().validate(n => n >= 0 && n <= 100).optional().stringify()
// Output: "number /* n=>n>=0&&n<=100, optional */"
```

#### Optional Objects and Arrays
Complex types can also be optional:

```typescript
s.object({
  name: s.string(),
  age: s.number()
}).optional().stringify()
// Output: "{ name: string, age: number } /* optional */"

s.array(s.object({
  id: s.string(),
  value: s.number()
})).validate(arr => arr.length > 0).optional().stringify()
// Output: "[{ id: string, value: number }] /* arr=>arr.length>0, optional */"
```

### Parsing Behavior for Optional Fields

Optional fields modify parsing behavior:
- **Present in input**: Field is validated normally
- **Missing from input**: Field is omitted from the result (no validation performed)
- **Required fields missing**: Throws validation error

```typescript
const schema = s.object({
  name: s.string(),
  age: s.number().optional(),
  email: s.string().validate(e => e.includes('@')).optional()
});

// All valid inputs:
schema.parse('{"name":"John"}');                                    // { name: "John" }
schema.parse('{"name":"John","age":30}');                          // { name: "John", age: 30 }
schema.parse('{"name":"John","email":"john@example.com"}');        // { name: "John", email: "john@example.com" }
schema.parse('{"name":"John","age":30,"email":"john@example.com"}'); // All fields present
```

## Formatting Rules

### Spacing
- Object properties separated by `, ` (comma + space)
- Single space before and after `/* */` validation comments
- No additional whitespace for nested structures

### Property Ordering
Properties maintain the order defined in the schema:

```typescript
s.object({
  id: s.string(),
  name: s.string(), 
  email: s.string()
}).stringify()
// Output: "{ id: string, name: string, email: string }"
```

### No Trailing Elements
- No trailing commas
- Clean, compact syntax

## Complete Examples

### Simple Object
```typescript
const userSchema = s.object({
  name: s.string().validate(value => value.length > 0),
  age: s.number().validate(value => value >= 0 && value <= 120),
  email: s.string().validate(value => value.includes('@')),
  active: s.boolean()
});

userSchema.stringify()
```

**Output**:
```
{ 
  name: string /* value=>value.length>0 */, 
  age: number /* value=>value>=0&&value<=120 */, 
  email: string /* value=>value.includes("@") */, 
  active: boolean 
}
```

### Complex Nested Object
```typescript
const orderSchema = s.object({
  id: s.string(),
  customer: s.object({
    name: s.string(),
    address: s.object({
      street: s.string(),
      city: s.string()
    })
  }),
  items: s.array(
    s.object({
      name: s.string(),
      price: s.number().validate(value => value > 0),
      quantity: s.number()
    })
  )
});

orderSchema.stringify()
```

**Output**:
```
{ 
  id: string, 
  customer: { 
    name: string, 
    address: { street: string, city: string } 
  }, 
  items: [{ 
    name: string, 
    price: number /* value=>value>0 */, 
    quantity: number 
  }] 
}
```

### Array of Objects with Validation
```typescript
const booksSchema = s.object({
  books: s.array(
    s.object({
      title: s.string(),
      author: s.string(),
      year: s.number(),
      inStock: s.boolean()
    })
  ).validate(arr => arr.length > 0)
});

booksSchema.stringify()
```

**Output**:
```
{ 
  books: [{ 
    title: string, 
    author: string, 
    year: number, 
    inStock: boolean 
  }] /* arr=>arr.length>0 */ }
```

### Object with Optional Fields
```typescript
const userProfileSchema = s.object({
  id: s.string(),
  username: s.string().validate(value => value.length >= 3),
  email: s.string().validate(value => value.includes('@')),
  age: s.number().validate(value => value >= 18).optional(),
  bio: s.string().validate(value => value.length <= 500).optional(),
  avatar: s.string().optional(),
  preferences: s.object({
    theme: s.string().validate(value => ['light', 'dark'].includes(value)),
    notifications: s.boolean().optional()
  }).optional(),
  tags: s.array(s.string()).validate(arr => arr.length <= 10).optional()
});

userProfileSchema.stringify()
```

**Output**:
```
{ 
  id: string, 
  username: string /* value=>value.length>=3 */, 
  email: string /* value=>value.includes("@") */, 
  age: number /* value=>value>=18, optional */, 
  bio: string /* value=>value.length<=500, optional */, 
  avatar: string /* optional */, 
  preferences: { 
    theme: string /* value=>["light","dark"].includes(value) */, 
    notifications: boolean /* optional */ 
  } /* optional */, 
  tags: [string] /* arr=>arr.length<=10, optional */ 
}
```

This example demonstrates:
- **Required fields**: `id`, `username`, `email`
- **Optional fields with validation**: `age`, `bio`, `tags`
- **Optional fields without validation**: `avatar`
- **Optional nested objects**: `preferences`
- **Optional fields within nested objects**: `notifications`

## Token Efficiency

StructLM serialization achieves significant token reduction compared to JSON Schema:

**JSON Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "age": { "type": "number", "minimum": 0, "maximum": 120 }
  },
  "required": ["name", "age"]
}
```

**StructLM**:
```
{ 
  name: string /* value=>value.length>=1 */,
  age: number /* value=>value>=0&&value<=120 */ 
}
```
